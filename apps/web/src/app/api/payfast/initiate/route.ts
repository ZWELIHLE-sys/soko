import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildPayFastForm } from '@/lib/payfast'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { orderId, amount, firstName, lastName, email, itemName } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const fields = buildPayFastForm({
      merchant_id:   process.env.PAYFAST_MERCHANT_ID!,
      merchant_key:  process.env.PAYFAST_MERCHANT_KEY!,
      return_url:    `${appUrl}/checkout/success?orderId=${orderId}`,
      cancel_url:    `${appUrl}/checkout/cancel`,
      notify_url:    `${appUrl}/api/payfast/notify`,
      name_first:    firstName,
      name_last:     lastName,
      email_address: email,
      m_payment_id:  orderId,
      amount:        parseFloat(amount).toFixed(2),
      item_name:     itemName,
      item_description: 'African made products — Vuna marketplace',
    })

    return NextResponse.json({ fields })

  } catch (error) {
    console.error('PayFast initiate error:', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}