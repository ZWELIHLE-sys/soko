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

  const events = await prisma.auctionEvent.findMany({
    orderBy: { biddingStartDate: 'desc' },
    include: {
      _count: { select: { items: true } },
      items: {
        where: { status: 'PENDING' },
        select: { id: true },
      },
    },
  })

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, theme, submissionDeadline, catalogueOpenDate, biddingStartDate, biddingEndDate } = body

  if (!title || !submissionDeadline || !catalogueOpenDate || !biddingStartDate || !biddingEndDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const event = await prisma.auctionEvent.create({
    data: {
      title,
      description: description || null,
      theme: theme || null,
      submissionDeadline: new Date(submissionDeadline),
      catalogueOpenDate:  new Date(catalogueOpenDate),
      biddingStartDate:   new Date(biddingStartDate),
      biddingEndDate:     new Date(biddingEndDate),
    },
  })

  return NextResponse.json(event)
}
