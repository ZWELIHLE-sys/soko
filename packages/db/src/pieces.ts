import { prisma } from './index'

/**
 * Piece lifecycle:
 *
 *   created (MARKET, no marketListings)  → assignPieceToMarket → MARKET (with MarketListing)
 *                                        → movePieceToAuction  → AUCTION (with Auction)
 *                                        → movePieceToShop     → SHOP (with Product)
 *                                        → markPieceSold       → SOLD
 *
 *   Seller can retirePiece at MARKET or SHOP (blocked at AUCTION + SOLD).
 *
 *   Each "move" creates the actual record (MarketListing / Auction / Product) AND advances
 *   the Piece's currentStage. Without those records, the piece is invisible to buyers.
 */

export async function assignPieceToMarket(
  pieceId: string,
  marketId: string,
  opts: { stallMessage?: string; marketPrice?: number; stallNumber?: number } = {},
) {
  const piece = await prisma.piece.findUnique({ where: { id: pieceId } })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.currentStage !== 'MARKET') return { error: 'Piece must be in MARKET stage to be assigned.' }

  const market = await prisma.market.findUnique({ where: { id: marketId } })
  if (!market) return { error: 'Market event not found.' }
  if (!market.isActive) return { error: 'That market is not active.' }

  // One listing per (market, seller). If seller already has a stall in that market, attach
  // pieceId to it; otherwise create a fresh listing.
  const existing = await prisma.marketListing.findUnique({
    where: { marketId_sellerId: { marketId, sellerId: piece.sellerId } },
  })

  const listing = existing
    ? await prisma.marketListing.update({
        where: { id: existing.id },
        data:  {
          pieceId,
          status:       'APPROVED',
          approvedAt:   new Date(),
          stallMessage: opts.stallMessage ?? existing.stallMessage,
          marketPrice:  opts.marketPrice  ?? existing.marketPrice,
          stallNumber:  opts.stallNumber  ?? existing.stallNumber,
        },
      })
    : await prisma.marketListing.create({
        data: {
          marketId,
          sellerId:     piece.sellerId,
          pieceId,
          status:       'APPROVED',
          approvedAt:   new Date(),
          stallMessage: opts.stallMessage ?? null,
          marketPrice:  opts.marketPrice  ?? null,
          stallNumber:  opts.stallNumber  ?? null,
        },
      })

  return { listing }
}

export async function movePieceToAuction(
  pieceId: string,
  auctionEventId: string,
  startPrice: number,
  reservePrice?: number,
  artistStatement?: string,
) {
  const piece = await prisma.piece.findUnique({ where: { id: pieceId } })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.currentStage !== 'MARKET') return { error: 'Piece must be in MARKET stage to move to auction.' }
  if (!Number.isFinite(startPrice) || startPrice <= 0) return { error: 'Start price must be a positive number.' }

  const event = await prisma.auctionEvent.findUnique({ where: { id: auctionEventId } })
  if (!event) return { error: 'Auction event not found.' }

  const [, auction] = await prisma.$transaction([
    prisma.piece.update({
      where: { id: pieceId },
      data:  { currentStage: 'AUCTION' },
    }),
    prisma.auction.create({
      data: {
        pieceId,
        sellerId:        piece.sellerId,
        categoryId:      piece.categoryId,
        auctionEventId,
        title:           piece.title,
        description:     piece.description,
        artistStatement: artistStatement ?? null,
        images:          piece.images,
        startPrice,
        reservePrice:    reservePrice ?? null,
        status:          event.status === 'LIVE' ? 'LIVE' : 'APPROVED',
      },
    }),
  ])

  return { auction }
}

export async function movePieceToShop(
  pieceId: string,
  price: number,
  stock: number = 1,
) {
  const piece = await prisma.piece.findUnique({
    where:   { id: pieceId },
    include: { seller: { select: { locationId: true } } },
  })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.currentStage !== 'AUCTION') return { error: 'Piece must be in AUCTION stage to move to shop.' }
  if (!Number.isFinite(price) || price <= 0) return { error: 'Shop price must be a positive number.' }

  const [, product] = await prisma.$transaction([
    prisma.piece.update({
      where: { id: pieceId },
      data:  { currentStage: 'SHOP' },
    }),
    prisma.product.create({
      data: {
        pieceId,
        sellerId:    piece.sellerId,
        categoryId:  piece.categoryId,
        locationId:  piece.seller.locationId,
        name:        piece.title,
        description: piece.description,
        images:      piece.images,
        price,
        stock,
        status:      'ACTIVE',
      },
    }),
  ])

  return { product }
}

export async function markPieceSold(pieceId: string) {
  const piece = await prisma.piece.findUnique({ where: { id: pieceId } })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.currentStage === 'SOLD')    return { error: 'Piece is already sold.' }
  if (piece.currentStage === 'RETIRED') return { error: 'Retired pieces cannot be marked sold.' }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      where: { pieceId, status: 'ACTIVE' },
      data:  { status: 'SOLD_OUT', stock: 0 },
    })
    return tx.piece.update({
      where: { id: pieceId },
      data:  { currentStage: 'SOLD' },
    })
  })

  return { piece: updated }
}

export async function retirePiece(pieceId: string, sellerId: string) {
  const piece = await prisma.piece.findUnique({ where: { id: pieceId } })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.sellerId !== sellerId) return { error: 'You can only retire your own pieces.' }

  if (piece.currentStage === 'AUCTION') {
    return { error: 'Cannot retire a piece while it is in an active auction. Contact admin if you need to withdraw.' }
  }
  if (piece.currentStage === 'SOLD') {
    return { error: 'This piece has already been sold and cannot be retired.' }
  }
  if (piece.currentStage === 'RETIRED') {
    return { error: 'This piece is already retired.' }
  }

  const [updated] = await prisma.$transaction([
    prisma.piece.update({
      where: { id: pieceId },
      data:  { currentStage: 'RETIRED' },
    }),
    prisma.marketListing.updateMany({
      where: { pieceId, status: { in: ['PENDING', 'APPROVED'] } },
      data:  { status: 'REJECTED', adminNote: 'Retired by seller.' },
    }),
    prisma.product.updateMany({
      where: { pieceId, status: 'ACTIVE' },
      data:  { status: 'SUSPENDED' },
    }),
  ])

  return { piece: updated }
}
