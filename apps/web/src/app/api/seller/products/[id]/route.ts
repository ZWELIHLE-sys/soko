import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, notFound } from '@/lib/auth-helpers'
import { getSellerProductForOwner, updateProduct, softDeleteProduct, parseAgriInput } from '@/services/products'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const product = await getSellerProductForOwner(seller.id, id)
  if (!product) return notFound('Product not found')

  const body = await req.json()

  // Category cannot change on edit — validate agri fields against the product's own category
  const agri = await parseAgriInput(product.categoryId, body)
  if (agri.error) return NextResponse.json({ error: agri.error }, { status: 400 })

  const updated = await updateProduct(id, {
    ...(body.name        !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.price       !== undefined && { price: parseFloat(body.price) }),
    ...(body.stock       !== undefined && { stock: parseInt(body.stock) }),
    ...(body.images      !== undefined && { images: body.images }),
    ...(body.status      !== undefined && { status: body.status }),
    ...(body.bulkMinQty  !== undefined && { bulkMinQty: body.bulkMinQty ? parseInt(body.bulkMinQty) : null }),
    ...(body.bulkPrice   !== undefined && { bulkPrice:  body.bulkPrice  ? parseFloat(body.bulkPrice) : null }),
  }, { harvest: agri.harvest, livestock: agri.livestock })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const product = await getSellerProductForOwner(seller.id, id)
  if (!product) return notFound('Product not found')

  await softDeleteProduct(id)
  return NextResponse.json({ ok: true })
}
