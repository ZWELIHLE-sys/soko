import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin, unauthorized } from '@/lib/auth-helpers'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024 // 150 MB

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  try {
    const formData = await req.formData()
    const file   = formData.get('file')   as File | null
    const folder = (formData.get('folder') as string) || 'vuna/admin'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Unsupported file type. Photos: JPEG/PNG/WebP. Videos: MP4/MOV/WebM.' },
        { status: 400 },
      )
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxBytes / (1024 * 1024)} MB.` },
        { status: 400 },
      )
    }

    const bytes  = await file.arrayBuffer()
    const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: isVideo ? 'video' : 'image',
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('Admin upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
