'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Upload, X, ArrowLeft, ImagePlus } from 'lucide-react'
import styles from './new.module.css'

interface Category { id: string; name: string; slug: string }

export default function NewPiecePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId]   = useState('')
  const [images, setImages]           = useState<string[]>([])
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 5) {
      setError('You can upload up to 5 photos.')
      return
    }

    setUploading(true)
    setError('')

    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'vuna/pieces')
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setImages(prev => [...prev, data.url])
      else {
        setError(data.error ?? 'Upload failed.')
        break
      }
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim() || !categoryId) {
      setError('Title, description and category are required.')
      return
    }
    if (images.length === 0) {
      setError('Please upload at least one photo of the piece.')
      return
    }

    setSaving(true)
    const res = await fetch('/api/seller/pieces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, images, categoryId }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Could not submit piece.')
      return
    }

    router.push('/seller/pieces')
  }

  return (
    <div className={styles.page}>
      <Link href="/seller/pieces" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to My Pieces
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>
          <Sparkles size={22} className={styles.titleIcon} /> Submit a Special Piece
        </h1>
        <p className={styles.subtitle}>
          Special pieces enter the Vuna journey: Market debut → Auction bidding → Shop
          (if unsold). Choose pieces that deserve the spotlight. Most of your stock
          stays in regular shop listings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.field}>
          <label className={styles.label}>Piece title</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Hand-carved umbete wooden bowl"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={80}
            required
          />
          <div className={styles.hint}>{title.length}/80 characters</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            rows={5}
            placeholder="Tell the story of this piece — what makes it special, what materials, how long it took, who you are as the maker."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Photos <span className={styles.hint}>(1–5, first photo is the cover)</span>
          </label>

          <div className={styles.imageGrid}>
            {images.map((url, i) => (
              <div key={url} className={styles.imageThumb}>
                <Image src={url} alt={`Piece photo ${i + 1}`} fill sizes="120px" style={{ objectFit: 'cover' }} />
                <button
                  type="button"
                  className={styles.removeImg}
                  onClick={() => removeImage(i)}
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
                {i === 0 && <span className={styles.coverBadge}>Cover</span>}
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading
                  ? <Upload size={20} className={styles.spin} />
                  : <ImagePlus size={20} />
                }
                <span>{uploading ? 'Uploading...' : 'Add photo'}</span>
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Link href="/seller/pieces" className={styles.cancelBtn}>Cancel</Link>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={saving || uploading}
          >
            {saving ? 'Submitting...' : 'Submit Piece'}
          </button>
        </div>

        <p className={styles.disclaimer}>
          Once submitted, admin will review your piece and assign it to an upcoming
          Sunday Market. You will see updates here as the piece moves through the journey.
        </p>
      </form>
    </div>
  )
}
