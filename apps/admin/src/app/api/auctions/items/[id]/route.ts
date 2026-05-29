import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params

  const item = await prisma.auction.findUnique({
    where: { id },
    include: {
      seller:   { select: { brandName: true } },
      category: { select: { name: true } },
      winner:   { select: { name: true } },
      bids: {
        orderBy: { amount: 'desc' },
        include: {
          bidder: { select: { name: true } },
        },
      },
    },
  })

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const { status, adminNote } = await req.json()

  const auction = await prisma.auction.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? null,
    },
  })

  return NextResponse.json(auction)
}
