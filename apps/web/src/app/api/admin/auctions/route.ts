import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

// GET — list all pending auctions for review
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const auctions = await prisma.auction.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      seller:   { select: { brandName: true, email: true, location: { select: { name: true } } } },
      category: { select: { name: true } },
      _count:   { select: { bids: true } },
    },
  })

  return NextResponse.json({ auctions })
}

// PATCH — approve, reject, or set live
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { auctionId, status, adminNote } = await req.json()
  const allowed = ['APPROVED', 'LIVE', 'CANCELLED']
  if (!auctionId || !allowed.includes(status)) {
    return NextResponse.json({ error: 'auctionId and valid status required' }, { status: 400 })
  }

  const auction = await prisma.auction.update({
    where: { id: auctionId },
    data: { status, adminNote: adminNote || null },
  })

  return NextResponse.json({ auction })
}
