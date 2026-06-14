import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const pieces = await prisma.piece.findMany({
    where:   { sellerId: seller.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      category: { select: { name: true, slug: true } },
      marketListings: {
        select: {
          id: true, status: true, stallNumber: true,
          market: { select: { id: true, title: true, startDate: true, endDate: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      auctions: {
        select: {
          id: true, status: true, currentBid: true, startPrice: true,
          auctionEvent: { select: { id: true, title: true, biddingEndDate: true } },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      products: {
        select: { id: true, name: true, price: true, status: true, stock: true },
      },
    },
  })

  return NextResponse.json(pieces)
}

export async function POST(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const body = await req.json()
  const { title, description, images, categoryId } = body

  if (!title?.trim() || !description?.trim() || !categoryId) {
    return badRequest('Title, description and category are required.')
  }
  if (title.length > 80) {
    return badRequest('Title must be 80 characters or less.')
  }
  if (!Array.isArray(images) || images.length === 0) {
    return badRequest('Please upload at least one photo of the piece.')
  }
  if (images.length > 5) {
    return badRequest('You can upload up to 5 photos.')
  }

  const piece = await prisma.piece.create({
    data: {
      title:        title.trim(),
      description:  description.trim(),
      images,
      sellerId:     seller.id,
      categoryId,
      currentStage: 'MARKET',
    },
  })

  return NextResponse.json(piece, { status: 201 })
}
