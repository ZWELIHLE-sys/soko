import { NextResponse } from 'next/server'
import { requireBuyerId, unauthorized } from '@/lib/auth-helpers'
import { getBuyerOrders } from '@/services/orders'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()
  const orders = await getBuyerOrders(buyerId)
  return NextResponse.json(orders)
}
