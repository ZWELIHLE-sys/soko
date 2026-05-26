import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const auctions = await prisma.auction.findMany({
    where: { status: { in: ['APPROVED', 'LIVE', 'ENDED'] } },
    orderBy: [
      { status: 'asc' },
      { endTime: 'asc' },
    ],
    include: {
      seller:   { select: { brandName: true, isVerified: true, location: { select: { name: true } } } },
      category: { select: { name: true, slug: true, icon: true } },
      _count:   { select: { bids: true } },
    },
  })

  // Auto-update LIVE → ENDED for expired auctions
  const now = new Date()
  const toEnd = auctions.filter(a => a.status === 'LIVE' && a.endTime <= now)
  if (toEnd.length > 0) {
    await Promise.all(toEnd.map(a => prisma.auction.update({
      where: { id: a.id },
      data: { status: 'ENDED' },
    })))
  }

  return NextResponse.json({ auctions })
}
