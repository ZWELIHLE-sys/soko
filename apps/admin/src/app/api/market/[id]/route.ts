import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized, notFound } from '@/lib/auth-helpers'
import { getMarket, updateMarket } from '@/services/market'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const market = await getMarket(id)
  if (!market) return notFound()
  return NextResponse.json(market)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()

  const market = await updateMarket(id, {
    ...(body.makerInResidenceId !== undefined && { makerInResidenceId: body.makerInResidenceId || null }),
    ...(body.isActive !== undefined && { isActive: body.isActive }),
  })
  return NextResponse.json(market)
}
