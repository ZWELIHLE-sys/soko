import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const reviews = await prisma.review.findMany({
    where: { userId: buyerId },
    select: { productId: true, sellerId: true },
  })

  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { productId, sellerId, rating, comment } = await req.json()

  if (!productId || !sellerId || !rating)
    return badRequest('productId, sellerId and rating are required')
  if (rating < 1 || rating > 5)
    return badRequest('Rating must be between 1 and 5')

  const order = await prisma.order.findFirst({
    where: { buyerId, status: 'DELIVERED', items: { some: { productId } } },
  })
  if (!order) return forbidden('You can only review products from delivered orders.')

  const existing = await prisma.review.findFirst({ where: { userId: buyerId, productId } })
  if (existing) return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 })

  const review = await prisma.review.create({
    data: { userId: buyerId, productId, sellerId, rating: parseInt(rating), comment: comment?.trim() || null },
  })

  return NextResponse.json(review, { status: 201 })
}
