import { NextRequest, NextResponse } from 'next/server'
import { requireBuyer, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { placeBid } from '@/services/auctions'

export async function POST(req: NextRequest) {
  const buyer = await requireBuyer()
  if (!buyer) return unauthorized('Buyer login required to bid')
  if (!buyer.isVerified) return forbidden('Only verified buyers can bid')

  const { auctionId, amount } = await req.json()
  if (!auctionId || !amount) return badRequest('auctionId and amount are required')

  try {
    const result = await placeBid(buyer.id, auctionId, parseFloat(amount))
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : 'Bid failed')
  }
}
