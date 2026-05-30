'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Send, AlertTriangle, UploadCloud, X } from 'lucide-react'
import type { AuctionEvent, Category } from '../_types'
import styles from '../auctions.module.css'

const BLANK = {
  title: '', description: '', artistStatement: '',
  categoryId: '', startPrice: '', reservePrice: '',
}

interface Props {
  event: AuctionEvent
  categories: Category[]
  onSubmitted: () => void
  onCancel: () => void
}

export function SubmitForm({ event, categories, onSubmitted, onCancel }: Props) {
  const [form, setForm]         = useState(BLANK)
  const [images, setImages]     = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const uploadImage = async (file: File) => {
    if (images.length >= 5) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', 'vuna/auctions')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setImages(p => [...p, data.url])
      else setError(data.error ?? 'Image upload failed.')
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.title || !form.description || !form.categoryId || !form.startPrice) {
      setError('Title, description, category and starting price are required.')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/seller/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, images, auctionEventId: event.id }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? 'Submission failed.'); return }
    onSubmitted()
  }

  return (
    <div className={styles.submitForm}>
      <div className={styles.submitFormHeader}>
        <div>
          <div className={styles.submitFormEyebrow}>Submitting to</div>
          <div className={styles.submitFormTitle}>{event.title}</div>
        </div>
        <button className={styles.cancelHeaderBtn} onClick={onCancel}><X size={16} /></button>
      </div>

      {error && <div className={styles.formError}><AlertTriangle size={13} /> {error}</div>}

      <div className={styles.formNote}>
        Your item will be reviewed for inclusion in the catalogue.
        If selected, it will appear during the preview period and go live on bidding day.
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Item Title <span className={styles.req}>*</span></label>
        <input className={styles.input} value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Hand-beaded Zulu neck piece — one of a kind" />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Artist Statement <span className={styles.optional}>recommended — 2–3 sentences</span>
        </label>
        <textarea className={styles.textarea} rows={3} value={form.artistStatement}
          onChange={e => setForm(f => ({ ...f, artistStatement: e.target.value }))}
          placeholder="Tell bidders the story of this piece — what inspired it, how it was made, what makes it one of a kind..." />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Full Description <span className={styles.req}>*</span></label>
        <textarea className={styles.textarea} rows={4} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Materials, dimensions, technique, condition — everything a serious bidder wants to know..." />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Category <span className={styles.req}>*</span></label>
          <select className={styles.input} value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Starting Bid (R) <span className={styles.req}>*</span></label>
          <input className={styles.input} type="number" min="1" step="0.01" value={form.startPrice}
            onChange={e => setForm(f => ({ ...f, startPrice: e.target.value }))}
            placeholder="e.g. 350.00" />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Reserve Price (R) <span className={styles.optional}>optional — hidden minimum</span></label>
        <input className={styles.input} type="number" min="1" step="0.01" value={form.reservePrice}
          onChange={e => setForm(f => ({ ...f, reservePrice: e.target.value }))}
          placeholder="Leave blank if you have no minimum" />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Photos <span className={styles.optional}>up to 5 · JPEG/PNG/WebP · max 10MB</span>
        </label>
        <div className={styles.imageGrid}>
          {images.map((url, i) => (
            <div key={i} className={styles.imageThumb}>
              <Image src={url} alt="" fill style={{ objectFit: 'cover' }} sizes="80px" />
              <button className={styles.imageRemove}
                onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}>
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className={styles.imageUpload}>
              {uploading ? <span className={styles.uploadingText}>...</span> : <UploadCloud size={20} />}
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
            </label>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <button className={styles.submitBtn} disabled={submitting || uploading} onClick={handleSubmit}>
          <Send size={13} /> {submitting ? 'Submitting...' : 'Submit for Consideration'}
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
