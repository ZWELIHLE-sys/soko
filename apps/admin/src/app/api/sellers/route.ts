import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { listSellers } from '@/services/sellers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const locationId = new URL(req.url).searchParams.get('locationId') ?? undefined
  const sellers = await listSellers({ locationId })
  return NextResponse.json(sellers)
}
