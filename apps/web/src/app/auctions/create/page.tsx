'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Gavel, AlertTriangle, CheckCircle } from 'lucide-react'
import styles from './create.module.css'

interface Category { id: string; name: string; slug: string }

export default function CreateAuctionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '', description: '', startPrice: '',
    reservePrice: '', startTime: '', endTime: '', categoryId: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'SELLER') {
      router.push('/login?callbackUrl=/auctions/create')
    }
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [session, status, router])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.startPrice || !form.startTime || !form.endTime || !form.categoryId) {
      setError('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/auctions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setSubmitting(false)
      return
    }
    setSuccess(true)
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.successWrap}>
          <CheckCircle size={52} className={styles.successIcon} />
          <h2 className={styles.successTitle}>Auction submitted for review</h2>
          <p className={styles.successSub}>
            The Vuna team will review your auction and approve it before it goes live.
            You&apos;ll be notified once it&apos;s approved.
          </p>
          <button className={styles.doneBtn} onClick={() => router.push('/auctions')}>
            View all auctions
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.eyebrow}>Seller</div>
        <h1 className={styles.heroTitle}>Create an Auction</h1>
        <p className={styles.heroSub}>
          List a rare or limited piece for members-only bidding. Your auction is reviewed by the Vuna team before going live.
        </p>
      </div>

      <div className={styles.inner}>
        <div className={styles.formCard}>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Auction Title *</label>
            <input className={styles.input} value={form.title} onChange={set('title')} placeholder="e.g. Hand-carved Zulu walking stick, circa 1980" />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Description *</label>
            <textarea className={styles.textarea} rows={5} value={form.description} onChange={set('description')} placeholder="Describe the piece — its story, material, age, condition, and what makes it special..." />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Category *</label>
            <select className={styles.select} value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Starting Price (R) *</label>
              <input className={styles.input} type="number" min="1" step="1" value={form.startPrice} onChange={set('startPrice')} placeholder="100" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Reserve Price (R) <span className={styles.optional}>optional</span></label>
              <input className={styles.input} type="number" min="1" step="1" value={form.reservePrice} onChange={set('reservePrice')} placeholder="Hidden minimum — leave blank if none" />
              <span className={styles.hint}>If bids don&apos;t reach this, the item won&apos;t sell</span>
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Auction Start *</label>
              <input className={styles.input} type="datetime-local" value={form.startTime} onChange={set('startTime')} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Auction End *</label>
              <input className={styles.input} type="datetime-local" value={form.endTime} onChange={set('endTime')} />
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            <Gavel size={16} />
            {submitting ? 'Submitting...' : 'Submit Auction for Review'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
