import { NextResponse } from 'next/server'
import { requireBuyerId, unauthorized } from '@/lib/auth-helpers'
import { getBuyerMarkets } from '@/services/market'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()
  const markets = await getBuyerMarkets()
  return NextResponse.json(markets)
}
