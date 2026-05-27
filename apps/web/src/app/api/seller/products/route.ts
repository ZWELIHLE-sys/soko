import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, status: { not: 'SUSPENDED' } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  if (!seller.isVerified) {
    return NextResponse.json(
      { error: 'Your account must be verified before listing products.' },
      { status: 403 }
    )
  }

  const { name, description, price, stock, categoryId, images, bulkMinQty, bulkPrice } = await req.json()

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      locationId: seller.locationId,
      images: images ?? [],
      sellerId: seller.id,
      status: 'ACTIVE',
      bulkMinQty: bulkMinQty ? parseInt(bulkMinQty) : null,
      bulkPrice:  bulkPrice  ? parseFloat(bulkPrice) : null,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
