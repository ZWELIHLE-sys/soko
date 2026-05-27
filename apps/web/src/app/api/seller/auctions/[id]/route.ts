import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const auction = await prisma.auction.findFirst({
    where: { id, sellerId: seller.id },
    include: {
      category: { select: { name: true } },
      auctionEvent: {
        select: {
          id: true, title: true, status: true,
          biddingStartDate: true, biddingEndDate: true,
        },
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

  if (!auction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(auction)
}
