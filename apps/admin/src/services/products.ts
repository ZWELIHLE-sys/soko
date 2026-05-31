import { prisma } from '@vuna/db'

export async function listProducts(query?: string, limit?: number, locationId?: string) {
  return prisma.product.findMany({
    where: (query || locationId) ? {
      ...(query      ? { name: { contains: query, mode: 'insensitive' } } : {}),
      ...(locationId ? { locationId } : {}),
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      seller:   { select: { brandName: true } },
      category: { select: { name: true, icon: true } },
    },
  })
}

export async function updateProductStatus(productId: string, status: string) {
  return prisma.product.update({ where: { id: productId }, data: { status: status as never } })
}
