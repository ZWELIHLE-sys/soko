import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
    }
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}
