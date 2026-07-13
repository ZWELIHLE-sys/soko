import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import { vString, vOptionalString, validationError } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const ads = await prisma.adBanner.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(ads)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json()

  let advertiserName: string, imageUrl: string, linkUrl: string | null
  try {
    advertiserName = vString(body.advertiserName, 'Advertiser name', { min: 2, max: 120 })
    imageUrl       = vString(body.imageUrl, 'Banner image', { max: 600 })
    linkUrl        = vOptionalString(body.linkUrl, 'Link', 600)
  } catch (err) {
    const bad = validationError(err); if (bad) return bad
    throw err
  }

  const start = body.startDate ? new Date(body.startDate) : null
  const end   = body.endDate ? new Date(body.endDate) : null
  if (start && Number.isNaN(start.getTime())) return badRequest('Invalid start date.')
  if (end && Number.isNaN(end.getTime())) return badRequest('Invalid end date.')
  if (start && end && end <= start) return badRequest('End date must be after start date.')

  const ad = await prisma.adBanner.create({
    data: { advertiserName, imageUrl, linkUrl, startDate: start, endDate: end, isActive: true },
  })
  return NextResponse.json(ad, { status: 201 })
}
