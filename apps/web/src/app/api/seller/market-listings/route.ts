import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
    }

    const seller = await prisma.seller.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    })
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

    const [markets, listings, sellerProducts] = await Promise.all([
      prisma.market.findMany({
        where: { isActive: true },
        orderBy: { startDate: 'asc' },
        include: {
          makerInResident: {
            select: { id: true, brandName: true, name: true, avatar: true, bio: true },
          },
          _count: { select: { listings: true } },
        },
      }),
      prisma.marketListing.findMany({
        where: { sellerId: seller.id },
        include: { market: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { sellerId: seller.id, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          images: true,
          price: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Resolve product details for each listing's productIds
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

    return NextResponse.json({ markets, listings: listingsWithProducts, sellerProducts })
  } catch (err) {
    console.error('[market-listings GET]', err)
    return NextResponse.json({ error: 'Internal server error', markets: [], listings: [], sellerProducts: [] }, { status: 500 })
  }
}
