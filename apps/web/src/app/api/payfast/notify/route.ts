import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import { generateSignature } from '@/lib/payfast'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const data: Record<string, string> = {}
    params.forEach((value, key) => { data[key] = value })

    // Verify signature
    const receivedSignature = data.signature
    delete data.signature

    const expectedSignature = generateSignature(data, process.env.PAYFAST_PASSPHRASE)

    if (receivedSignature !== expectedSignature) {
      console.error('PayFast signature mismatch')
      return new NextResponse('Signature mismatch', { status: 400 })
    }

    const paymentStatus = data.payment_status
    const orderId       = data.m_payment_id

    if (paymentStatus === 'COMPLETE') {
      // Update all orders matching this payment
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      })
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('PayFast ITN error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
