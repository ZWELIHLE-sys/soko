import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { createOrders } from '@/services/orders'
import { checkRateLimit } from '@/lib/rate-limit'
import { vString, vId, vOptionalString, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const limited = checkRateLimit(req, 'order-create', 20, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()
    const { items, deliveryFee } = body

    if (!Array.isArray(items) || items.length === 0) return badRequest('No items in cart')
    if (items.length > 100) return badRequest('Too many items in a single order')

    let deliveryAddress: string, deliveryCityId: string, deliveryTier: string
    let paymentRef: string | null
    try {
      deliveryAddress = vString(body.deliveryAddress, 'Delivery address', { min: 3, max: 500 })
      deliveryCityId  = vId(body.deliveryCityId, 'Delivery city')
      deliveryTier    = vString(body.deliveryTier, 'Delivery method', { max: 40 })
      paymentRef      = vOptionalString(body.paymentRef, 'Payment reference', 120)
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    const result = await createOrders(buyerId, items, {
      deliveryAddress,
      deliveryCityId,
      deliveryTier,
      deliveryFee,
      paymentRef: paymentRef ?? undefined,
    })

    if (result.error) return badRequest(result.error)

    return NextResponse.json({ orders: result.orders }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
