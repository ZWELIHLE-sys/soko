'use client'

import { useEffect, useState } from 'react'
import {
  Plus, ChevronDown, ChevronUp, CheckCircle, XCircle,
  Eye, EyeOff, Star, Search, CalendarDays, Users,
} from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './market.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketType = 'SUNDAY_MARKET' | 'FRIDAY_NIGHT_MARKET'

interface VerifiedSeller {
  id:        string
  brandName: string
  category:  { name: string }
  location:  { name: string } | null
  _count:    { products: number }
}

interface MarketListing {
  id:           string
  status:       string
  sellerNote:   string | null
  adminNote:    string | null
  stallNumber:  number | null
  stallMessage: string | null
  marketPrice:  number | null
  productIds:   string[]
  seller: {
    brandName: string
    email:     string
    _count:    { products: number }
  }
}

interface Market {
  id:                  string
  marketType:          MarketType
  title:               string
  theme:               string | null
  startDate:           string
  endDate:             string
  applicationDeadline: string
  isActive:            boolean
  maxListings:         number | null
  makerInResident:     { id: string; brandName: string } | null
  _count:              { listings: number }
  listings:            { id: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<MarketType, string> = {
  SUNDAY_MARKET:       'Sunday Vuna Market',
  FRIDAY_NIGHT_MARKET: 'Friday Night Market',
}

const TYPE_TIMES: Record<MarketType, string> = {
  SUNDAY_MARKET:       '8:00 AM – 6:00 PM · Weekly',
  FRIDAY_NIGHT_MARKET: '5:00 PM – 11:00 PM · Monthly (last Friday)',
}

const TYPE_COLOR: Record<MarketType, { color: string; bg: string }> = {
  SUNDAY_MARKET:       { color: '#92400E', bg: '#FEF9C3' },
  FRIDAY_NIGHT_MARKET: { color: '#5B21B6', bg: '#EDE9FE' },
}

const LISTING_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:  { color: '#92400E', bg: '#FEF9C3' },
  APPROVED: { color: '#14532D', bg: '#DCFCE7' },
  REJECTED: { color: '#991B1B', bg: '#FEE2E2' },
}

function getEventStatus(startDate: string, endDate: string): 'UPCOMING' | 'LIVE' | 'ENDED' {
  const now = new Date()
  if (now < new Date(startDate)) return 'UPCOMING'
  if (now > new Date(endDate))   return 'ENDED'
  return 'LIVE'
}

const EVENT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  UPCOMING: { color: '#1D4ED8', bg: '#EFF6FF' },
  LIVE:     { color: '#14532D', bg: '#DCFCE7' },
  ENDED:    { color: '#6B7280', bg: '#F3F4F6' },
}

