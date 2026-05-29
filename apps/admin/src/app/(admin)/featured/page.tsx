'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Star, Trash2, Plus, Search, Clock, CheckCircle2,
  AlertTriangle, X, Sparkles, CreditCard, Info,
} from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './featured.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturedListing {
  id: string
  expiresAt: string
  note: string | null
  isPaidTier: boolean
  createdAt: string
  product: {
    id: string
    name: string
    price: number
    status: string
    images: string[]
    seller: { brandName: string }
    category: { name: string; icon: string | null }
  }
}

interface ProductResult {
  id: string
  name: string
  price: number
  status: string
  images: string[]
  seller: { brandName: string }
  category: { name: string; icon: string | null }
}

// ─── Duration presets ─────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '7 days',  days: 7  },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
]

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminFeaturedPage() {
  const [listings, setListings]     = useState<FeaturedListing[]>([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [removing, setRemoving]     = useState<string | null>(null)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')

  // Product search state
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<ProductResult[]>([])
  const [searching, setSearching]   = useState(false)
  const [selected, setSelected]     = useState<ProductResult | null>(null)
  const [expiresAt, setExpiresAt]   = useState(addDays(14))
  const [note, setNote]             = useState('')
  const [saving, setSaving]         = useState(false)

  const load = useCallback(() => {
    fetch('/api/featured')
      .then(r => r.json())
      .then(d => { setListings(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  // Live product search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(() => {
      setSearching(true)
      fetch(`/api/products?q=${encodeURIComponent(query)}&limit=6`)
        .then(r => r.json())
        .then(d => { setResults(Array.isArray(d) ? d : []); setSearching(false) })
        .catch(() => setSearching(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleRemove = async (id: string) => {
    setRemoving(id)
    await fetch(`/api/featured/${id}`, { method: 'DELETE' })
    setRemoving(null)
    load()
    setSuccess('Featured listing removed.')
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleAdd = async () => {
    if (!selected) { setError('Select a product first.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selected.id, expiresAt, note: note || null }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to feature product.'); return }
    setShowAdd(false)
    setSelected(null)
    setQuery('')
    setNote('')
    setExpiresAt(addDays(14))
    load()
    setSuccess(`"${selected.name}" is now featured on the home page.`)
    setTimeout(() => setSuccess(''), 5000)
  }

  const now = new Date()
  const active  = listings.filter(l => new Date(l.expiresAt) > now)
  const expired = listings.filter(l => new Date(l.expiresAt) <= now)

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const daysLeft = (d: string) => {
    const diff = new Date(d).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const days = Math.ceil(diff / 86400000)
    return `${days} day${days !== 1 ? 's' : ''} left`
  }

  return (
    <div>
      <div className={shared.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className={shared.pageTitle}>Featured Listings</h1>
            <p className={shared.pageSub}>
              Control what appears in the Featured Products section on the Vuna home page.
            </p>
          </div>
          {!showAdd && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Feature a Product
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {/* ── Add form ── */}
      {showAdd && (
        <div className={`${shared.card} ${styles.addForm}`}>
          <div className={styles.addFormHeader}>
            <h2 className={shared.cardTitle}>Feature a Product</h2>
            <button className={styles.closeBtn} onClick={() => { setShowAdd(false); setSelected(null); setQuery('') }}>
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className={styles.errorBanner}><AlertTriangle size={13} /> {error}</div>
          )}

          {/* Product search */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Search for a product</label>
            {selected ? (
              <div className={styles.selectedProduct}>
                <div className={styles.selectedThumb}>
                  {selected.images[0] ? (
                    <Image src={selected.images[0]} alt={selected.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                  ) : (
                    <span>{selected.category.icon}</span>
                  )}
                </div>
                <div className={styles.selectedInfo}>
                  <div className={styles.selectedName}>{selected.name}</div>
                  <div className={styles.selectedMeta}>{selected.seller.brandName} · R{selected.price.toFixed(2)}</div>
                </div>
                <button className={styles.clearSelection} onClick={() => { setSelected(null); setQuery('') }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className={styles.searchWrap}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Type product name..."
                />
                {searching && <span className={styles.searchSpinner}>...</span>}
              </div>
            )}

            {!selected && results.length > 0 && (
              <div className={styles.dropdown}>
                {results.map(p => (
                  <button key={p.id} className={styles.dropdownItem} onClick={() => { setSelected(p); setQuery(''); setResults([]) }}>
                    <div className={styles.dropThumb}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                      ) : (
                        <span style={{ fontSize: 18 }}>{p.category.icon}</span>
                      )}
                    </div>
                    <div className={styles.dropInfo}>
                      <div className={styles.dropName}>{p.name}</div>
                      <div className={styles.dropMeta}>{p.seller.brandName} · R{p.price.toFixed(2)} · {p.status}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Feature for</label>
            <div className={styles.durationRow}>
              {DURATIONS.map(d => (
                <button
                  key={d.days}
                  className={`${styles.durationBtn} ${expiresAt === addDays(d.days) ? styles.durationActive : ''}`}
                  onClick={() => setExpiresAt(addDays(d.days))}
                >
                  {d.label}
                </button>
              ))}
              <input
                type="date"
                className={styles.dateInput}
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Note */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Admin note <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.input}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Best seller from June market — requested by seller"
            />
          </div>

          <div className={styles.formActions}>
            <button className={styles.featureBtn} disabled={saving || !selected} onClick={handleAdd}>
              <Star size={13} /> {saving ? 'Featuring...' : 'Feature on Home Page'}
            </button>
            <button className={styles.cancelBtn} onClick={() => { setShowAdd(false); setSelected(null); setQuery('') }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Active featured ── */}
      <div className={shared.card}>
        <div className={styles.sectionHeader}>
          <h2 className={shared.cardTitle}>
            Active Spotlights
            {active.length > 0 && <span className={styles.count}>{active.length}</span>}
          </h2>
          <p className={styles.sectionSub}>
            These products are currently showing in the Featured section on the home page.
          </p>
        </div>

        {loading ? (
          <div className={shared.loading}>Loading...</div>
        ) : active.length === 0 ? (
          <div className={shared.empty}>
            <Star size={32} style={{ opacity: 0.25, color: '#7C2D12' }} />
            <div>No products featured yet — click "Feature a Product" to add one.</div>
          </div>
        ) : (
          <div className={styles.listingGrid}>
            {active.map(l => (
              <div key={l.id} className={styles.listingCard}>
                <div className={styles.listingThumb}>
                  {l.product.images[0] ? (
                    <Image src={l.product.images[0]} alt={l.product.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                  ) : (
                    <span className={styles.thumbFallback}>{l.product.category.icon}</span>
                  )}
                </div>
                <div className={styles.listingInfo}>
                  <div className={styles.listingName}>{l.product.name}</div>
                  <div className={styles.listingMeta}>
                    {l.product.seller.brandName} · R{l.product.price.toFixed(2)}
                  </div>
                  {l.note && <div className={styles.listingNote}>{l.note}</div>}
                  <div className={styles.listingExpiry}>
                    <Clock size={11} />
                    Expires {fmt(l.expiresAt)} · <strong>{daysLeft(l.expiresAt)}</strong>
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  disabled={removing === l.id}
                  onClick={() => handleRemove(l.id)}
                >
                  <Trash2 size={13} />
                  {removing === l.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Phase 2 placeholder ── */}
      <div className={`${shared.card} ${styles.phase2Card}`}>
        <div className={styles.phase2Header}>
          <CreditCard size={20} className={styles.phase2Icon} />
          <div>
            <div className={styles.phase2Title}>Paid Featured Slots <span className={styles.comingSoon}>Coming Soon</span></div>
            <div className={styles.phase2Sub}>
              Phase 2: Sellers will be able to pay to promote their products in this section.
              You will review and approve each paid slot before it goes live.
            </div>
          </div>
        </div>
        <div className={styles.phase2Details}>
          <div className={styles.phase2Item}>
            <Info size={13} />
            Seller requests a featured slot from their dashboard — chooses duration (7 / 14 / 30 days)
          </div>
          <div className={styles.phase2Item}>
            <Info size={13} />
            Seller pays via PayFast — payment confirmation triggers an admin notification
          </div>
          <div className={styles.phase2Item}>
            <Info size={13} />
            Admin reviews and approves before product appears on home page
          </div>
          <div className={styles.phase2Item}>
            <Info size={13} />
            Paid slots are tracked separately — revenue appears in Payouts dashboard
          </div>
        </div>
      </div>

      {/* ── Expired ── */}
      {expired.length > 0 && (
        <div className={shared.card}>
          <h2 className={shared.cardTitle}>Expired Spotlights</h2>
          <div className={styles.expiredList}>
            {expired.map(l => (
              <div key={l.id} className={`${styles.listingCard} ${styles.listingCardExpired}`}>
                <div className={styles.listingThumb}>
                  {l.product.images[0] ? (
                    <Image src={l.product.images[0]} alt={l.product.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                  ) : (
                    <span className={styles.thumbFallback}>{l.product.category.icon}</span>
                  )}
                </div>
                <div className={styles.listingInfo}>
                  <div className={styles.listingName}>{l.product.name}</div>
                  <div className={styles.listingMeta}>{l.product.seller.brandName}</div>
                  <div className={`${styles.listingExpiry} ${styles.listingExpiryGrey}`}>
                    <Clock size={11} /> Expired {fmt(l.expiresAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.refeatureBtn} onClick={() => {
                    setSelected(l.product)
                    setShowAdd(true)
                    setExpiresAt(addDays(14))
                  }}>
                    <Star size={12} /> Re-feature
                  </button>
                  <button className={styles.removeBtn} disabled={removing === l.id} onClick={() => handleRemove(l.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
