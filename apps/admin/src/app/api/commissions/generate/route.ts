import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { generateInvoice } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { sellerId, periodStart, periodEnd, adminNote } = await req.json()
  if (!sellerId || !periodStart || !periodEnd) {
    return badRequest('sellerId, periodStart and periodEnd are required.')
  }

  const start = new Date(periodStart)
  const end   = new Date(periodEnd)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return badRequest('periodStart must be before periodEnd.')
  }

  const result = await generateInvoice(sellerId, start, end, adminNote)
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.invoice, { status: 201 })
}
