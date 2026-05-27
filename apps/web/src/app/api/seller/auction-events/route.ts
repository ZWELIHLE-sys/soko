import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const [events, myItems] = await Promise.all([
    prisma.auctionEvent.findMany({
      where: { isActive: true },
      orderBy: { biddingStartDate: 'asc' },
      include: { _count: { select: { items: true } } },
    }),
    prisma.auction.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        auctionEvent: {
          select: {
            id: true, title: true, status: true,
            biddingStartDate: true, biddingEndDate: true,
          },
        },
        _count: { select: { bids: true } },
      },
    }),
  ])

  return NextResponse.json({ events, myItems })
}
