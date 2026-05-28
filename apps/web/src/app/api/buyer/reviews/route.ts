import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    select: { productId: true, sellerId: true },
  })

  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { productId, sellerId, rating, comment } = await req.json()

  if (!productId || !sellerId || !rating) {
    return NextResponse.json({ error: 'productId, sellerId and rating are required' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Verify buyer actually purchased this product and it was delivered
  const order = await prisma.order.findFirst({
    where: {
      buyerId: session.user.id,
      status: 'DELIVERED',
      items: { some: { productId } },
    },
  })

  if (!order) {
    return NextResponse.json(
      { error: 'You can only review products from delivered orders.' },
      { status: 403 }
    )
  }

  // One review per product per buyer
  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, productId },
  })

  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      userId:   session.user.id,
      productId,
      sellerId,
      rating:   parseInt(rating),
      comment:  comment?.trim() || null,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
