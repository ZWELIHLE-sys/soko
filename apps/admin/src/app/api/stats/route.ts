import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const [
    totalSellers, pendingSellers, verifiedSellers,
    totalBuyers, totalProducts, activeProducts,
    totalOrders, pendingOrders, deliveredOrders,
    revenue,
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
    prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
  ])

  const totalRevenue  = revenue._sum.totalAmount ?? 0
  const vunaCommission = totalRevenue * 0.10

  return NextResponse.json({
    sellers:  { total: totalSellers, pending: pendingSellers, verified: verifiedSellers },
    buyers:   { total: totalBuyers },
    products: { total: totalProducts, active: activeProducts },
    orders:   { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
    finance:  { totalRevenue, vunaCommission },
  })
}
