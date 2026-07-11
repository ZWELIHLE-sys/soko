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

  if (!proofUrl) return badRequest('proofUrl is required.')

  const result = await submitPaymentProof(id, buyerId, proofUrl, paymentRef)
  if (result.error) return badRequest(result.error)

  return NextResponse.json(result.order)
}
