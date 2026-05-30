import { prisma } from '@vuna/db'

export async function listSellers() {
  return prisma.seller.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      location: { select: { name: true } },
      category: { select: { name: true, icon: true } },
      _count: { select: { products: true, orders: true } },
    },
  })
}

export async function updateSellerStatus(sellerId: string, status: string) {
  return prisma.seller.update({
    where: { id: sellerId },
    data: { status: status as never, isVerified: status === 'VERIFIED' },
  })
}
