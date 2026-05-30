import { prisma } from '@vuna/db'

export async function getFeaturedListings() {
  return prisma.featuredListing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true, name: true, price: true, status: true, images: true,
          seller:   { select: { brandName: true } },
          category: { select: { name: true, icon: true } },
        },
      },
    },
  })
}

export async function upsertFeaturedListing(productId: string, expiresAt: string, note?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return { error: 'Product not found' }
  if (product.status !== 'ACTIVE') return { error: 'Only ACTIVE products can be featured' }

  const listing = await prisma.featuredListing.upsert({
    where: { productId },
    update: { expiresAt: new Date(expiresAt), note: note ?? null },
    create: { productId, expiresAt: new Date(expiresAt), note: note ?? null },
  })
  return { listing }
}

export async function removeFeaturedListing(listingId: string) {
  return prisma.featuredListing.delete({ where: { id: listingId } })
}
