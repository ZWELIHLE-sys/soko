import { NextRequest, NextResponse } from 'next/server'
import { requireBuyerId, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export async function POST(req: NextRequest) {
  const buyerId = await requireBuyerId()
  if (!buyerId) return unauthorized()

  const { content, rating } = await req.json()
  if (typeof content !== 'string' || !content.trim()) return badRequest('Please write something before submitting.')
  if (content.trim().length > 500) return badRequest('Please keep your testimonial under 500 characters.')

  const parsedRating = Math.min(5, Math.max(1, parseInt(rating) || 5))

  // Starts hidden — admin approves before it appears on the public homepage.
  // Protects the homepage from unmoderated content (the admin Testimonials
  // page has APPROVED/HIDDEN tabs to review the queue).
  const testimonial = await prisma.testimonial.create({
    data: { userId: buyerId, content: content.trim(), rating: parsedRating, isApproved: false },
  })

  return NextResponse.json(testimonial, { status: 201 })
}
