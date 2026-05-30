import { prisma } from '@vuna/db'

export async function getSellerProfile(sellerId: string) {
  return prisma.seller.findUnique({
    where: { id: sellerId },
    include: { location: true, category: true },
  })
}

export async function updateSellerProfile(
  sellerId: string,
  data: Partial<{
    bio: string
    avatar: string
    banner: string
    phone: string
    suburb: string
    bankName: string
    accountHolder: string
    accountNumber: string
    accountType: string
    branchCode: string
  }>,
) {
  return prisma.seller.update({ where: { id: sellerId }, data })
}

export async function getSellerStats(sellerId: string) {
  const [totalProducts, pendingOrders, totalOrders, deliveredOrders, auctions, marketListings] =
    await Promise.all([
      prisma.product.count({ where: { sellerId, status: 'ACTIVE' } }),
      prisma.order.count({ where: { sellerId, status: 'PENDING' } }),
      prisma.order.count({ where: { sellerId } }),
      prisma.order.findMany({
        where: { sellerId, status: 'DELIVERED' },
        select: { totalAmount: true },
      }),
      prisma.auction.count({ where: { sellerId } }),
      prisma.marketListing.count({ where: { sellerId } }),
    ])

  return {
    totalProducts,
    pendingOrders,
    totalOrders,
    totalEarnings: deliveredOrders.reduce((s, o) => s + o.totalAmount, 0),
    auctions,
    marketListings,
  }
}

export async function getSellerEarnings(sellerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      sellerId,
      status: { in: ['CONFIRMED', 'PACKED', 'IN_TRANSIT', 'DELIVERED'] },
    },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  const delivered = orders.filter(o => o.status === 'DELIVERED')
  const pending   = orders.filter(o => o.status !== 'DELIVERED')

  const byMonth: Record<string, number> = {}
  for (const o of delivered) {
    const key = new Date(o.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
    byMonth[key] = (byMonth[key] ?? 0) + o.totalAmount
  }

  return {
    totalEarned:  delivered.reduce((s, o) => s + o.totalAmount, 0),
    totalPending: pending.reduce((s, o) => s + o.totalAmount, 0),
    byMonth,
    delivered,
    pending,
  }
}
