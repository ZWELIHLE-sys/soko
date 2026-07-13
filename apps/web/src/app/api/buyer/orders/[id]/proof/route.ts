import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { submitPaymentProof } from '@/services/orders'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { id } = await params
  const { proofUrl, paymentRef } = await req.json()

  if (typeof proofUrl !== 'string' || !proofUrl.trim() || proofUrl.length > 600) {
    return badRequest('A valid proof of payment is required.')
  }
  if (paymentRef != null && (typeof paymentRef !== 'string' || paymentRef.length > 120)) {
    return badRequest('Payment reference is too long.')
  }

  const result = await submitPaymentProof(id, buyerId, proofUrl, paymentRef)
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.order)
}
