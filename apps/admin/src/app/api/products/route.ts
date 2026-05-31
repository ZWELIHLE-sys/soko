import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { listProducts, updateProductStatus } from '@/services/products'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const q          = searchParams.get('q')          ?? ''
  const limit      = parseInt(searchParams.get('limit') ?? '0') || undefined
  const locationId = searchParams.get('locationId') ?? undefined

  const products = await listProducts(q || undefined, limit, locationId)
  return NextResponse.json(products)
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id, status } = await req.json()
  const product = await updateProductStatus(id, status)
  return NextResponse.json(product)
}
