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

  const auctions = await prisma.auction.findMany({
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
  })

  return NextResponse.json(auctions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true, isVerified: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  if (!seller.isVerified) {
    return NextResponse.json({ error: 'Only verified sellers can submit auction items.' }, { status: 403 })
  }

  const { auctionEventId, title, description, artistStatement,
          categoryId, startPrice, reservePrice, images } = await req.json()

  if (!auctionEventId) {
    return NextResponse.json({ error: 'Please select an auction event to submit to.' }, { status: 400 })
  }
  if (!title || !description || !categoryId || !startPrice) {
    return NextResponse.json({ error: 'Title, description, category and starting price are required.' }, { status: 400 })
  }

  // Verify the event is open for submissions
  const event = await prisma.auctionEvent.findUnique({ where: { id: auctionEventId } })
  if (!event || !event.isActive) {
    return NextResponse.json({ error: 'Auction event not found.' }, { status: 404 })
  }
  if (event.status !== 'ANNOUNCED') {
    return NextResponse.json({ error: 'This auction event is no longer accepting submissions.' }, { status: 400 })
  }
  if (new Date() > event.submissionDeadline) {
    return NextResponse.json({ error: 'The submission deadline for this auction has passed.' }, { status: 400 })
  }

  const auction = await prisma.auction.create({
    data: {
      title,
      description,
      artistStatement: artistStatement || null,
      categoryId,
      startPrice:    parseFloat(startPrice),
      reservePrice:  reservePrice ? parseFloat(reservePrice) : null,
      images:        images ?? [],
      sellerId:      seller.id,
      auctionEventId,
      status:        'PENDING',
    },
  })

  return NextResponse.json(auction, { status: 201 })
}
