import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const countries = await prisma.location.findMany({
    where: { type: 'COUNTRY', isUnlocked: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(countries)
}
