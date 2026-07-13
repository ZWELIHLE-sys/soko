import { NextRequest, NextResponse } from 'next/server'
import { requireBuyer, unauthorized, forbidden, badRequest } from '@/lib/auth-helpers'
import { placeBid } from '@/services/auctions'
import { checkRateLimit } from '@/lib/rate-limit'
import { vId, vNumber, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const buyer = await requireBuyer()
  if (!buyer) return unauthorized('Buyer login required to bid')
  if (!buyer.isVerified) return forbidden('Only verified buyers can bid')

  const limited = checkRateLimit(req, 'bid', 30, 60_000)
  if (limited) return limited

  let auctionId: string, amount: number
  try {
    const body = await req.json()
    auctionId = vId(body.auctionId, 'Auction')
    amount    = vNumber(body.amount, 'Bid amount', { min: 1, max: 100_000_000 })
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  try {
    const result = await placeBid(buyer.id, auctionId, amount)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : 'Bid failed')
  }
}
