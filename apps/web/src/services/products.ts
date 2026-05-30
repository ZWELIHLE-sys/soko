import { prisma } from '@vuna/db'

export async function getSellerProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId, status: { not: 'SUSPENDED' } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSellerProductForOwner(sellerId: string, productId: string) {
  return prisma.product.findFirst({ where: { id: productId, sellerId } })
}

export async function createProduct(
  sellerId: string,
  locationId: string,
  data: {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    images: string[]
    bulkMinQty?: number | null
    bulkPrice?: number | null
  },
) {
  return prisma.product.create({
    data: { ...data, sellerId, locationId, status: 'ACTIVE' },
  })
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    status: string
    bulkMinQty: number | null
    bulkPrice: number | null
  }>,
) {
  return prisma.product.update({ where: { id: productId }, data })
}

export async function softDeleteProduct(productId: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { status: 'SUSPENDED' },
  })
}

export async function getSellerProductStats(sellerId: string) {
  const items = await prisma.orderItem.findMany({
    where: { product: { sellerId } },
    select: {
      productId: true,
      quantity: true,
      price: true,
      order: { select: { status: true } },
    },
  })

  const statsMap: Record<string, { orderCount: number; revenue: number }> = {}
  for (const item of items) {
    if (!statsMap[item.productId]) statsMap[item.productId] = { orderCount: 0, revenue: 0 }
    statsMap[item.productId].orderCount += 1
    if (item.order.status === 'DELIVERED') {
      statsMap[item.productId].revenue += item.price * item.quantity
    }
  }
  return statsMap
}
