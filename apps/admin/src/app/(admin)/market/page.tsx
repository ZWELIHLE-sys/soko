'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './market.module.css'
import type { Market, MarketListing, VerifiedSeller } from './_types'
import { TYPE_LABEL, TYPE_TIMES, TYPE_COLOR, EMPTY_MARKET_FORM } from './_types'
import { CreateMarketForm } from './_components/CreateMarketForm'
import { MarketCard } from './_components/MarketCard'
import { ReviewModal } from './_components/ReviewModal'
import { MirModal } from './_components/MirModal'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'
import LiveMCComposer from '@/components/LiveMCComposer'

export default function AdminMarketPage() {
  const [markets, setMarkets]         = useState<Market[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [listings, setListings]       = useState<Record<string, MarketListing[]>>({})
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState(EMPTY_MARKET_FORM)
  const [saving, setSaving]           = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [reviewId, setReviewId]         = useState<string | null>(null)
  const [reviewNote, setReviewNote]     = useState('')
  const [reviewStall, setReviewStall]   = useState('')
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [updating, setUpdating]         = useState<string | null>(null)

  const [mirMarketId, setMirMarketId]     = useState<string | null>(null)
  const [sellers, setSellers]             = useState<VerifiedSeller[]>([])
  const [sellersLoading, setSellersLoading] = useState(false)
  const [sellerSearch, setSellerSearch]   = useState('')
  const [assigningMir, setAssigningMir]   = useState(false)

  const [togglingActive, setTogglingActive] = useState<string | null>(null)
  const [locationId, setLocationId]         = useState('')

  useEffect(() => {
    fetch('/api/market')
      .then(r => r.json())
      .then(data => { setMarkets(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const loadListings = async (marketId: string) => {
    if (listings[marketId]) return
    const res  = await fetch(`/api/market/${marketId}`)
    const data = await res.json()
    setListings(prev => ({ ...prev, [marketId]: data.listings }))
  }

  const loadSellers = async () => {
    if (sellers.length) return
    setSellersLoading(true)
    const res  = await fetch('/api/market/sellers')
    const data = await res.json()
    setSellers(data)
    setSellersLoading(false)
  }

  const toggleMarket = (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    loadListings(id)
  }

  const createMarket = async () => {
    setSaving(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/market', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setMarkets(prev => [{ ...created, _count: { listings: 0 }, listings: [], makerInResident: null }, ...prev])
        setForm(EMPTY_MARKET_FORM)
        setShowCreate(false)
      } else {
        const err = await res.json().catch(() => ({}))
        setCreateError(err.error ?? `Server error ${res.status} — try restarting the dev server`)
      }
    } catch {
      setCreateError('Network error — check the console for details')
    }
    setSaving(false)
  }

  const toggleActive = async (marketId: string, current: boolean) => {
    setTogglingActive(marketId)
    const res = await fetch(`/api/market/${marketId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, isActive: !current } : m))
    setTogglingActive(null)
  }

  const openMirModal = (marketId: string) => {
    setMirMarketId(marketId)
    setSellerSearch('')
    loadSellers()
  }

  const assignMir = async (marketId: string, sellerId: string | null) => {
    setAssigningMir(true)
    const res = await fetch(`/api/market/${marketId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ makerInResidenceId: sellerId }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, makerInResident: updated.makerInResident } : m))
    }
    setAssigningMir(false)
    setMirMarketId(null)
  }

  const submitReview = async () => {
    if (!reviewId || !reviewAction) return
    setUpdating(reviewId)
    const res = await fetch(`/api/market/listings/${reviewId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: reviewAction, adminNote: reviewNote, stallNumber: reviewAction === 'APPROVED' ? reviewStall : null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setListings(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          next[key] = next[key].map(l => l.id === reviewId ? { ...l, ...updated } : l)
        }
        return next
      })
      setMarkets(prev => prev.map(m => ({ ...m, listings: m.listings.filter(l => l.id !== reviewId) })))
    }
    setUpdating(null)
    setReviewId(null)
    setReviewNote('')
    setReviewStall('')
    setReviewAction(null)
  }

  return (
    <div>
      <div className={styles.headerRow}>
        <div className={shared.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={shared.pageTitle}>Market Management</h1>
          <p className={shared.pageSub}>
            Create events, review stall applications, assign stall numbers and Maker in Residence.
          </p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} /> New Market
        </button>
      </div>

      <LiveMCComposer
        channel="MARKET"
        collapsible
        subtitle="Speak to everyone on the market floor — announcements land on the market page instantly"
      />

      <div className={styles.typeLegend}>
        {(['SUNDAY_MARKET', 'FRIDAY_NIGHT_MARKET'] as const).map(t => (
          <div key={t} className={styles.legendItem}>
            <span className={shared.badge} style={{ background: TYPE_COLOR[t].bg, color: TYPE_COLOR[t].color }}>
              {TYPE_LABEL[t]}
            </span>
            <span className={styles.legendTime}>{TYPE_TIMES[t]}</span>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateMarketForm
          form={form}
          saving={saving}
          error={createError}
          onFormChange={updates => setForm(p => ({ ...p, ...updates }))}
          onCreate={createMarket}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      {loading ? (
        <div className={shared.loading}>Loading markets...</div>
      ) : (
        <div className={styles.list}>
          {markets.map(market => (
            <MarketCard
              key={market.id}
              market={market}
              isOpen={expanded === market.id}
              listings={
                locationId && listings[market.id]
                  ? listings[market.id].filter(l => l.seller.locationId === locationId)
                  : listings[market.id]
              }
              togglingActive={togglingActive}
              updatingListing={updating}
              onToggle={() => toggleMarket(market.id)}
              onToggleActive={() => toggleActive(market.id, market.isActive)}
              onOpenMir={() => openMirModal(market.id)}
              onRemoveMir={() => assignMir(market.id, null)}
              onReview={(listingId, action) => { setReviewId(listingId); setReviewAction(action) }}
            />
          ))}
          {markets.length === 0 && <div className={shared.empty}>No market events yet. Create the first one.</div>}
        </div>
      )}

      {reviewId && reviewAction && (
        <ReviewModal
          action={reviewAction}
          note={reviewNote}
          stall={reviewStall}
          updating={updating === reviewId}
          onNoteChange={setReviewNote}
          onStallChange={setReviewStall}
          onConfirm={submitReview}
          onCancel={() => { setReviewId(null); setReviewAction(null); setReviewNote(''); setReviewStall('') }}
        />
      )}

      {mirMarketId && (
        <MirModal
          sellers={sellers}
          loading={sellersLoading}
          search={sellerSearch}
          assigning={assigningMir}
          onSearchChange={setSellerSearch}
          onAssign={id => assignMir(mirMarketId, id)}
          onClose={() => setMirMarketId(null)}
        />
      )}
    </div>
  )
}
