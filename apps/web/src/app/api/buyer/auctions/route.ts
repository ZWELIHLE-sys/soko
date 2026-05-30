import { NextResponse } from 'next/server'
import { requireBuyerId, unauthorized } from '@/lib/auth-helpers'
import { getBuyerAuctions } from '@/services/auctions'

export async function GET() {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()
  const data = await getBuyerAuctions(buyerId)
  return NextResponse.json(data)
}
