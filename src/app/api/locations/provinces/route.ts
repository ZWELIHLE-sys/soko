import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const provinces = await prisma.location.findMany({
    where: { type: 'PROVINCE' },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(provinces)
}