import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// The current advertising banner: active, and within its schedule window
// (if one is set). Returns the newest match, or null.
export async function GET() {
  const now = new Date()
  const ad = await prisma.adBanner.findFirst({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null },   { endDate:   { gte: now } }] },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, advertiserName: true, imageUrl: true, linkUrl: true },
  })
  return NextResponse.json({ ad })
}
