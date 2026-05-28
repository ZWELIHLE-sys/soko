import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { orderId } = await req.json()
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: session.user.id },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status !== 'IN_TRANSIT') {
    return NextResponse.json(
      { error: 'Only orders that are in transit can be confirmed as delivered.' },
      { status: 400 }
    )
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data:  { status: 'DELIVERED' },
  })

  return NextResponse.json(updated)
}
