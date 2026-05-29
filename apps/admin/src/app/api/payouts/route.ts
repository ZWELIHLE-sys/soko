import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { brandName: true, bankName: true, accountHolder: true, accountNumber: true, branchCode: true } },
      buyer:  { select: { name: true } },
    },
  })

  return NextResponse.json(orders)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { orderIds } = await req.json()
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 })
  }

  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { payoutStatus: 'PAID_OUT' },
  })

  return NextResponse.json({ ok: true })
}
