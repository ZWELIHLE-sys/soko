import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const buyerId = session.user.id

  const [totalOrders, delivered, pending, totalSpent] = await Promise.all([
    prisma.order.count({
      where: { buyerId }
    }),
    prisma.order.count({
      where: { buyerId, status: 'DELIVERED' }
    }),
    prisma.order.count({
      where: {
        buyerId,
        status: { in: ['PENDING', 'CONFIRMED', 'PACKED', 'IN_TRANSIT'] }
      }
    }),
    prisma.order.aggregate({
      where: { buyerId, status: 'DELIVERED' },
      _sum: { totalAmount: true }
    })
  ])

  return NextResponse.json({
    totalOrders,
    delivered,
    pending,
    totalSpent: totalSpent._sum.totalAmount ?? 0,
  })
}
