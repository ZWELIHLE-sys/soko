import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

const COMMISSION_RATE = 0.10

interface CartItem {
  productId: string
  sellerId: string
  price: number
  quantity: number
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    // TODO: DHL API integration — when DHL is active, deliveryTier will be 'DHL',
    // deliveryFee will be the real DHL rate, and a waybill should be generated here
    // via the DHL Express API and stored on the order (add trackingNumber field).
    // Reference: packages/db/prisma/schema.prisma DeliveryTier enum
    const { items, deliveryAddress, deliveryCityId, deliveryTier, deliveryFee, paymentRef } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Group items by seller — one order per seller
    const sellerGroups: Record<string, CartItem[]> = {}
    for (const item of items) {
      if (!sellerGroups[item.sellerId]) sellerGroups[item.sellerId] = []
      sellerGroups[item.sellerId].push(item)
    }

    const orders = []

    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      const itemsTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
      const orderTotal = itemsTotal + deliveryFee
      const commission = parseFloat((orderTotal * COMMISSION_RATE).toFixed(2))

      const order = await prisma.order.create({
        data: {
          buyerId:        session.user.id,
          sellerId,
          totalAmount:    orderTotal,
          deliveryFee,
          deliveryTier,
          deliveryAddress,
          deliveryCityId,
          status:         'PENDING',
          paymentRef:     paymentRef ?? null,
          commission,
          items: {
            create: sellerItems.map((item: CartItem) => ({
              productId: item.productId,
              quantity:  item.quantity,
              price:     item.price,
            }))
          }
        },
        include: { items: true }
      })

      // Update product stock
      for (const item of sellerItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      orders.push(order)
    }

    return NextResponse.json({ orders }, { status: 201 })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
