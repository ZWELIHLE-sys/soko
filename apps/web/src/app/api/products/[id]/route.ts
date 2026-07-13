import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          brandName: true,
          name: true,
          bio: true,
          avatar: true,
          isVerified: true,
          location: { select: { name: true } },
          category: { select: { name: true, icon: true } },
          _count: { select: { products: true } }
        }
      },
      category: { select: { name: true, icon: true, slug: true } },
      location: { select: { name: true } },
      livestockDetail: true,
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      piece: {
        select: {
          id: true,
          title: true,
          currentStage: true,
          createdAt: true,
          livestockDetail: true,
          videoUrl: true,
          marketListings: {
            select: {
              id: true,
              market: { select: { id: true, title: true, startDate: true, endDate: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          auctions: {
            select: {
              id: true,
              currentBid: true,
              startPrice: true,
              auctionEvent: { select: { id: true, title: true, biddingEndDate: true } },
              _count: { select: { bids: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    }
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Harvest pre-orders: how much of the estimated yield is already spoken for
  let reservedQty = 0
  if (product.isHarvestPreOrder) {
    const agg = await prisma.orderItem.aggregate({
      where: { productId: id, order: { status: { not: 'CANCELLED' } } },
      _sum:  { quantity: true },
    })
    reservedQty = agg._sum?.quantity ?? 0
  }

  return NextResponse.json({ ...product, reservedQty })
}
