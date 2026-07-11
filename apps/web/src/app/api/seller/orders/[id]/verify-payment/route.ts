import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, badRequest } from '@/lib/auth-helpers'
import { verifyPaymentReceived } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const result = await verifyPaymentReceived(id, seller.id)
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.order)
}
