import { prisma } from './index'

/**
 * Piece lifecycle:
 *
 *   created (MARKET, no marketListings)  → assignPieceToMarket   → MARKET (with MarketListing)
 *                                        → movePieceToAuction    → AUCTION (with Auction)
 *                                        → movePieceToFeatured   → FEATURED (Product + homepage FeaturedListing, time-boxed)
 *                                        → auto (lifecycle tick) → SHOP when the featured window expires
 *                                        → movePieceToShop       → SHOP (direct, skipping/ending the victory lap)
 *                                        → markPieceSold         → SOLD
 *
 *   FEATURED is the victory lap: the piece is on the homepage spotlight AND already buyable
 *   in the shop (in its own category). When the window closes it settles into a normal shop
 *   listing automatically — see tickFeaturedPieces in lifecycle.ts.
 *
 *   Seller can retirePiece at MARKET or SHOP (blocked at AUCTION, FEATURED + SOLD).
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

export async function movePieceToFeatured(
  pieceId: string,
  price: number,
  days: number = 7,
  note?: string,
  stock: number = 1,
) {
  const piece = await prisma.piece.findUnique({
    where:   { id: pieceId },
    include: { seller: { select: { locationId: true } } },
  })
  if (!piece) return { error: 'Piece not found.' }
  if (piece.currentStage !== 'AUCTION') return { error: 'Piece must be in AUCTION stage to take its victory lap.' }
  if (!Number.isFinite(price) || price <= 0) return { error: 'Shop price must be a positive number.' }
  if (!Number.isFinite(days) || days < 1 || days > 30) return { error: 'Featured window must be between 1 and 30 days.' }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  // The product is created NOW, in the piece's own category, so the spotlight is buyable.
  // When the featured window expires, the lifecycle tick flips the stage to SHOP —
  // the listing itself doesn't change, it just steps off the homepage.
  const product = await prisma.$transaction(async (tx) => {
    await tx.piece.update({
      where: { id: pieceId },
      data:  { currentStage: 'FEATURED' },
    })
    const created = await tx.product.create({
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
    })
    await tx.featuredListing.create({
      data: {
        productId: created.id,
        expiresAt,
        note: note?.trim() || `Just off the hammer — ${piece.title}`,
      },
    })
    return created
  })

  return { product, expiresAt }
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

  // Ending the victory lap early: the product already exists — just take it off
  // the homepage and settle the stage. Price/stock are left as they were.
  if (piece.currentStage === 'FEATURED') {
    const [, updated] = await prisma.$transaction([
      prisma.featuredListing.deleteMany({ where: { product: { pieceId } } }),
      prisma.piece.update({
        where: { id: pieceId },
        data:  { currentStage: 'SHOP' },
      }),
    ])
    const product = await prisma.product.findFirst({ where: { pieceId, status: 'ACTIVE' } })
    return { product, piece: updated }
  }

  if (piece.currentStage !== 'AUCTION') return { error: 'Piece must be in AUCTION or FEATURED stage to move to shop.' }
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
    // A sold piece steps off the homepage spotlight immediately
    await tx.featuredListing.deleteMany({ where: { product: { pieceId } } })
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
  if (piece.currentStage === 'FEATURED') {
    return { error: 'This piece is currently featured on the Vuna homepage. Contact admin if you need to withdraw it.' }
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
