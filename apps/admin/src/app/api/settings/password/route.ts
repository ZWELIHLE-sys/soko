import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session?.user?.email) return unauthorized()

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword) {
    return badRequest('Current password and new password are required.')
  }
  if (newPassword.length < 8) {
    return badRequest('New password must be at least 8 characters.')
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return unauthorized()

  const matches = await bcrypt.compare(currentPassword, user.password)
  if (!matches) return badRequest('Current password is incorrect.')

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data:  { password: hashed },
  })

  return NextResponse.json({ ok: true })
}
