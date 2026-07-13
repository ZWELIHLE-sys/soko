import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { vString, vEmail, vPassword, vOptionalString, vId, validationError } from '@/lib/validation'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'register-buyer', 5, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()

    let name: string, email: string, password: string
    let phone: string | null, suburb: string | null, locationId: string | null
    try {
      name       = vString(body.name, 'Name', { min: 2, max: 80 })
      email      = vEmail(body.email)
      password   = vPassword(body.password)
      phone      = vOptionalString(body.phone, 'Phone', 30)
      suburb     = vOptionalString(body.suburb, 'Suburb', 120)
      locationId = body.locationId ? vId(body.locationId, 'Location') : null
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.user.create({
      data: {
        name,
        email,
        password:           hashedPassword,
        phone,
        locationId,
        suburb,
        role:               'BUYER',
        isVerified:         false,
        emailVerifyToken:   otp,
        emailVerifyExpiry:  expiry,
      },
    })

    try {
      await sendVerificationEmail(email, name, otp)
    } catch (mailErr) {
      console.error('Email send failed:', mailErr)
      // Account is created — don't block the user, just log the failure
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email for your verification code.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Buyer registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
