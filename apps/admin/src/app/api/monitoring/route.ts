import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    newSellers24h, newBuyers24h, newOrders24h,
    newSellers7d,  newBuyers7d,  newOrders7d,
    pendingProducts, outOfStock,
    recentOrders
  ] = await Promise.all([
    prisma.seller.count({ where: { createdAt: { gte: last24h } } }),
    prisma.user.count({ where: { createdAt: { gte: last24h }, role: 'BUYER' } }),
    prisma.order.count({ where: { createdAt: { gte: last24h } } }),
    prisma.seller.count({ where: { createdAt: { gte: last7d } } }),
    prisma.user.count({ where: { createdAt: { gte: last7d }, role: 'BUYER' } }),
    prisma.order.count({ where: { createdAt: { gte: last7d } } }),
    prisma.product.count({ where: { status: 'DRAFT' } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { brandName: true } },
      }
    })
  ])

  return NextResponse.json({
    last24h: { sellers: newSellers24h, buyers: newBuyers24h, orders: newOrders24h },
    last7d:  { sellers: newSellers7d,  buyers: newBuyers7d,  orders: newOrders7d },
    alerts: {
      pendingProducts,
      outOfStock,
      databaseStatus: 'healthy',
      paymentsStatus: 'operational',
    },
    recentOrders
  })
}
