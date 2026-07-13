import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@vuna/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/rate-limit'
import { vString, vEmail, vPassword, vOptionalString, vId, validationError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'register-seller', 5, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()
    const { bio, customCategory, proofUrls, videoUrl, socialMediaLink, hasDeclaration } = body

    let name: string, email: string, password: string, phone: string, brandName: string
    let locationId: string, categoryId: string
    let suburb: string | null
    try {
      name       = vString(body.name, 'Name', { min: 2, max: 80 })
      email      = vEmail(body.email)
      password   = vPassword(body.password)
      phone      = vString(body.phone, 'Phone', { min: 6, max: 30 })
      brandName  = vString(body.brandName, 'Brand name', { min: 2, max: 80 })
      locationId = vId(body.locationId, 'Location')
      categoryId = vId(body.categoryId, 'Category')
      suburb     = vOptionalString(body.suburb, 'Suburb', 120)
    } catch (err) {
      const bad = validationError(err); if (bad) return bad
      throw err
    }

    if (categoryId === 'cat-other' && !customCategory?.trim()) {
      return NextResponse.json({ error: 'Please describe what you make' }, { status: 400 })
    }

    if (!Array.isArray(proofUrls) || proofUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one photo of you making your product' },
        { status: 400 },
      )
    }

    const existing = await prisma.seller.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'A seller account with this email already exists' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Seller starts PENDING until admin verifies
    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        brandName,
        bio:             vOptionalString(bio, 'Bio', 1000),
        suburb,
        customCategory:  vOptionalString(customCategory, 'Category', 120),
        proofUrls:       (proofUrls as unknown[]).filter(u => typeof u === 'string').slice(0, 10) as string[],
        videoUrl:        vOptionalString(videoUrl, 'Video', 400),
        socialMediaLink: vOptionalString(socialMediaLink, 'Social link', 400),
        hasDeclaration:  hasDeclaration === true,
        locationId,
        categoryId,
        status: 'PENDING',
        isVerified: false,
      },
      select: {
        id: true, name: true, email: true, brandName: true, status: true, createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Seller application submitted! We will review and verify your account within 48 hours.',
        seller,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Seller registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
