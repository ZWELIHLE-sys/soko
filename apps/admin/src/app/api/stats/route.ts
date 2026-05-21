import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [
    totalSellers, pendingSellers, verifiedSellers,
    totalBuyers, totalProducts, activeProducts,
    totalOrders, pendingOrders, deliveredOrders,
    revenue
  ] = await Promise.all([
    prisma.seller.count(),
    prisma.seller.count({ where: { status: 'PENDING' } }),
    prisma.seller.count({ where: { status: 'VERIFIED' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true }
    })
  ])

  const totalRevenue = revenue._sum.totalAmount ?? 0
  const vunaCommission = totalRevenue * 0.10

  return NextResponse.json({
    sellers: { total: totalSellers, pending: pendingSellers, verified: verifiedSellers },
    buyers: { total: totalBuyers },
    products: { total: totalProducts, active: activeProducts },
    orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
    finance: { totalRevenue, vunaCommission }
  })
}
