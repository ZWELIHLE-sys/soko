import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { applyToMarket } from '@/services/market'

export async function POST(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  if (seller.status !== 'VERIFIED') return forbidden('Only verified sellers can apply to the market')

  const { marketId, productIds, sellerNote } = await req.json()
  if (!marketId || !productIds || productIds.length === 0)
    return badRequest('marketId and at least one product are required')

  const result = await applyToMarket(seller.id, marketId, productIds, sellerNote)
  if (result.error) return badRequest(result.error)

  return NextResponse.json({ listing: result.listing }, { status: 201 })
}
