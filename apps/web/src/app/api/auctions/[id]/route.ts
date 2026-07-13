import { NextRequest, NextResponse } from 'next/server'
import { prisma, tickEventLifecycle } from '@vuna/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await tickEventLifecycle()

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      seller:       { select: { brandName: true, isVerified: true, bio: true, location: { select: { name: true } } } },
      category:     { select: { name: true, slug: true, icon: true } },
      auctionEvent: { select: { biddingStartDate: true, biddingEndDate: true, title: true } },
      // Animal papers + video — on the lot itself, or riding the piece through its journey
      livestockDetail: true,
      piece: { select: { livestockDetail: true, videoUrl: true } },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { bidder: { select: { name: true } } },
      },
      winner: { select: { name: true } },
    },
  })

  if (!auction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ auction })
}
