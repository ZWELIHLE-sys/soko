'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, X, Globe, FileText, CheckCircle } from 'lucide-react'
import styles from './newProduct.module.css'

interface Category { id: string; name: string; icon: string | null }

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '1',
    categoryId: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load categories')
        return res.json()
      })
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    setUploading(true)
    setError('')

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setImages(prev => [...prev, data.url])
      } else {
        setError('Image upload failed. Please try again.')
        break
      }
    }

    setUploading(false)
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (images.length === 0) {
      setError('Please upload at least one product image')
      return
    }

    setSaving(true)

    const res = await fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, images }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      return
    }

    setSuccess('Product listed successfully!')
    setTimeout(() => router.push('/seller/products'), 1500)
  }

  return (
    <div className={styles.wrapper}>
      <Link href="/seller/products" className={styles.back}>
        <ArrowLeft size={13} />
        Back to products
      </Link>
      <h1 className={styles.heading}>List a New Product</h1>
      <p className={styles.subheading}>Share your African made product with the world.</p>

      <form onSubmit={handleSubmit}>

        {/* Image upload */}
        <div className={styles.card}>
          <div className={styles.sectionLabel}>Product Photos</div>

          <div className={styles.imageGrid}>
            {images.map((url, i) => (
              <div key={i} className={styles.imageThumb}>
                <Image src={url} alt={`Product ${i + 1}`} width={100} height={100} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeImage(i)}
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera size={22} />
                {uploading ? 'Uploading...' : 'Add photo'}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          <p className={styles.imageHint}>
            Upload up to 5 photos. Clear, well-lit photos get more sales.
          </p>
        </div>

        {/* Product details */}
        <div className={styles.card}>
          <div className={styles.sectionLabel}>Product Details</div>

          <div className={styles.field}>
            <label className={styles.label}>Product name</label>
            <input
              className={styles.input}
              type="text"
              required
              placeholder="e.g. Hand-stitched Zulu Beadwork Scarf"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              required
              placeholder="Tell buyers about your product — what it is, how you made it, what makes it special..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={5}
            />
            <p className={styles.hint}>Your story sells the product. Be honest and descriptive.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              required
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Price (R)</label>
              <input
                className={styles.input}
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="e.g. 450"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Stock quantity</label>
              <input
                className={styles.input}
                type="number"
                required
                min="1"
                placeholder="How many do you have?"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Listing status */}
        <div className={styles.card}>
          <div className={styles.sectionLabel}>Listing Status</div>

          <div className={styles.statusGrid}>
            <button
              type="button"
              className={`${styles.statusOption} ${form.status === 'ACTIVE' ? styles.statusOptionActive : ''}`}
              onClick={() => setForm({ ...form, status: 'ACTIVE' })}
            >
              <div className={styles.statusOptionLabel}>
                <Globe size={14} />
                List it now
              </div>
              <div className={styles.statusOptionDesc}>Visible to buyers immediately</div>
            </button>

            <button
              type="button"
              className={`${styles.statusOption} ${form.status === 'DRAFT' ? styles.statusOptionActive : ''}`}
              onClick={() => setForm({ ...form, status: 'DRAFT' })}
            >
              <div className={styles.statusOptionLabel}>
                <FileText size={14} />
                Save as draft
              </div>
              <div className={styles.statusOptionDesc}>Not visible until you publish</div>
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {success && (
          <div className={styles.success}>
            <CheckCircle size={15} />
            {success}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={saving || uploading}
          >
            <Globe size={16} />
            {saving ? 'Listing product...' : 'List My Product on Soko'}
          </button>

          <Link href="/seller/products" className={styles.cancelBtn}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
