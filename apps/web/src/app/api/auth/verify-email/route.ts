import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { vEmail, vString, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  // A 6-digit OTP is brute-forceable — cap attempts hard
  const limited = checkRateLimit(req, 'verify-email', 8, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()

    let email: string, otp: string
    try {
      email = vEmail(body.email)
      otp   = vString(body.otp, 'Code', { min: 6, max: 6 })
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 })
    }

    if (!user.emailVerifyToken || user.emailVerifyToken !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    if (!user.emailVerifyExpiry || new Date() > user.emailVerifyExpiry) {
      return NextResponse.json({ error: 'Verification code has expired. Please register again.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified:        true,
        emailVerifyToken:  null,
        emailVerifyExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
