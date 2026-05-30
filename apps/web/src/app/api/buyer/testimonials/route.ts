import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { content, rating } = await req.json()
  if (!content?.trim()) return badRequest('Please write something before submitting.')

  const testimonial = await prisma.testimonial.create({
    data: { userId: buyerId, content: content.trim(), rating: rating ? parseInt(rating) : 5 },
  })

  return NextResponse.json(testimonial, { status: 201 })
}
