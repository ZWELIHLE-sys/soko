import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, notFound } from '@/lib/auth-helpers'
import { getBuyerOrderForPayment } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { id } = await params
  const order = await getBuyerOrderForPayment(id, buyerId)
  if (!order) return notFound('Order not found')

  return NextResponse.json(order)
}
