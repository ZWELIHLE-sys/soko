import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { vEmail, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  // Tight limit — stops reset-email spamming of any address
  const limited = checkRateLimit(req, 'forgot-password', 3, 60_000)
  if (limited) return limited

  try {
    let email: string
    try {
      email = vEmail((await req.json()).email)
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    const user = await prisma.user.findUnique({ where: { email } })
    const seller = !user ? await prisma.seller.findUnique({ where: { email } }) : null

    if (!user && !seller) {
      // Return success anyway — never reveal whether an email exists
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
    }

    const name = (user ?? seller)!.name
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken: tokenHash, resetPasswordExpiry: expiry },
      })
    } else {
      await prisma.seller.update({
        where: { email },
        data: { resetPasswordToken: tokenHash, resetPasswordExpiry: expiry },
      })
    }

    try {
      await sendPasswordResetEmail(email, name, resetUrl)
    } catch (mailErr) {
      console.error('Password reset email failed:', mailErr)
    }

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
