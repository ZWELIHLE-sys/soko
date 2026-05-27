import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const items = await prisma.orderItem.findMany({
    where: { product: { sellerId: seller.id } },
    select: {
      productId: true,
      quantity: true,
      price: true,
      order: { select: { status: true } },
    },
  })

  const statsMap: Record<string, { orderCount: number; revenue: number }> = {}
  for (const item of items) {
    if (!statsMap[item.productId]) statsMap[item.productId] = { orderCount: 0, revenue: 0 }
    statsMap[item.productId].orderCount += 1
    if (item.order.status === 'DELIVERED') {
      statsMap[item.productId].revenue += item.price * item.quantity
    }
  }

  return NextResponse.json(statsMap)
}
