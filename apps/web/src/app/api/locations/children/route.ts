import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET(req: NextRequest) {
  const parentId = req.nextUrl.searchParams.get('parentId')

  if (!parentId) {
    return NextResponse.json({ error: 'parentId required' }, { status: 400 })
  }

  const children = await prisma.location.findMany({
    where: { parentId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(children)
}
