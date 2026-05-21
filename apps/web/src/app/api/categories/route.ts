import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, icon: true, slug: true },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(categories)
}
