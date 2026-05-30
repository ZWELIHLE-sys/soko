import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, notFound, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function PATCH(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { orderId } = await req.json()
  if (!orderId) return badRequest('orderId required')

  const order = await prisma.order.findFirst({ where: { id: orderId, buyerId } })
  if (!order) return notFound('Order not found')

  if (order.status !== 'IN_TRANSIT')
    return badRequest('Only orders that are in transit can be confirmed as delivered.')

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } })
  return NextResponse.json(updated)
}
