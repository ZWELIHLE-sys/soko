import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, notFound, badRequest } from '@/lib/auth-helpers'
import { getInvoiceDetail, markInvoicePaid } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const invoice = await getInvoiceDetail(id)
  if (!invoice) return notFound('Invoice not found')
  return NextResponse.json(invoice)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const { proofUrl } = await req.json().catch(() => ({}))
  const result = await markInvoicePaid(id, proofUrl)
  if (result.error) return badRequest(result.error)
  return NextResponse.json(result.invoice)
}
