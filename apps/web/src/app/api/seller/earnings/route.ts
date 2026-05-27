import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'SELLER') {
    return NextResponse.json({ error: 'Seller login required' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: {
      sellerId: seller.id,
      status: { in: ['CONFIRMED', 'PACKED', 'IN_TRANSIT', 'DELIVERED'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  })

  const delivered = orders.filter(o => o.status === 'DELIVERED')
  const pending   = orders.filter(o => o.status !== 'DELIVERED')

  const totalEarned  = delivered.reduce((s, o) => s + o.totalAmount, 0)
  const totalPending = pending.reduce((s, o) => s + o.totalAmount, 0)

  // Group delivered earnings by month
  const byMonth: Record<string, number> = {}
  for (const o of delivered) {
    const key = new Date(o.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
    byMonth[key] = (byMonth[key] ?? 0) + o.totalAmount
  }

  return NextResponse.json({
    totalEarned,
    totalPending,
    byMonth,
    delivered,
    pending,
  })
}
