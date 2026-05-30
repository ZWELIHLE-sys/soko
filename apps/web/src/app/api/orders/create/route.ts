import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { createOrders } from '@/services/orders'

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  try {
    const body = await req.json()
    // TODO: DHL API integration — when DHL is active, deliveryTier will be 'DHL',
    // deliveryFee will be the real DHL rate, and a waybill should be generated here.
    const { items, deliveryAddress, deliveryCityId, deliveryTier, deliveryFee, paymentRef } = body

    if (!items || items.length === 0) return badRequest('No items in cart')

    const orders = await createOrders(buyerId, items, {
      deliveryAddress,
      deliveryCityId,
      deliveryTier,
      deliveryFee,
      paymentRef,
    })

    return NextResponse.json({ orders }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
