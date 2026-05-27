import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      seller:       { select: { brandName: true, isVerified: true, bio: true, location: { select: { name: true } } } },
      category:     { select: { name: true, slug: true, icon: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true, title: true } },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { bidder: { select: { name: true } } },
      },
      winner: { select: { name: true } },
    },
  })

  if (!auction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Auto-close if event bidding window has expired
  if (auction.status === 'LIVE' && auction.auctionEvent?.biddingEndDate && auction.auctionEvent.biddingEndDate <= new Date()) {
    const updated = await prisma.auction.update({
      where: { id },
      data: { status: 'ENDED' },
    })
    return NextResponse.json({ auction: { ...auction, status: updated.status } })
  }

  return NextResponse.json({ auction })
}
