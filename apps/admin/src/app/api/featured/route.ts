import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const listings = await prisma.featuredListing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
          images: true,
          seller: { select: { brandName: true } },
          category: { select: { name: true, icon: true } },
        },
      },
    },
  })

  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { productId, expiresAt, note } = await req.json()
  if (!productId || !expiresAt) {
    return NextResponse.json({ error: 'productId and expiresAt are required' }, { status: 400 })
  }

  // Check product exists and is ACTIVE
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Only ACTIVE products can be featured' }, { status: 400 })
  }

  // Upsert so the same product can be re-featured by updating the expiry
  const listing = await prisma.featuredListing.upsert({
    where: { productId },
    update: { expiresAt: new Date(expiresAt), note: note ?? null },
    create: { productId, expiresAt: new Date(expiresAt), note: note ?? null },
  })

  return NextResponse.json(listing, { status: 201 })
}
