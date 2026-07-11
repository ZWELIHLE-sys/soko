import { prisma } from '@vuna/db'

export async function listOrders(opts?: { locationId?: string }) {
  return prisma.order.findMany({
    where: opts?.locationId ? { seller: { locationId: opts.locationId } } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      buyer:  { select: { name: true, email: true } },
      seller: { select: { brandName: true } },
      items:  { include: { product: { select: { name: true } } } },
    },
  })
}
