import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const items = await prisma.wishlist.findMany({
    where: { userId: buyerId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true, name: true, price: true, images: true, status: true,
          seller:   { select: { brandName: true } },
          category: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { productId } = await req.json()
  if (!productId) return badRequest('productId required')

  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: buyerId, productId } },
    create: { userId: buyerId, productId },
    update: {},
  })

  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { productId } = await req.json()
  if (!productId) return badRequest('productId required')

  await prisma.wishlist.deleteMany({ where: { userId: buyerId, productId } })
  return NextResponse.json({ ok: true })
}
