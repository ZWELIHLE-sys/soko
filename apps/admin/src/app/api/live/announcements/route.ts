import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'

export const dynamic = 'force-dynamic'

// Which room hears the announcement. GLOBAL = every page. Agri joins this list later.
const CHANNELS = ['GLOBAL', 'MARKET', 'AUCTION', 'SHOP'] as const

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const channel = new URL(req.url).searchParams.get('channel')

  const announcements = await prisma.announcement.findMany({
    where:   channel ? { channel } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { message, link, kind, channel, pieceId, expiresInMinutes } = await req.json()
  if (!message?.trim()) return badRequest('Message is required.')
  if (message.length > 200) return badRequest('Keep announcements under 200 characters.')
  if (channel && !CHANNELS.includes(channel)) return badRequest('Unknown channel.')

  const announcement = await prisma.announcement.create({
    data: {
      message:   message.trim(),
      link:      link?.trim() || null,
      kind:      kind || 'GENERAL',
      channel:   channel || 'GLOBAL',
      pieceId:   pieceId || null,
      isActive:  true,
      expiresAt: expiresInMinutes
        ? new Date(Date.now() + Number(expiresInMinutes) * 60 * 1000)
        : null,
    },
  })
  return NextResponse.json(announcement, { status: 201 })
}
