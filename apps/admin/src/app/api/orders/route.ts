import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { listOrders } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const orders = await listOrders()
  return NextResponse.json(orders)
}
