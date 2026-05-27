import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const now = new Date()

  // Auto-close auctions whose event bidding window has expired
  const expiredEvents = await prisma.auctionEvent.findMany({
    where: { status: 'LIVE', biddingEndDate: { lte: now } },
    select: { id: true },
  })
  if (expiredEvents.length > 0) {
    const ids = expiredEvents.map(e => e.id)
    await Promise.all([
      prisma.auction.updateMany({ where: { status: 'LIVE', auctionEventId: { in: ids } }, data: { status: 'ENDED' } }),
      prisma.auctionEvent.updateMany({ where: { id: { in: ids } }, data: { status: 'ENDED' } }),
    ])
  }

  const auctions = await prisma.auction.findMany({
    where: { status: { in: ['APPROVED', 'LIVE', 'ENDED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      seller:       { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
      category:     { select: { name: true, slug: true, icon: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true } },
      _count:       { select: { bids: true } },
    },
  })

  return NextResponse.json({ auctions })
}
