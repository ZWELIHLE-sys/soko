import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import {
  assignPieceToMarket,
  movePieceToAuction,
  movePieceToFeatured,
  movePieceToShop,
  markPieceSold,
} from '@vuna/db'

export const dynamic = 'force-dynamic'

/**
 * Single dispatching endpoint for admin piece promotions.
 * Body: { action: 'assign-market', marketId, stallMessage?, marketPrice?, stallNumber? }
 *     | { action: 'to-auction', auctionEventId, startPrice, reservePrice?, artistStatement? }
 *     | { action: 'to-featured', price, days?, note?, stock? }   — homepage victory lap, auto-lands in shop
 *     | { action: 'to-shop', price, stock? }                     — direct to shop, or ends a featured window early
 *     | { action: 'sold' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const body   = await req.json()
  const action = body?.action as string

  if (action === 'assign-market') {
    if (!body.marketId) return badRequest('marketId is required.')
    const result = await assignPieceToMarket(id, body.marketId, {
      stallMessage: body.stallMessage,
      marketPrice:  body.marketPrice,
      stallNumber:  body.stallNumber,
    })
    if (result.error) return badRequest(result.error)
    return NextResponse.json(result.listing)
  }

  if (action === 'to-auction') {
    if (!body.auctionEventId) return badRequest('auctionEventId is required.')
    const result = await movePieceToAuction(
      id,
      body.auctionEventId,
      Number(body.startPrice),
      body.reservePrice != null ? Number(body.reservePrice) : undefined,
      body.artistStatement,
    )
    if (result.error) return badRequest(result.error)
    return NextResponse.json(result.auction)
  }

  if (action === 'to-featured') {
    const result = await movePieceToFeatured(
      id,
      Number(body.price),
      body.days != null ? Number(body.days) : 7,
      body.note,
      body.stock != null ? Number(body.stock) : 1,
    )
    if (result.error) return badRequest(result.error)
    return NextResponse.json(result.product)
  }

  if (action === 'to-shop') {
    const result = await movePieceToShop(
      id,
      Number(body.price),
      body.stock != null ? Number(body.stock) : 1,
    )
    if (result.error) return badRequest(result.error)
    return NextResponse.json(result.product)
  }

  if (action === 'sold') {
    const result = await markPieceSold(id)
    if (result.error) return badRequest(result.error)
    return NextResponse.json(result.piece)
  }

  return badRequest('Unknown action. Use: assign-market | to-auction | to-featured | to-shop | sold')
}
