import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { title, description, theme, startDate, endDate, applicationDeadline, maxListings } = await req.json()

  if (!title || !startDate || !endDate || !applicationDeadline) {
    return NextResponse.json({ error: 'title, startDate, endDate and applicationDeadline are required' }, { status: 400 })
  }

  const market = await prisma.market.create({
    data: {
      title,
      description: description || null,
      theme: theme || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicationDeadline: new Date(applicationDeadline),
      maxListings: maxListings ? parseInt(maxListings) : null,
    },
  })

  return NextResponse.json({ market }, { status: 201 })
}
