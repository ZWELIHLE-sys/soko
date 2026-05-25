'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays, Store, CheckCircle, XCircle, Clock, Plus, ChevronDown, ChevronUp
} from 'lucide-react'
import styles from './admin-market.module.css'

interface MarketListing {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  sellerNote: string | null
  adminNote: string | null
  approvedAt: string | null
  productIds: string[]
  seller: {
    brandName: string
    email: string
    location: { name: string }
    category: { name: string }
  }
}

interface Market {
  id: string
  title: string
  theme: string | null
  description: string | null
  startDate: string
  endDate: string
  applicationDeadline: string
  isActive: boolean
  maxListings: number | null
  listings: MarketListing[]
}

export default function AdminMarketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [market, setMarket]           = useState<Market | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', theme: '',
    startDate: '', endDate: '', applicationDeadline: '', maxListings: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    loadMarket()
  }, [session, status])

  const loadMarket = () => {
    fetch('/api/market/current')
      .then(r => r.json())
      .then(data => { setMarket(data.market); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.title || !form.startDate || !form.endDate || !form.applicationDeadline) return
    setSaving(true)
    const res = await fetch('/api/admin/market/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', theme: '', startDate: '', endDate: '', applicationDeadline: '', maxListings: '' })
      loadMarket()
    }
    setSaving(false)
  }

  const handleListing = async (listingId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) => {
    setActioningId(listingId)
    await fetch('/api/admin/market/listing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, status, adminNote }),
    })
    loadMarket()
    setActioningId(null)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  if (loading || status === 'loading') {
    return <div className={styles.loading}>Loading market management...</div>
  }

  const pending  = market?.listings.filter(l => l.status === 'PENDING')  ?? []
  const approved = market?.listings.filter(l => l.status === 'APPROVED') ?? []
  const rejected = market?.listings.filter(l => l.status === 'REJECTED') ?? []

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Market Management</h1>
        <button className={styles.newBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? <ChevronUp size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Market'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create Market Event</h2>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Title *
              <input className={styles.input} value={form.title} onChange={set('title')} placeholder="e.g. Vuna Winter Market 2026" />
            </label>
            <label className={styles.label}>
              Theme
              <input className={styles.input} value={form.theme} onChange={set('theme')} placeholder="e.g. Winter Warmers" />
            </label>
            <label className={styles.label}>
              Application Deadline *
              <input className={styles.input} type="datetime-local" value={form.applicationDeadline} onChange={set('applicationDeadline')} />
            </label>
            <label className={styles.label}>
              Max Listings (optional)
              <input className={styles.input} type="number" value={form.maxListings} onChange={set('maxListings')} placeholder="Leave blank for unlimited" />
            </label>
            <label className={styles.label}>
              Start Date *
              <input className={styles.input} type="datetime-local" value={form.startDate} onChange={set('startDate')} />
            </label>
            <label className={styles.label}>
              End Date *
              <input className={styles.input} type="datetime-local" value={form.endDate} onChange={set('endDate')} />
            </label>
          </div>
          <label className={styles.label} style={{ marginTop: 8 }}>
            Description
            <textarea className={styles.textarea} value={form.description} onChange={set('description')} rows={3} placeholder="What's this market about?" />
          </label>
          <button className={styles.saveBtn} onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Market'}
          </button>
        </div>
      )}

      {/* Active market summary */}
      {market ? (
        <>
          <div className={styles.marketCard}>
            <div className={styles.marketCardHeader}>
              <div>
                <div className={styles.marketTitle}>{market.title}</div>
                {market.theme && <div className={styles.marketTheme}>{market.theme}</div>}
              </div>
              <div className={styles.marketDates}>
                <CalendarDays size={13} />
                {fmtDate(market.startDate)} — {fmtDate(market.endDate)}
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}><span className={styles.statNum}>{pending.length}</span> Pending</div>
              <div className={styles.stat}><span className={`${styles.statNum} ${styles.statApproved}`}>{approved.length}</span> Approved</div>
              <div className={styles.stat}><span className={styles.statNum}>{rejected.length}</span> Rejected</div>
              {market.maxListings && (
                <div className={styles.stat}>Max: {market.maxListings}</div>
              )}
            </div>
            <div className={styles.deadlineRow}>
              <Clock size={12} />
              Application deadline: <strong>{fmtDate(market.applicationDeadline)}</strong>
            </div>
          </div>

          {/* Pending applications */}
          {pending.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Clock size={16} />
                Pending Review ({pending.length})
              </h2>
              <div className={styles.listingList}>
                {pending.map(listing => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    actioning={actioningId === listing.id}
                    onApprove={() => handleListing(listing.id, 'APPROVED')}
                    onReject={(note) => handleListing(listing.id, 'REJECTED', note)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Approved */}
          {approved.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <CheckCircle size={16} className={styles.iconGreen} />
                Approved ({approved.length})
              </h2>
              <div className={styles.listingList}>
                {approved.map(listing => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    actioning={actioningId === listing.id}
                    onApprove={() => handleListing(listing.id, 'APPROVED')}
                    onReject={(note) => handleListing(listing.id, 'REJECTED', note)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <XCircle size={16} className={styles.iconRed} />
                Rejected ({rejected.length})
              </h2>
              <div className={styles.listingList}>
                {rejected.map(listing => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    actioning={actioningId === listing.id}
                    onApprove={() => handleListing(listing.id, 'APPROVED')}
                    onReject={(note) => handleListing(listing.id, 'REJECTED', note)}
                  />
                ))}
              </div>
            </section>
          )}

          {market.listings.length === 0 && (
            <div className={styles.empty}>
              <Store size={36} />
              <p>No applications yet. Share the market page to get sellers applying.</p>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <Store size={36} />
          <p>No active market. Create one above to get started.</p>
        </div>
      )}
    </div>
  )
}

function ListingRow({
  listing, actioning, onApprove, onReject,
}: {
  listing: MarketListing
  actioning: boolean
  onApprove: () => void
  onReject: (note: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)

  return (
    <div className={styles.listingRow}>
      <div className={styles.listingMain}>
        <div>
          <span className={styles.listingBrand}>{listing.seller.brandName}</span>
          <span className={styles.listingMeta}>
            {listing.seller.location.name} · {listing.seller.category.name} · {listing.productIds.length} product{listing.productIds.length !== 1 ? 's' : ''}
          </span>
          {listing.sellerNote && (
            <p className={styles.sellerNote}>{listing.sellerNote}</p>
          )}
        </div>
        <div className={styles.listingActions}>
          <span className={`${styles.statusBadge} ${styles[`status${listing.status}`]}`}>
            {listing.status}
          </span>
          {listing.status !== 'APPROVED' && (
            <button className={styles.approveBtn} onClick={onApprove} disabled={actioning}>
              <CheckCircle size={13} /> Approve
            </button>
          )}
          {listing.status !== 'REJECTED' && (
            <button className={styles.rejectBtn} onClick={() => setShowReject(v => !v)} disabled={actioning}>
              <XCircle size={13} /> Reject
            </button>
          )}
        </div>
      </div>
      {showReject && (
        <div className={styles.rejectForm}>
          <input
            className={styles.rejectInput}
            placeholder="Reason for rejection (optional)"
            value={rejectNote}
            onChange={e => setRejectNote(e.target.value)}
          />
          <button className={styles.confirmRejectBtn} onClick={() => { onReject(rejectNote); setShowReject(false) }}>
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  )
}
