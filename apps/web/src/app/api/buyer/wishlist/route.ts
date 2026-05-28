import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          status: true,
          seller: { select: { brandName: true } },
          category: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { productId } = await req.json()
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId },
    update: {},
  })

  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { productId } = await req.json()
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, productId },
  })

  return NextResponse.json({ ok: true })
}
