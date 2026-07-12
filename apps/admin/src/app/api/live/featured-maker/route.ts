import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const [current, history] = await Promise.all([
    prisma.featuredMaker.findFirst({
      where:   { isActive: true },
      include: { seller: { select: { id: true, brandName: true, avatar: true, bio: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.featuredMaker.findMany({
      where:   { isActive: false },
      include: { seller: { select: { id: true, brandName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ])

  return NextResponse.json({ current, history })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { sellerId, note, welcomeProductId } = await req.json()
  if (!sellerId) return badRequest('sellerId is required.')

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
  if (!seller) return badRequest('Seller not found.')

  // Only one active spotlight at a time
  const [, created] = await prisma.$transaction([
    prisma.featuredMaker.updateMany({
      where: { isActive: true },
      data:  { isActive: false },
    }),
    prisma.featuredMaker.create({
      data: {
        sellerId,
        note:             note?.trim() || null,
        welcomeProductId: welcomeProductId || null,
        isActive:         true,
      },
      include: { seller: { select: { id: true, brandName: true } } },
    }),
  ])

  return NextResponse.json(created, { status: 201 })
}
