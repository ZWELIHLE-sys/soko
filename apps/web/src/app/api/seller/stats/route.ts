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
    select: { id: true, status: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const [totalProducts, pendingOrders, totalOrders, deliveredOrders, auctions, marketListings] =
    await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id, status: 'ACTIVE' } }),
      prisma.order.count({ where: { sellerId: seller.id, status: 'PENDING' } }),
      prisma.order.count({ where: { sellerId: seller.id } }),
      prisma.order.findMany({
        where: { sellerId: seller.id, status: 'DELIVERED' },
        select: { totalAmount: true },
      }),
      prisma.auction.count({ where: { sellerId: seller.id } }),
      prisma.marketListing.count({ where: { sellerId: seller.id } }),
    ])

  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  return NextResponse.json({
    status: seller.status,
    totalProducts,
    pendingOrders,
    totalOrders,
    totalEarnings,
    auctions,
    marketListings,
  })
}
