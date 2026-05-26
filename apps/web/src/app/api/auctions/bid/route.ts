import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Buyer login required to bid' }, { status: 401 })
  }

  const buyer = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!buyer || !buyer.isVerified) {
    return NextResponse.json({ error: 'Only verified buyers can bid' }, { status: 403 })
  }

  const { auctionId, amount } = await req.json()
  if (!auctionId || !amount) {
    return NextResponse.json({ error: 'auctionId and amount are required' }, { status: 400 })
  }

  // Use a transaction to prevent bid conflicts
  const result = await prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({ where: { id: auctionId } })

    if (!auction) throw new Error('Auction not found')
    if (auction.status !== 'LIVE') throw new Error('Auction is not live')
    if (auction.endTime <= new Date()) throw new Error('Auction has ended')

    const minBid = auction.currentBid
      ? auction.currentBid + 1
      : auction.startPrice

    if (parseFloat(amount) < minBid) {
      throw new Error(`Bid must be at least R${minBid.toFixed(2)}`)
    }

    const bid = await tx.bid.create({
      data: {
        auctionId,
        bidderId: buyer.id,
        amount: parseFloat(amount),
      },
    })

    const updated = await tx.auction.update({
      where: { id: auctionId },
      data: { currentBid: parseFloat(amount) },
    })

    return { bid, currentBid: updated.currentBid }
  })

  return NextResponse.json(result, { status: 201 })
}
