import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const now = new Date()

  // Find the most relevant market: active & not yet ended, or upcoming
  const market = await prisma.market.findFirst({
    where: {
      isActive: true,
      endDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
    include: {
      listings: {
        where: { status: 'APPROVED' },
        include: {
          seller: {
            select: {
              id: true,
              brandName: true,
              bio: true,
              avatar: true,
              isVerified: true,
              location: { select: { name: true } },
              category: { select: { name: true, icon: true, slug: true } },
            },
          },
        },
      },
    },
  })

  if (!market) {
    return NextResponse.json({ market: null })
  }

  // For each approved listing, fetch the featured products
  const listingsWithProducts = await Promise.all(
    market.listings.map(async listing => {
      const products = listing.productIds.length > 0
        ? await prisma.product.findMany({
            where: {
              id: { in: listing.productIds },
              status: 'ACTIVE',
            },
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              category: { select: { name: true, icon: true, slug: true } },
            },
          })
        : []

      return { ...listing, products }
    })
  )

  return NextResponse.json({
    market: { ...market, listings: listingsWithProducts },
  })
}
