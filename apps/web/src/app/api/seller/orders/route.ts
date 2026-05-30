import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerOrders } from '@/services/orders'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  const orders = await getSellerOrders(seller.id)
  return NextResponse.json(orders)
}
