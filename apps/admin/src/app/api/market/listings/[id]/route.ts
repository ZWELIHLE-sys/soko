import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { updateMarketListing } from '@/services/market'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { status, adminNote, stallNumber } = await req.json()

  const listing = await updateMarketListing(id, {
    status,
    adminNote,
    stallNumber: stallNumber ? parseInt(stallNumber) : null,
  })
  return NextResponse.json(listing)
}
