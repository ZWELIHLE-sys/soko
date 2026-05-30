import { NextResponse } from 'next/server'
import { requireBuyerId, unauthorized } from '@/lib/auth-helpers'
import { getBuyerStats } from '@/services/orders'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()
  const stats = await getBuyerStats(buyerId)
  return NextResponse.json(stats)
}
