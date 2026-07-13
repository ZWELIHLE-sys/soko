import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session?.user?.email) return unauthorized()

  const limited = checkRateLimit(req, 'admin-password', 5, 60_000)
  if (limited) return limited

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword) {
    return badRequest('Current password and new password are required.')
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
    return badRequest('New password must be between 8 and 200 characters.')
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
