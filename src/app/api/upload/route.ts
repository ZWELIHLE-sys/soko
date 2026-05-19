import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'soko/products',
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
  }
}
