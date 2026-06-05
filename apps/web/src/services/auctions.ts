import { prisma, tickEventLifecycle } from '@vuna/db'

export async function getPublicAuctions() {
  await tickEventLifecycle()

  return prisma.auction.findMany({
    where: { status: { in: ['APPROVED', 'LIVE', 'ENDED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      seller:       { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
      category:     { select: { name: true, slug: true, icon: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
      _count:       { select: { bids: true } },
    },
  })
}

export async function getSellerAuctionEvents(sellerId: string) {
  await tickEventLifecycle()
  return Promise.all([
    prisma.auctionEvent.findMany({
      where: { isActive: true },
      orderBy: { biddingStartDate: 'asc' },
      select: {
        id: true, title: true, description: true, theme: true, status: true,
        submissionDeadline: true, catalogueOpenDate: true,
        biddingStartDate: true, biddingEndDate: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.auction.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        auctionEvent: {
          select: { id: true, title: true, status: true, biddingStartDate: true, biddingEndDate: true },
        },
        _count: { select: { bids: true } },
      },
    }),
  ])
}

export async function getSellerAuctions(sellerId: string) {
  return prisma.auction.findMany({
    where: { sellerId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      auctionEvent: {
        select: { id: true, title: true, status: true, biddingStartDate: true, biddingEndDate: true },
      },
      _count: { select: { bids: true } },
    },
  })
}

export async function getSellerAuction(sellerId: string, auctionId: string) {
  return prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    include: {
      category: { select: { name: true } },
      auctionEvent: {
        select: { id: true, title: true, status: true, biddingStartDate: true, biddingEndDate: true },
      },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, amount: true, createdAt: true },
      },
      winner: { select: { name: true } },
      _count: { select: { bids: true } },
    },
  })
}

export async function submitAuction(sellerId: string, data: {
  auctionEventId: string
  title: string
  description: string
  artistStatement?: string
  categoryId: string
  startPrice: number
  reservePrice?: number | null
  images: string[]
}) {
  const event = await prisma.auctionEvent.findUnique({ where: { id: data.auctionEventId } })
  if (!event || !event.isActive) return { error: 'Auction event not found.' }
  if (event.status !== 'ANNOUNCED') return { error: 'This auction event is no longer accepting submissions.' }
  if (new Date() > event.submissionDeadline) return { error: 'The submission deadline for this auction has passed.' }

  const auction = await prisma.auction.create({
    data: {
      title:           data.title,
      description:     data.description,
      artistStatement: data.artistStatement || null,
      categoryId:      data.categoryId,
      startPrice:      data.startPrice,
      reservePrice:    data.reservePrice ?? null,
      images:          data.images,
      sellerId,
      auctionEventId:  data.auctionEventId,
      status:          'PENDING',
    },
  })
  return { auction }
}

export async function placeBid(buyerId: string, auctionId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { auctionEvent: { select: { biddingEndDate: true } } },
    })

    if (!auction) throw new Error('Auction not found')
    if (auction.status !== 'LIVE') throw new Error('Auction is not live')
    if (auction.auctionEvent?.biddingEndDate && auction.auctionEvent.biddingEndDate <= new Date()) {
      throw new Error('Auction has ended')
    }

    const minBid = auction.currentBid ? auction.currentBid + 1 : auction.startPrice
    if (amount < minBid) throw new Error(`Bid must be at least R${minBid.toFixed(2)}`)

    const bid = await tx.bid.create({ data: { auctionId, bidderId: buyerId, amount } })
    const updated = await tx.auction.update({ where: { id: auctionId }, data: { currentBid: amount } })
    return { bid, currentBid: updated.currentBid }
  })
}

export async function getBuyerAuctions(buyerId: string) {
  await tickEventLifecycle()
  const [bids, wonAuctions] = await Promise.all([
    prisma.bid.findMany({
      where: { bidderId: buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        auction: {
          include: {
            auctionEvent: { select: { title: true, biddingEndDate: true, status: true } },
            category:     { select: { name: true } },
            seller:       { select: { brandName: true } },
          },
        },
      },
    }),
    prisma.auction.findMany({
      where: { winnerId: buyerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        auctionEvent: { select: { title: true, biddingEndDate: true } },
        category:     { select: { name: true } },
        seller:       { select: { brandName: true } },
      },
    }),
  ])
  return { bids, wonAuctions }
}
