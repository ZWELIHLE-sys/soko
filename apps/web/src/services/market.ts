import { prisma } from '@vuna/db'

export async function getCurrentMarket() {
  const now = new Date()

  const market = await prisma.market.findFirst({
    where: { isActive: true, endDate: { gte: now } },
    orderBy: { startDate: 'asc' },
    include: {
      listings: {
        where: { status: 'APPROVED' },
        include: {
          seller: {
            select: {
              id: true, brandName: true, bio: true, avatar: true, isVerified: true,
              location: { select: { name: true } },
              category: { select: { name: true, icon: true, slug: true } },
            },
          },
        },
      },
    },
  })

  if (!market) return null

  // Batch every stall's products into ONE query (was N+1 — one query per stall)
  const allProductIds = [...new Set(market.listings.flatMap(l => l.productIds))]
  const products = allProductIds.length > 0
    ? await prisma.product.findMany({
        where:  { id: { in: allProductIds }, status: 'ACTIVE' },
        select: {
          id: true, name: true, price: true, images: true, stock: true,
          category: { select: { name: true, icon: true, slug: true } },
        },
      })
    : []
  const productsById = new Map(products.map(p => [p.id, p]))

  const listingsWithProducts = market.listings.map(listing => ({
    ...listing,
    products: listing.productIds
      .map(id => productsById.get(id))
      .filter((p): p is NonNullable<typeof p> => p != null),
  }))

  return { ...market, listings: listingsWithProducts }
}

export async function applyToMarket(
  sellerId: string,
  marketId: string,
  productIds: string[],
  sellerNote?: string,
) {
  const market = await prisma.market.findUnique({ where: { id: marketId } })
  if (!market || !market.isActive) return { error: 'Market not found or not accepting applications' }
  if (new Date() > market.applicationDeadline) return { error: 'Application deadline has passed' }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, sellerId, status: 'ACTIVE' },
  })
  if (products.length !== productIds.length) return { error: 'One or more products are invalid' }

  const listing = await prisma.marketListing.upsert({
    where: { marketId_sellerId: { marketId, sellerId } },
    create: { marketId, sellerId, productIds, sellerNote: sellerNote || null },
    update: { productIds, sellerNote: sellerNote || null, status: 'PENDING' },
  })
  return { listing }
}

export async function getSellerMarketData(sellerId: string) {
  const [markets, listings, sellerProducts] = await Promise.all([
    prisma.market.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
      include: {
        makerInResident: { select: { id: true, brandName: true, name: true, avatar: true, bio: true } },
        _count: { select: { listings: true } },
      },
    }),
    prisma.marketListing.findMany({
      where: { sellerId },
      include: { market: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { sellerId, status: 'ACTIVE' },
      select: {
        id: true, name: true, images: true, price: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const allProductIds = listings.flatMap(l => l.productIds)
  const listingProducts = allProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: allProductIds } },
        select: { id: true, name: true, images: true, price: true },
      })
    : []

  const productMap: Record<string, { id: string; name: string; images: string[]; price: number }> = {}
  for (const p of listingProducts) productMap[p.id] = p

  const listingsWithProducts = listings.map(l => ({
    ...l,
    products: l.productIds.map(pid => productMap[pid]).filter(Boolean),
  }))

  return { markets, listings: listingsWithProducts, sellerProducts }
}

export async function getBuyerMarkets() {
  return prisma.market.findMany({
    where: { isActive: true },
    orderBy: { startDate: 'asc' },
    select: {
      id: true, title: true, description: true, theme: true,
      startDate: true, endDate: true, applicationDeadline: true, bannerImage: true,
      makerInResident: { select: { brandName: true, avatar: true, bio: true } },
      listings: { where: { status: 'APPROVED' }, select: { id: true } },
    },
  })
}
