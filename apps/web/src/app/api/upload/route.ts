import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary'
import { requireSession, unauthorized } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024 // 150 MB

// Only these destinations are permitted — the client cannot write anywhere else
const ALLOWED_FOLDERS = new Set([
  'vuna/products', 'vuna/pieces', 'vuna/pieces/video', 'vuna/proof',
  'vuna/sellers', 'vuna/verification', 'vuna/uploads',
])

export async function POST(req: NextRequest) {
  // Uploads must come from a logged-in user, and are throttled per caller
  const session = await requireSession()
  if (!session) return unauthorized('You must be signed in to upload.')

  const limited = checkRateLimit(req, 'upload', 40, 60_000)
  if (limited) return limited

  try {
    const formData = await req.formData()
    const file   = formData.get('file')   as File | null
    const rawFolder = (formData.get('folder') as string) || 'vuna/uploads'
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'vuna/uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Unsupported file type. Photos: JPEG/PNG/WebP. Videos: MP4/MOV/WebM.' },
        { status: 400 }
      )
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      const limitMB = maxBytes / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size is ${limitMB} MB.` },
        { status: 400 }
      )
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: isVideo ? 'video' : 'image',
    }

    if (isImage) {
      uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }]
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions)

    return NextResponse.json({ url: result.secure_url })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
