import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

async function getSellerProduct(email: string, productId: string) {
  const seller = await prisma.seller.findUnique({ where: { email } })
  if (!seller) return null
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
  })
  return product ? { seller, product } : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const found = await getSellerProduct(session.user.email!, params.id)
  if (!found) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(body.name        !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price       !== undefined && { price: parseFloat(body.price) }),
      ...(body.stock       !== undefined && { stock: parseInt(body.stock) }),
      ...(body.images      !== undefined && { images: body.images }),
      ...(body.status      !== undefined && { status: body.status }),
      ...(body.bulkMinQty  !== undefined && { bulkMinQty: body.bulkMinQty ? parseInt(body.bulkMinQty) : null }),
      ...(body.bulkPrice   !== undefined && { bulkPrice:  body.bulkPrice  ? parseFloat(body.bulkPrice) : null }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const found = await getSellerProduct(session.user.email!, params.id)
  if (!found) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Soft delete — keeps order history intact
  await prisma.product.update({
    where: { id: params.id },
    data: { status: 'SUSPENDED' },
  })
  return NextResponse.json({ ok: true })
}
