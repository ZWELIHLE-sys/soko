import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PACKED', 'CANCELLED'],
  PACKED:     ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const order = await prisma.order.findFirst({
    where: { id: params.id, sellerId: seller.id },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { status } = await req.json()
  const allowed = VALID_TRANSITIONS[order.status] ?? []
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot move order from ${order.status} to ${status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  })
  return NextResponse.json(updated)
}
