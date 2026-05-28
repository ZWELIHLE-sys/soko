import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const buyerId = session.user.id

  // All auctions this buyer has placed bids on
  const bids = await prisma.bid.findMany({
    where: { bidderId: buyerId },
    orderBy: { createdAt: 'desc' },
    include: {
      auction: {
        include: {
          auctionEvent: { select: { title: true, biddingEndDate: true, status: true } },
          category:     { select: { name: true } },
          seller:       { select: { brandName: true } },
        }
      }
    }
  })

  // Won auctions
  const wonAuctions = await prisma.auction.findMany({
    where:   { winnerId: buyerId },
    orderBy: { updatedAt: 'desc' },
    include: {
      auctionEvent: { select: { title: true, biddingEndDate: true } },
      category:     { select: { name: true } },
      seller:       { select: { brandName: true } },
    }
  })

  return NextResponse.json({ bids, wonAuctions })
}
