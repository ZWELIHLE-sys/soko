import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerAuctionEvents } from '@/services/auctions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const [events, myItems] = await getSellerAuctionEvents(seller.id)
  return NextResponse.json({ events, myItems })
}
