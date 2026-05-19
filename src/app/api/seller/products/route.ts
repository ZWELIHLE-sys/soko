import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — fetch seller's products
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    include: {
      category: { select: { name: true, icon: true } },
      location: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(products)
}

// POST — create new product
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, price, stock, categoryId, images, status } = body

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, description, price and category are required' },
        { status: 400 }
      )
    }

    // Get seller's location
    const seller = await prisma.seller.findUnique({
      where: { id: session.user.id },
      select: { locationId: true }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 1,
        categoryId,
        images: images || [],
        sellerId: session.user.id,
        locationId: seller.locationId,
        status: status || 'DRAFT',
      },
      include: {
        category: { select: { name: true, icon: true } },
        location: { select: { name: true } },
      }
    })

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}