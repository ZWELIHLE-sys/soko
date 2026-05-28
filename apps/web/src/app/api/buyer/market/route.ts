import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUYER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const markets = await prisma.market.findMany({
    where:   { isActive: true },
    orderBy: { startDate: 'asc' },
    select: {
      id:                 true,
      title:              true,
      description:        true,
      theme:              true,
      startDate:          true,
      endDate:            true,
      applicationDeadline: true,
      bannerImage:        true,
      makerInResident: {
        select: { brandName: true, avatar: true, bio: true }
      },
      listings: {
        where:  { status: 'APPROVED' },
        select: { id: true },
      }
    }
  })

  return NextResponse.json(markets)
}
