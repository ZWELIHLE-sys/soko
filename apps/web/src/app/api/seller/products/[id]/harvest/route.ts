import { NextRequest, NextResponse } from 'next/server'
import { requireSeller, unauthorized, badRequest } from '@/lib/auth-helpers'
import { resolveHarvest } from '@/services/products'
import { sendHarvestReadyEmail, sendHarvestFailedEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const { id } = await params
  const { action } = await req.json()
  if (action !== 'ready' && action !== 'failed') return badRequest("action must be 'ready' or 'failed'.")

  const result = await resolveHarvest(seller.id, id, action === 'ready' ? 'READY' : 'FAILED')
  if (result.error) return badRequest(result.error)

  // Tell every reserved buyer what happened — failures here must not undo the flip
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  for (const r of result.reservations ?? []) {
    try {
      if (action === 'ready') {
        await sendHarvestReadyEmail(
          r.buyer.email,
          r.buyer.name,
          result.product!.name,
          r.orderNumber,
          `${baseUrl}/buyer/orders/${r.id}/pay`,
        )
      } else {
        await sendHarvestFailedEmail(r.buyer.email, r.buyer.name, result.product!.name)
      }
    } catch (err) {
      console.error('Harvest email failed for order', r.id, err)
    }
  }

  return NextResponse.json({
    ok: true,
    notified: result.reservations?.length ?? 0,
    outcome: action,
  })
}
