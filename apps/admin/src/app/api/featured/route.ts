import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { getFeaturedListings, upsertFeaturedListing } from '@/services/featured'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const listings = await getFeaturedListings()
  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { productId, expiresAt, note } = await req.json()
  if (!productId || !expiresAt) return badRequest('productId and expiresAt are required')

  const result = await upsertFeaturedListing(productId, expiresAt, note)
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.listing, { status: 201 })
}
