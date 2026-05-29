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

  const markets = await prisma.market.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      makerInResident: { select: { id: true, brandName: true } },
      _count: { select: { listings: true } },
      listings: {
        where: { status: 'PENDING' },
        select: { id: true },
      },
    },
  })

  return NextResponse.json(markets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const {
    marketType, title, description, theme,
    startDate, endDate, applicationDeadline, maxListings,
  } = body

  if (!title || !startDate || !endDate || !applicationDeadline) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const market = await prisma.market.create({
    data: {
      marketType:          marketType || 'SUNDAY_MARKET',
      title,
      description:         description || null,
      theme:               theme || null,
      startDate:           new Date(startDate),
      endDate:             new Date(endDate),
      applicationDeadline: new Date(applicationDeadline),
      maxListings:         maxListings ? parseInt(maxListings) : null,
    },
  })

  return NextResponse.json(market)
}
