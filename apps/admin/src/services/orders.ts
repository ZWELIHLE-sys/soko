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

export async function getPayouts() {
  return prisma.order.findMany({
    where: { status: 'DELIVERED' },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          brandName: true, bankName: true, accountHolder: true,
          accountNumber: true, branchCode: true,
        },
      },
      buyer: { select: { name: true } },
    },
  })
}

export async function markPaidOut(orderIds: string[]) {
  return prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { payoutStatus: 'PAID_OUT' },
  })
}
