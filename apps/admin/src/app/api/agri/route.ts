import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// The agri oversight lens: every unresolved harvest on the platform (with
// reservations at stake), and every livestock record missing its Animal
// Identification Act brand mark.
export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const [harvests, unmarkedLivestock] = await Promise.all([
    prisma.product.findMany({
      where: {
        isHarvestPreOrder: true,
        harvestStatus: { in: ['GROWING', 'HARVEST_READY'] },
      },
      orderBy: { expectedHarvestDate: 'asc' },
      select: {
        id: true, name: true, harvestStatus: true,
        plantedAt: true, expectedHarvestDate: true,
        estimatedYield: true, yieldUnit: true,
        seller: { select: { brandName: true, email: true, phone: true } },
        orderItems: {
          where:  { order: { status: 'RESERVED' } },
          select: { quantity: true },
        },
      },
    }),
    prisma.livestockDetail.findMany({
      where: { OR: [{ brandMark: null }, { brandMark: '' }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, species: true, breed: true, purpose: true, createdAt: true,
        product: { select: { id: true, name: true, status: true, seller: { select: { brandName: true } } } },
        piece:   { select: { id: true, title: true, currentStage: true, seller: { select: { brandName: true } } } },
        auction: { select: { id: true, title: true, status: true, seller: { select: { brandName: true } } } },
      },
    }),
  ])

  return NextResponse.json({ harvests, unmarkedLivestock })
}
