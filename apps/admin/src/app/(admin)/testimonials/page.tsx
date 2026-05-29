'use client'

import { useEffect, useState } from 'react'
import { Star, Eye, EyeOff } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './testimonials.module.css'

interface Testimonial {
  id: string
  content: string
  rating: number
  isApproved: boolean
  createdAt: string
  user: { name: string; email: string }
}

const FILTERS = ['ALL', 'APPROVED', 'HIDDEN']

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('ALL')
  const [updating, setUpdating]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(data => { setTestimonials(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const toggle = async (id: string, current: boolean) => {
    setUpdating(id)
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: !current }),
    })
    if (res.ok) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved: !current } : t))
    }
    setUpdating(null)
  }

  const filtered = testimonials.filter(t => {
    if (filter === 'APPROVED') return t.isApproved
    if (filter === 'HIDDEN') return !t.isApproved
    return true
  })

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Testimonials</h1>
        <p className={shared.pageSub}>Buyer platform feedback displayed on the home page. Unpublish anything inappropriate.</p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
          >
            {tab}
            {tab === 'APPROVED' && ` (${testimonials.filter(t => t.isApproved).length})`}
            {tab === 'HIDDEN' && ` (${testimonials.filter(t => !t.isApproved).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={shared.loading}>Loading testimonials...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(t => (
            <div key={t.id} className={`${styles.card} ${!t.isApproved ? styles.cardHidden : ''}`}>
              <div className={styles.top}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < t.rating ? '#D97706' : 'none'}
                      color={i < t.rating ? '#D97706' : '#d1d5db'}
                    />
                  ))}
                </div>
                {!t.isApproved && (
                  <span className={styles.hiddenTag}>Hidden</span>
                )}
              </div>

              <p className={styles.content}>&ldquo;{t.content}&rdquo;</p>

              <div className={styles.footer}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {t.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.userName}>{t.user.name}</div>
                    <div className={styles.userEmail}>{t.user.email}</div>
                  </div>
                  <div className={styles.date}>
                    {new Date(t.createdAt).toLocaleDateString('en-ZA')}
                  </div>
                </div>

                <button
                  className={t.isApproved ? shared.btnSecondary : shared.btnSuccess}
                  onClick={() => toggle(t.id, t.isApproved)}
                  disabled={updating === t.id}
                >
                  {t.isApproved
                    ? <><EyeOff size={14} />Unpublish</>
                    : <><Eye size={14} />Publish</>}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className={shared.empty}>No testimonials in this category.</div>}
        </div>
      )}
    </div>
  )
}
