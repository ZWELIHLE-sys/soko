import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { applyToMarket } from '@/services/market'

export async function POST(req: NextRequest) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')
  if (seller.status !== 'VERIFIED') return forbidden('Only verified sellers can apply to the market')

  const { marketId, productIds, sellerNote } = await req.json()
  if (!marketId || typeof marketId !== 'string') return badRequest('A market is required.')
  if (!Array.isArray(productIds) || productIds.length === 0)
    return badRequest('Select at least one product.')
  if (productIds.length > 50) return badRequest('Too many products in one application.')
  if (!productIds.every(p => typeof p === 'string')) return badRequest('Invalid product in selection.')
  if (sellerNote != null && (typeof sellerNote !== 'string' || sellerNote.length > 500))
    return badRequest('Your note must be 500 characters or less.')

  const result = await applyToMarket(seller.id, marketId, productIds, sellerNote)
  if (result.error) return badRequest(result.error)

  return NextResponse.json({ listing: result.listing }, { status: 201 })
}
