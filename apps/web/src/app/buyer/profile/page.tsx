'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, AlertTriangle, Camera, Star } from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'
import styles from './profile.module.css'

export default function BuyerProfilePage() {
  const { data: session, update } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [avatar,   setAvatar]   = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  // Testimonial form
  const [testimony,  setTestimony]  = useState('')
  const [tRating,    setTRating]    = useState(5)
  const [tSaving,    setTSaving]    = useState(false)
  const [tSuccess,   setTSuccess]   = useState(false)
  const [tError,     setTError]     = useState('')

  useEffect(() => {
    fetch('/api/buyer/profile')
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? '')
        setPhone(data.phone ?? '')
        setAvatar(data.avatar ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'vuna/avatars')
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (!data.url) { setError(data.error ?? 'Upload failed'); return }
    setAvatar(data.url)
  }

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/buyer/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, avatar }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save.'); return }
    await update({ name: data.name })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleTestimonial = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setTError('')
    setTSaving(true)
    const res = await fetch('/api/buyer/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testimony, rating: tRating }),
    })
    const data = await res.json()
    setTSaving(false)
    if (!res.ok) { setTError(data.error ?? 'Failed to submit.'); return }
    setTestimony('')
    setTRating(5)
    setTSuccess(true)
    setTimeout(() => setTSuccess(false), 4000)
  }

  if (loading) return <PageLoader text="Loading your profile..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your Vuna account details.</p>
      </div>

      {/* Avatar card */}
      <div className={styles.avatarCard}>
        <div className={styles.avatarWrap}>
          {avatar ? (
            <Image src={avatar} alt="Profile photo" fill sizes="64px" style={{ objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <div className={styles.avatarInitial}>
              {name?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            type="button"
            className={styles.avatarEditBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change photo"
          >
            <Camera size={12} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <div className={styles.avatarName}>{name || session?.user?.name}</div>
          <div className={styles.avatarRole}>
            Vuna Shopper · Supporting local makers
          </div>
          {uploading && <div className={styles.uploadingNote}>Uploading photo...</div>}
        </div>
      </div>

      {/* Personal details form */}
      <form onSubmit={handleSave} className={styles.card}>
        <div className={styles.cardLabel}>Personal Details</div>

        <div className={styles.field}>
          <label className={styles.label}>Full name</label>
          <input
            className={styles.input}
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email address</label>
          <input
            className={styles.input}
            type="email"
            value={session?.user?.email ?? ''}
            disabled
            readOnly
          />
          <div className={styles.inputNote}>Email cannot be changed after registration.</div>
        </div>

        <div className={styles.fieldLast}>
          <label className={styles.label}>Phone number</label>
          <input
            className={styles.input}
            type="tel"
            placeholder="e.g. 071 234 5678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {error && (
          <div className={styles.errorMsg}><AlertTriangle size={14} /> {error}</div>
        )}
        {success && (
          <div className={styles.success}><CheckCircle2 size={14} /> Profile updated successfully!</div>
        )}

        <button type="submit" disabled={saving || uploading} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Platform testimonial */}
      <form onSubmit={handleTestimonial} className={styles.card}>
        <div className={styles.cardLabel}>Share Your Experience</div>
        <p className={styles.cardNote}>
          Your feedback may appear on the Vuna home page to inspire other buyers.
        </p>

        <div className={styles.starRow}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              className={`${styles.starBtn} ${n <= tRating ? styles.starActive : ''}`}
              onClick={() => setTRating(n)}
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}
            >
              <Star size={20} fill={n <= tRating ? '#D97706' : 'none'} />
            </button>
          ))}
        </div>

        <div className={styles.fieldLast}>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            rows={4}
            required
            placeholder="Tell others what you love about shopping on Vuna..."
            value={testimony}
            onChange={e => setTestimony(e.target.value)}
          />
        </div>

        {tError && (
          <div className={styles.errorMsg}><AlertTriangle size={14} /> {tError}</div>
        )}
        {tSuccess && (
          <div className={styles.success}><CheckCircle2 size={14} /> Thank you! Your feedback is with our team for review before it goes live.</div>
        )}

        <button type="submit" disabled={tSaving} className={styles.saveBtn}>
          {tSaving ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <div className={styles.impact}>
        <div className={styles.impactLabel}>Uvunile</div>
        <p className={styles.impactText}>
          You have reaped from home. Every purchase you make on Vuna
          goes directly to an local maker, grower or builder —
          no middlemen, no exploitation. That is the harvest we are building together.
        </p>
      </div>
    </div>
  )
}
