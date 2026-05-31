import { prisma } from '@vuna/db'

export async function listSellers(opts?: { locationId?: string }) {
  return prisma.seller.findMany({
    where: opts?.locationId ? { locationId: opts.locationId } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, brandName: true, email: true, phone: true,
      status: true, isVerified: true, createdAt: true,
      bio: true, customCategory: true, socialMediaLink: true,
      proofUrls: true, videoUrl: true,
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
