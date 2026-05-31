import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { listOrders } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const locationId = new URL(req.url).searchParams.get('locationId') ?? undefined
  const orders = await listOrders({ locationId })
  return NextResponse.json(orders)
}
