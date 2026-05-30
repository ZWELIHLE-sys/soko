import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id } = await params
  const { isApproved } = await req.json()

  const testimonial = await prisma.testimonial.update({ where: { id }, data: { isApproved } })
  return NextResponse.json(testimonial)
}