const EMPTY_FORM = {
  marketType: 'SUNDAY_MARKET' as MarketType,
  title: '', description: '', theme: '',
  startDate: '', endDate: '', applicationDeadline: '',
  maxListings: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminMarketPage() {
  const [markets, setMarkets]         = useState<Market[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [listings, setListings]       = useState<Record<string, MarketListing[]>>({})
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Approve / reject listing modal
  const [reviewId, setReviewId]       = useState<string | null>(null)
  const [reviewNote, setReviewNote]   = useState('')
  const [reviewStall, setReviewStall] = useState('')
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [updating, setUpdating]       = useState<string | null>(null)

  // Maker in Residence modal
  const [mirMarketId, setMirMarketId]   = useState<string | null>(null)
  const [sellers, setSellers]           = useState<VerifiedSeller[]>([])
  const [sellersLoading, setSellersLoading] = useState(false)
  const [sellerSearch, setSellerSearch] = useState('')
  const [assigningMir, setAssigningMir] = useState(false)

  // isActive toggle
  const [togglingActive, setTogglingActive] = useState<string | null>(null)

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/market')
      .then(r => r.json())
      .then(data => { setMarkets(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const loadListings = async (marketId: string) => {
    if (listings[marketId]) return
    const res = await fetch(`/api/market/${marketId}`)
    const data = await res.json()
    setListings(prev => ({ ...prev, [marketId]: data.listings }))
  }

  const loadSellers = async () => {
    if (sellers.length) return
    setSellersLoading(true)
    const res = await fetch('/api/market/sellers')
    const data = await res.json()
    setSellers(data)
    setSellersLoading(false)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleMarket = (id: string) => {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
      loadListings(id)
    }
  }

  const createMarket = async () => {
    setSaving(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/market', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setMarkets(prev => [{
          ...created,
          _count:          { listings: 0 },
          listings:        [],
          makerInResident: null,
        }, ...prev])
        setForm(EMPTY_FORM)
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
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setMarkets(prev => prev.map(m =>
        m.id === marketId ? { ...m, isActive: !current } : m
      ))
    }
    setTogglingActive(null)
  }

  const openMirModal = (marketId: string) => {
    setMirMarketId(marketId)
    setSellerSearch('')
    loadSellers()
  }

  const assignMir = async (sellerId: string | null) => {
    if (!mirMarketId) return
    setAssigningMir(true)
    const res = await fetch(`/api/market/${mirMarketId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ makerInResidenceId: sellerId }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMarkets(prev => prev.map(m =>
        m.id === mirMarketId ? { ...m, makerInResident: updated.makerInResident } : m
      ))
    }
    setAssigningMir(false)
    setMirMarketId(null)
  }

  const submitReview = async () => {
    if (!reviewId || !reviewAction) return
    setUpdating(reviewId)
    const res = await fetch(`/api/market/listings/${reviewId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        status:      reviewAction,
        adminNote:   reviewNote,
        stallNumber: reviewAction === 'APPROVED' ? reviewStall : null,
      }),
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
      setMarkets(prev => prev.map(m => ({
        ...m,
        listings: m.listings.filter(l => l.id !== reviewId),
      })))
    }
    setUpdating(null)
    setReviewId(null)
    setReviewNote('')
    setReviewStall('')
    setReviewAction(null)
  }

  const pendingCount = (marketId: string) =>
    markets.find(m => m.id === marketId)?.listings?.length ?? 0

  const filteredSellers = sellers.filter(s =>
    s.brandName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    s.category.name.toLowerCase().includes(sellerSearch.toLowerCase())
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={shared.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={shared.pageTitle}>Market Management</h1>
          <p className={shared.pageSub}>
            Create events, review stall applications, assign stall numbers and Maker in Residence.
          </p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} />
          New Market
        </button>
      </div>

      {/* Event type legend */}
      <div className={styles.typeLegend}>
        {(['SUNDAY_MARKET', 'FRIDAY_NIGHT_MARKET'] as MarketType[]).map(t => (
          <div key={t} className={styles.legendItem}>
            <span
              className={shared.badge}
              style={{ background: TYPE_COLOR[t].bg, color: TYPE_COLOR[t].color }}
            >
              {TYPE_LABEL[t]}
            </span>
            <span className={styles.legendTime}>{TYPE_TIMES[t]}</span>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className={`${shared.card} ${styles.createForm}`}>
          <h2 className={shared.cardTitle}>Create Market Event</h2>

          {/* Type selector */}
          <div className={styles.typeSelector}>
            {(['SUNDAY_MARKET', 'FRIDAY_NIGHT_MARKET'] as MarketType[]).map(t => (
              <button
                key={t}
                className={`${styles.typeBtn} ${form.marketType === t ? styles.typeBtnActive : ''}`}
                onClick={() => setForm(p => ({
                  ...p,
                  marketType: t,
                  title: p.title || TYPE_LABEL[t],
                }))}
              >
                <span className={styles.typeBtnLabel}>{TYPE_LABEL[t]}</span>
                <span className={styles.typeBtnTime}>{TYPE_TIMES[t]}</span>
              </button>
            ))}
          </div>

          <div className={styles.formGrid}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Title *</label>
              <input
                className={shared.formInput}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Sunday Vuna Market — 1 June 2026"
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Theme</label>
              <input
                className={shared.formInput}
                value={form.theme}
                onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
                placeholder="e.g. Heritage & Craft"
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Start Date & Time *</label>
              <input
                type="datetime-local"
                className={shared.formInput}
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>End Date & Time *</label>
              <input
                type="datetime-local"
                className={shared.formInput}
                value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Application Deadline *</label>
              <input
                type="datetime-local"
                className={shared.formInput}
                value={form.applicationDeadline}
                onChange={e => setForm(p => ({ ...p, applicationDeadline: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Max Stalls</label>
              <input
                type="number"
                className={shared.formInput}
                value={form.maxListings}
                onChange={e => setForm(p => ({ ...p, maxListings: e.target.value }))}
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Description</label>
            <textarea
              className={shared.formTextarea}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe this market event..."
            />
          </div>

          {createError && (
            <div className={shared.errorMsg} style={{ marginBottom: 12 }}>
              {createError}
            </div>
          )}
          <div className={shared.modalActions}>
            <button className={shared.btnSecondary} onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className={shared.btnPrimary}
              onClick={createMarket}
              disabled={saving || !form.title || !form.startDate || !form.endDate || !form.applicationDeadline}
            >
              {saving ? 'Creating...' : 'Create Market'}
            </button>
          </div>
        </div>
      )}

      {/* Markets list */}
      {loading ? (
        <div className={shared.loading}>Loading markets...</div>
      ) : (
        <div className={styles.list}>
          {markets.map(market => {
            const isOpen      = expanded === market.id
            const pending     = pendingCount(market.id)
            const eventStatus = getEventStatus(market.startDate, market.endDate)
            const typeColor   = TYPE_COLOR[market.marketType]
            const statusStyle = EVENT_STATUS_STYLE[eventStatus]

            return (
              <div key={market.id} className={`${styles.marketCard} ${!market.isActive ? styles.marketCardInactive : ''}`}>

                {/* Card header */}
                <div className={styles.marketHeader}>
                  <div
                    className={styles.marketHeaderLeft}
                    onClick={() => toggleMarket(market.id)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <div className={styles.marketTitleRow}>
                      <span
                        className={shared.badge}
                        style={{ background: typeColor.bg, color: typeColor.color }}
                      >
                        {TYPE_LABEL[market.marketType]}
                      </span>
                      <span
                        className={shared.badge}
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {eventStatus}
                      </span>
                      {!market.isActive && (
                        <span className={shared.badge} style={{ background: '#FEE2E2', color: '#991B1B' }}>
                          HIDDEN
                        </span>
                      )}
                    </div>

                    <div className={styles.marketTitle}>{market.title}</div>

                    <div className={styles.marketMeta}>
                      <CalendarDays size={12} />
                      {new Date(market.startDate).toLocaleDateString('en-ZA', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {' — '}
                      {new Date(market.endDate).toLocaleTimeString('en-ZA', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {market.theme && ` · ${market.theme}`}
                    </div>

                    <div className={styles.marketStats}>
                      <span>
                        <Users size={11} />
                        {market._count.listings} application{market._count.listings !== 1 ? 's' : ''}
                        {market.maxListings && ` / ${market.maxListings} max`}
                      </span>
                      {pending > 0 && (
                        <span className={styles.pendingTag}>{pending} pending review</span>
                      )}
                    </div>

                    {/* Maker in Residence */}
                    <div className={styles.mirRow}>
                      <Star size={12} color="#D97706" />
                      <span className={styles.mirLabel}>Maker in Residence:</span>
                      {market.makerInResident ? (
                        <>
                          <span className={styles.mirName}>{market.makerInResident.brandName}</span>
                          <button
                            className={styles.mirChangeBtn}
                            onClick={e => { e.stopPropagation(); openMirModal(market.id) }}
                          >
                            Change
                          </button>
                          <button
                            className={styles.mirRemoveBtn}
                            onClick={e => { e.stopPropagation(); assignMir(null) }}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.mirAssignBtn}
                          onClick={e => { e.stopPropagation(); openMirModal(market.id) }}
                        >
                          Assign Seller
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className={styles.marketControls}>
                    <button
                      className={market.isActive ? shared.btnSecondary : shared.btnSuccess}
                      onClick={() => toggleActive(market.id, market.isActive)}
                      disabled={togglingActive === market.id}
                      title={market.isActive ? 'Hide from sellers' : 'Publish to sellers'}
                    >
                      {togglingActive === market.id ? (
                        '...'
                      ) : market.isActive ? (
                        <><EyeOff size={14} />Hide</>
                      ) : (
                        <><Eye size={14} />Publish</>
                      )}
                    </button>
                    {isOpen
                      ? <ChevronUp size={18} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => setExpanded(null)} />
                      : <ChevronDown size={18} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => toggleMarket(market.id)} />
                    }
                  </div>
                </div>

                {/* Listings panel */}
                {isOpen && (
                  <div className={styles.listingsPanel}>
                    {!listings[market.id] ? (
                      <div className={shared.loading}>Loading applications...</div>
                    ) : listings[market.id].length === 0 ? (
                      <div className={shared.empty}>No stall applications yet.</div>
                    ) : (
                      listings[market.id].map(listing => {
                        const sc = LISTING_STATUS_STYLE[listing.status] ?? LISTING_STATUS_STYLE.PENDING
                        return (
                          <div key={listing.id} className={styles.listingRow}>
                            <div className={styles.listingLeft}>
                              <div className={styles.listingSeller}>{listing.seller.brandName}</div>
                              <div className={styles.listingMeta}>
                                {listing.seller.email} · {listing.seller._count.products} products
                              </div>

                              {/* Seller's market-day message */}
                              {listing.stallMessage && (
                                <div className={styles.stallMessage}>
                                  &ldquo;{listing.stallMessage}&rdquo;
                                </div>
                              )}

                              {/* Market-only price if set */}
                              {listing.marketPrice != null && (
                                <div className={styles.marketPriceTag}>
                                  Market price: R{listing.marketPrice.toFixed(2)}
                                </div>
                              )}

                              {/* Products being brought */}
                              {listing.productIds.length > 0 && (
                                <div className={styles.productCount}>
                                  {listing.productIds.length} product{listing.productIds.length !== 1 ? 's' : ''} selected for this market
                                </div>
                              )}

                              {/* Admin note on approved/rejected */}
                              {listing.adminNote && (
                                <div className={styles.adminNote}>Admin: {listing.adminNote}</div>
                              )}

                              {/* Stall number if approved */}
                              {listing.stallNumber != null && (
                                <div className={styles.stallBadge}>Stall #{listing.stallNumber}</div>
                              )}

                              {/* Seller note */}
                              {listing.sellerNote && (
                                <div className={styles.sellerNote}>Seller note: &ldquo;{listing.sellerNote}&rdquo;</div>
                              )}
                            </div>

                            <div className={styles.listingActions}>
                              <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>
                                {listing.status}
                              </span>
                              {listing.status === 'PENDING' && (
                                <>
                                  <button
                                    className={shared.btnSuccess}
                                    onClick={() => {
                                      setReviewId(listing.id)
                                      setReviewAction('APPROVED')
                                    }}
                                  >
                                    <CheckCircle size={14} />
                                    Approve
                                  </button>
                                  <button
                                    className={shared.btnDanger}
                                    onClick={() => {
                                      setReviewId(listing.id)
                                      setReviewAction('REJECTED')
                                    }}
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {markets.length === 0 && (
            <div className={shared.empty}>No market events yet. Create the first one.</div>
          )}
        </div>
      )}

      {/* ── Review modal ──────────────────────────────────────────────────── */}
      {reviewId && (
        <div className={shared.modalOverlay}>
          <div className={shared.modal}>
            <h2 className={shared.modalTitle}>
              {reviewAction === 'APPROVED' ? 'Approve Stall Application' : 'Reject Application'}
            </h2>

            {reviewAction === 'APPROVED' && (
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Stall Number</label>
                <input
                  type="number"
                  className={shared.formInput}
                  value={reviewStall}
                  onChange={e => setReviewStall(e.target.value)}
                  placeholder="Assign a stall number"
                />
              </div>
            )}

            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Note to Seller <span style={{ color: '#9ca3af' }}>(optional)</span>
              </label>
              <textarea
                className={shared.formTextarea}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder={reviewAction === 'APPROVED'
                  ? 'e.g. Arrive by 7 AM for setup. Stall is near the entrance.'
                  : 'e.g. Applications are full for this event — please apply next time.'}
              />
            </div>

            <div className={shared.modalActions}>
              <button
                className={shared.btnSecondary}
                onClick={() => {
                  setReviewId(null)
                  setReviewAction(null)
                  setReviewNote('')
                  setReviewStall('')
                }}
              >
                Cancel
              </button>
              <button
                className={reviewAction === 'APPROVED' ? shared.btnSuccess : shared.btnDanger}
                onClick={submitReview}
                disabled={updating === reviewId}
              >
                {updating === reviewId
                  ? 'Saving...'
                  : reviewAction === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Maker in Residence modal ──────────────────────────────────────── */}
      {mirMarketId && (
        <div className={shared.modalOverlay}>
          <div className={shared.modal}>
            <h2 className={shared.modalTitle}>Assign Maker in Residence</h2>
            <p className={styles.mirDesc}>
              The Maker in Residence is the featured seller for this market event.
              Their stall is spotlighted in MC announcements and on the market page.
            </p>

            <div className={shared.formGroup}>
              <div className={styles.searchWrap}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={`${shared.formInput} ${styles.searchInput}`}
                  placeholder="Search verified sellers..."
                  value={sellerSearch}
                  onChange={e => setSellerSearch(e.target.value)}
                />
              </div>
            </div>

            {sellersLoading ? (
              <div className={shared.loading}>Loading sellers...</div>
            ) : (
              <div className={styles.sellerPickerList}>
                {filteredSellers.map(s => (
                  <button
                    key={s.id}
                    className={styles.sellerPickerRow}
                    onClick={() => assignMir(s.id)}
                    disabled={assigningMir}
                  >
                    <div className={styles.sellerPickerAvatar}>
                      {s.brandName.charAt(0)}
                    </div>
                    <div className={styles.sellerPickerInfo}>
                      <div className={styles.sellerPickerName}>{s.brandName}</div>
                      <div className={styles.sellerPickerMeta}>
                        {s.category.name}
                        {s.location && ` · ${s.location.name}`}
                        {` · ${s._count.products} products`}
                      </div>
                    </div>
                    <Star size={14} color="#D97706" />
                  </button>
                ))}
                {filteredSellers.length === 0 && (
                  <div className={shared.empty}>No verified sellers found.</div>
                )}
              </div>
            )}

            <div className={shared.modalActions}>
              <button
                className={shared.btnSecondary}
                onClick={() => setMirMarketId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
