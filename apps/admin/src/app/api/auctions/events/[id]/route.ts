import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const event = await prisma.auctionEvent.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          seller:   { select: { brandName: true } },
          category: { select: { name: true } },
          winner:   { select: { name: true } },
          _count:   { select: { bids: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const [event] = await Promise.all([
    prisma.auctionEvent.update({ where: { id }, data: { status } }),
    // When event goes LIVE — all approved items go live automatically
    status === 'LIVE'
      ? prisma.auction.updateMany({ where: { auctionEventId: id, status: 'APPROVED' }, data: { status: 'LIVE' } })
      : Promise.resolve(),
    // When event ends — all live items end automatically
    status === 'ENDED'
      ? prisma.auction.updateMany({ where: { auctionEventId: id, status: 'LIVE' }, data: { status: 'ENDED' } })
      : Promise.resolve(),
  ])

  return NextResponse.json(event)
}
