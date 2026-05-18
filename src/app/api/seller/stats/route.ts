import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const sellerId = session.user.id

  const [totalProducts, totalOrders, pendingOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),

    prisma.order.count({ where: { sellerId } }),

    prisma.order.count({
      where: { sellerId, status: 'PENDING' }
    }),

    prisma.order.aggregate({
      where: { sellerId, status: 'DELIVERED' },
      _sum: { totalAmount: true }
    })
  ])

  return NextResponse.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    revenue: revenue._sum.totalAmount ?? 0,
  })
}