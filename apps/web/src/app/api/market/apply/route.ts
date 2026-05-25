import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const { marketId, productIds, sellerNote } = await req.json()

  if (!marketId || !productIds || productIds.length === 0) {
    return NextResponse.json({ error: 'marketId and at least one product are required' }, { status: 400 })
  }

  const market = await prisma.market.findUnique({ where: { id: marketId } })
  if (!market || !market.isActive) {
    return NextResponse.json({ error: 'Market not found or not accepting applications' }, { status: 404 })
  }

  const now = new Date()
  if (now > market.applicationDeadline) {
    return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
  })
  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }
  if (seller.status !== 'VERIFIED') {
    return NextResponse.json({ error: 'Only verified sellers can apply to the market' }, { status: 403 })
  }

  // Verify products belong to this seller
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, sellerId: seller.id, status: 'ACTIVE' },
  })
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products are invalid' }, { status: 400 })
  }

  // Upsert so a seller can update their application if needed
  const listing = await prisma.marketListing.upsert({
    where: { marketId_sellerId: { marketId, sellerId: seller.id } },
    create: {
      marketId,
      sellerId: seller.id,
      productIds,
      sellerNote: sellerNote || null,
    },
    update: {
      productIds,
      sellerNote: sellerNote || null,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ listing }, { status: 201 })
}
