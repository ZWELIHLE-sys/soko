'use client'

import { useEffect, useState, useCallback } from 'react'
import { Star, Plus, CheckCircle2, CreditCard, Info } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './featured.module.css'
import type { FeaturedListing, ProductResult } from './_types'
import { addDays } from './_types'
import { AddFeaturedForm } from './_components/AddFeaturedForm'
import { FeaturedCard } from './_components/FeaturedCard'

export default function AdminFeaturedPage() {
  const [listings, setListings] = useState<FeaturedListing[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<ProductResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected]   = useState<ProductResult | null>(null)
  const [expiresAt, setExpiresAt] = useState(addDays(14))
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)

  const load = useCallback(() => {
    fetch('/api/featured')
      .then(r => r.json())
      .then(d => { setListings(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

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

  const closeForm = () => { setShowAdd(false); setSelected(null); setQuery(''); setResults([]) }

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
    closeForm()
    setNote('')
    setExpiresAt(addDays(14))
    load()
    setSuccess(`"${selected.name}" is now featured on the home page.`)
    setTimeout(() => setSuccess(''), 5000)
  }

  const now     = new Date()
  const active  = listings.filter(l => new Date(l.expiresAt) > now)
  const expired = listings.filter(l => new Date(l.expiresAt) <= now)

  return (
    <div>
      <div className={shared.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className={shared.pageTitle}>Featured Listings</h1>
            <p className={shared.pageSub}>Control what appears in the Featured Products section on the Vuna home page.</p>
          </div>
          {!showAdd && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Feature a Product
            </button>
          )}
        </div>
      </div>

      {success && <div className={styles.successBanner}><CheckCircle2 size={14} /> {success}</div>}

      {showAdd && (
        <AddFeaturedForm
          query={query} results={results} searching={searching}
          selected={selected} expiresAt={expiresAt} note={note}
          saving={saving} error={error}
          onQueryChange={setQuery}
          onSelect={setSelected}
          onClearSelection={() => { setSelected(null); setQuery('') }}
          onExpiresChange={setExpiresAt}
          onNoteChange={setNote}
          onAdd={handleAdd}
          onClose={closeForm}
        />
      )}

      <div className={shared.card}>
        <div className={styles.sectionHeader}>
          <h2 className={shared.cardTitle}>
            Active Spotlights
            {active.length > 0 && <span className={styles.count}>{active.length}</span>}
          </h2>
          <p className={styles.sectionSub}>These products are currently showing in the Featured section on the home page.</p>
        </div>

        {loading ? (
          <div className={shared.loading}>Loading...</div>
        ) : active.length === 0 ? (
          <div className={shared.empty}>
            <Star size={32} style={{ opacity: 0.25, color: '#7C2D12' }} />
            <div>No products featured yet — click &ldquo;Feature a Product&rdquo; to add one.</div>
          </div>
        ) : (
          <div className={styles.listingGrid}>
            {active.map(l => (
              <FeaturedCard key={l.id} listing={l} removing={removing === l.id}
                onRemove={() => handleRemove(l.id)} />
            ))}
          </div>
        )}
      </div>

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
          {[
            'Seller requests a featured slot from their dashboard — chooses duration (7 / 14 / 30 days)',
            'Seller pays Vuna via EFT — proof of payment triggers an admin notification',
            'Admin reviews and approves before product appears on home page',
            'Paid slots are tracked separately — revenue appears in the Commissions dashboard',
          ].map(item => (
            <div key={item} className={styles.phase2Item}><Info size={13} /> {item}</div>
          ))}
        </div>
      </div>

      {expired.length > 0 && (
        <div className={shared.card}>
          <h2 className={shared.cardTitle}>Expired Spotlights</h2>
          <div className={styles.expiredList}>
            {expired.map(l => (
              <FeaturedCard key={l.id} listing={l} removing={removing === l.id} expired
                onRemove={() => handleRemove(l.id)}
                onRefeature={() => { setSelected(l.product); setShowAdd(true); setExpiresAt(addDays(14)) }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
