import { NextResponse } from 'next/server'
import { requireSeller, unauthorized } from '@/lib/auth-helpers'
import { getSellerCommissionSummary, getSellerInvoices } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const seller = await requireSeller()
  if (!seller) return unauthorized('Seller login required')

  const [summary, invoices] = await Promise.all([
    getSellerCommissionSummary(seller.id),
    getSellerInvoices(seller.id),
  ])

  return NextResponse.json({ summary, invoices })
}
