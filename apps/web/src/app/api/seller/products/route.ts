import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, forbidden } from '@/lib/auth-helpers'
import { getSellerProducts, createProduct } from '@/services/products'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const products = await getSellerProducts(seller.id)
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  if (!seller.isVerified) return forbidden('Your account must be verified before listing products.')

  const { name, description, price, stock, categoryId, images, bulkMinQty, bulkPrice } = await req.json()

  const product = await createProduct(seller.id, seller.locationId, {
    name,
    description,
    price:      parseFloat(price),
    stock:      parseInt(stock),
    categoryId,
    images:     images ?? [],
    bulkMinQty: bulkMinQty ? parseInt(bulkMinQty) : null,
    bulkPrice:  bulkPrice  ? parseFloat(bulkPrice) : null,
  })

  return NextResponse.json(product, { status: 201 })
}
