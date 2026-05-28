import { NextResponse } from 'next/server'
import { prisma } from '@vuna/db'

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where:   { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take:    12,
    select: {
      id:        true,
      content:   true,
      rating:    true,
      createdAt: true,
      user:      { select: { name: true, avatar: true } },
    },
  })

  return NextResponse.json(testimonials)
}
