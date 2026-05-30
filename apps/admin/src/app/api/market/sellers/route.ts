import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const sellers = await prisma.seller.findMany({
    where:   { status: 'VERIFIED' },
    orderBy: { brandName: 'asc' },
    select: {
      id: true, brandName: true,
      category: { select: { name: true } },
      location: { select: { name: true } },
      _count:   { select: { products: true } },
    },
  })

  return NextResponse.json(sellers)
}
