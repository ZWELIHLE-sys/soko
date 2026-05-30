import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, notFound, badRequest } from '@/lib/auth-helpers'
import { updateOrderStatus } from '@/services/orders'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const { status } = await req.json()

  const result = await updateOrderStatus(id, seller.id, status)
  if (result.error) {
    if (result.error === 'Order not found') return notFound(result.error)
    return badRequest(result.error)
  }

  return NextResponse.json(result.order)
}
