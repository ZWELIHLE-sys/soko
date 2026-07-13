import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { reserveHarvest } from '@/services/orders'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized('Sign in as a buyer to reserve a harvest.')

  const limited = checkRateLimit(req, 'reserve', 20, 60_000)
  if (limited) return limited

  const { productId, quantity, deliveryAddress } = await req.json()
  if (!productId) return badRequest('productId is required.')

  const result = await reserveHarvest(buyerId, productId, Number(quantity), String(deliveryAddress ?? ''))
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.order, { status: 201 })
}
