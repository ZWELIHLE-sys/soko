import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const pieces = await prisma.piece.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      seller:   { select: { id: true, brandName: true, location: { select: { name: true } } } },
      category: { select: { name: true, slug: true } },
      marketListings: {
        select: {
          id: true, status: true, stallNumber: true,
          market: { select: { id: true, title: true } },
        },
      },
      auctions: {
        select: {
          id: true, status: true, currentBid: true, startPrice: true,
          auctionEvent: { select: { id: true, title: true, biddingEndDate: true } },
          _count: { select: { bids: true } },
        },
      },
      products: { select: { id: true, name: true, price: true, status: true } },
    },
  })

  return NextResponse.json(pieces)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json()
  const { title, description, images, sellerId, categoryId } = body

  if (!title || !description || !sellerId || !categoryId) {
    return NextResponse.json({ error: 'title, description, sellerId and categoryId are required' }, { status: 400 })
  }

  const piece = await prisma.piece.create({
    data: {
      title,
      description,
      images: images ?? [],
      sellerId,
      categoryId,
      currentStage: 'MARKET',
    },
  })

  return NextResponse.json(piece, { status: 201 })
}
