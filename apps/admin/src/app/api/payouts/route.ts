import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { getPayouts, markPaidOut } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const orders = await getPayouts()
  return NextResponse.json(orders)
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { orderIds } = await req.json()
  if (!Array.isArray(orderIds) || orderIds.length === 0)
    return badRequest('No order IDs provided')

  await markPaidOut(orderIds)
  return NextResponse.json({ ok: true })
}
