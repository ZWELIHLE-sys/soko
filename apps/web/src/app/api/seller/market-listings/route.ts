import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerMarketData } from '@/services/market'

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) return unauthorized('Seller login required')

    const data = await getSellerMarketData(seller.id)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[market-listings GET]', err)
    return NextResponse.json(
      { error: 'Internal server error', markets: [], listings: [], sellerProducts: [] },
      { status: 500 },
    )
  }
}
