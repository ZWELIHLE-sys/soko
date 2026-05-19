import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const category = searchParams.get('category')
  const search   = searchParams.get('search')
  const province = searchParams.get('province')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort     = searchParams.get('sort') || 'newest'
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = 12

  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' }

  if (category) {
    where.category = { slug: category }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  if (province) {
    where.location = {
      OR: [
        { id: province },
        { parentId: province },
        { parent: { parentId: province } },
      ]
    }
  }

  const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    newest:     { createdAt: 'desc' },
    oldest:     { createdAt: 'asc' },
    price_low:  { price: 'asc' },
    price_high: { price: 'desc' },
  }

  const orderBy = orderByMap[sort] ?? { createdAt: 'desc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller:   { select: { brandName: true, isVerified: true } },
        category: { select: { name: true, icon: true, slug: true } },
        location: { select: { name: true } },
      }
    }),
    prisma.product.count({ where })
  ])

  return NextResponse.json({
    products,
    total,
    pages: Math.ceil(total / limit),
    page,
  })
}
