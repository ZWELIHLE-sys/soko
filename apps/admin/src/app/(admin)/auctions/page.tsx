'use client'

import { useEffect, useState } from 'react'
import {
  Plus, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Gavel,
  Trophy, ShieldAlert, Eye,
} from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './auctions.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type EventStatus = 'ANNOUNCED' | 'CATALOGUE_OPEN' | 'LIVE' | 'ENDED'

interface Bid {
  id:        string
  amount:    number
  createdAt: string
  bidder:    { name: string }
}

interface AuctionItem {
  id:              string
  title:           string
  description:     string
  artistStatement: string | null
  images:          string[]
  startPrice:      number
  reservePrice:    number | null
  currentBid:      number | null
  status:          string
  adminNote:       string | null
  seller:          { brandName: string }
  category:        { name: string }
  winner:          { name: string } | null
  _count:          { bids: number }
}

interface AuctionEvent {
  id:                 string
  title:              string
  theme:              string | null
  status:             EventStatus
  submissionDeadline: string
  catalogueOpenDate:  string
  biddingStartDate:   string
  biddingEndDate:     string
  isActive:           boolean
  _count:             { items: number }
  items:              { id: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_STATUS_STYLE: Record<EventStatus, { color: string; bg: string; label: string }> = {
  ANNOUNCED:      { color: '#92400E', bg: '#FEF9C3', label: 'Announced' },
  CATALOGUE_OPEN: { color: '#1D4ED8', bg: '#EFF6FF', label: 'Catalogue Open' },
  LIVE:           { color: '#14532D', bg: '#DCFCE7', label: 'Live — Bidding Open' },
  ENDED:          { color: '#374151', bg: '#F3F4F6', label: 'Ended' },
}

const ITEM_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#92400E', bg: '#FEF9C3' },
  APPROVED:  { color: '#1D4ED8', bg: '#EFF6FF' },
  LIVE:      { color: '#14532D', bg: '#DCFCE7' },
  ENDED:     { color: '#374151', bg: '#F3F4F6' },
  CANCELLED: { color: '#991B1B', bg: '#FEE2E2' },
}

const STATUS_TRANSITIONS: Record<EventStatus, { next: EventStatus; label: string } | null> = {
  ANNOUNCED:      { next: 'CATALOGUE_OPEN', label: 'Open Catalogue' },
  CATALOGUE_OPEN: { next: 'LIVE',           label: 'Go Live' },
  LIVE:           { next: 'ENDED',          label: 'End Auction' },
  ENDED:          null,
}

const EMPTY_FORM = {
  title: '', description: '', theme: '',
  submissionDeadline: '', catalogueOpenDate: '',
  biddingStartDate: '', biddingEndDate: '',
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAuctionsPage() {
  const [events, setEvents]         = useState<AuctionEvent[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [items, setItems]           = useState<Record<string, AuctionItem[]>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState<string | null>(null)

  // Item review modal
  const [reviewId, setReviewId]       = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'CANCELLED' | null>(null)
  const [reviewNote, setReviewNote]   = useState('')
  const [updating, setUpdating]       = useState<string | null>(null)

  // Bid history modal
  const [bidsItemId, setBidsItemId]   = useState<string | null>(null)
  const [bids, setBids]               = useState<Bid[]>([])
  const [bidsLoading, setBidsLoading] = useState(false)
  const [bidsTitle, setBidsTitle]     = useState('')

  // ── Data ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/auctions/events')
      .then(r => r.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const loadItems = async (eventId: string) => {
    if (items[eventId]) return
    const res  = await fetch(`/api/auctions/events/${eventId}`)
    const data = await res.json()
    setItems(prev => ({ ...prev, [eventId]: data.items }))
  }

  const openBids = async (item: AuctionItem) => {
    setBidsTitle(item.title)
    setBidsItemId(item.id)
    setBidsLoading(true)
    const res  = await fetch(`/api/auctions/items/${item.id}`)
    const data = await res.json()
    setBids(data.bids ?? [])
    setBidsLoading(false)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleEvent = (id: string) => {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
      loadItems(id)
    }
  }

  const createEvent = async () => {
    setSaving(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/auctions/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setEvents(prev => [{ ...created, _count: { items: 0 }, items: [] }, ...prev])
        setForm(EMPTY_FORM)
        setShowCreate(false)
      } else {
        const err = await res.json().catch(() => ({}))
        setCreateError(err.error ?? `Server error ${res.status}`)
      }
    } catch {
      setCreateError('Network error — check the console for details')
    }
    setSaving(false)
  }

  const transitionStatus = async (eventId: string, next: EventStatus) => {
    setTransitioning(eventId)
    const res = await fetch(`/api/auctions/events/${eventId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: next }),
    })
    if (res.ok) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: next } : e))
    }
    setTransitioning(null)
  }

  const submitItemReview = async () => {
    if (!reviewId || !reviewAction) return
    setUpdating(reviewId)
    const res = await fetch(`/api/auctions/items/${reviewId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: reviewAction, adminNote: reviewNote }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          next[key] = next[key].map(i => i.id === reviewId ? { ...i, ...updated } : i)
        }
        return next
      })
      if (reviewAction === 'APPROVED') {
        setEvents(prev => prev.map(e => ({
          ...e,
          items: e.items.filter(i => i.id !== reviewId),
        })))
      }
    }
    setUpdating(null)
    setReviewId(null)
    setReviewAction(null)
    setReviewNote('')
  }

  const pendingCount = (eventId: string) =>
    events.find(e => e.id === eventId)?.items?.length ?? 0

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={shared.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={shared.pageTitle}>Auction Management</h1>
          <p className={shared.pageSub}>
            Create auction events, curate items into the catalogue, manage the live auction.
          </p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} />
          New Auction Event
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className={`${shared.card} ${styles.createForm}`}>
          <h2 className={shared.cardTitle}>Create Auction Event</h2>
          <p className={styles.createNote}>
            Monday Vuna Auction runs every Monday 12:00 PM – 8:00 PM.
            One-of-a-kind pieces only. Set the dates below and sellers can submit items immediately.
          </p>
          <div className={styles.formGrid}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Title *</label>
              <input
                className={shared.formInput}
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Vuna Heritage Auction — 2 June 2026"
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Theme</label>
              <input
                className={shared.formInput}
                value={form.theme}
                onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
                placeholder="e.g. Contemporary African Craft"
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Submission Deadline *</label>
              <input type="datetime-local" className={shared.formInput}
                value={form.submissionDeadline}
                onChange={e => setForm(p => ({ ...p, submissionDeadline: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Catalogue Opens *</label>
              <input type="datetime-local" className={shared.formInput}
                value={form.catalogueOpenDate}
                onChange={e => setForm(p => ({ ...p, catalogueOpenDate: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Bidding Start *</label>
              <input type="datetime-local" className={shared.formInput}
                value={form.biddingStartDate}
                onChange={e => setForm(p => ({ ...p, biddingStartDate: e.target.value }))}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Bidding End (Hammer) *</label>
              <input type="datetime-local" className={shared.formInput}
                value={form.biddingEndDate}
                onChange={e => setForm(p => ({ ...p, biddingEndDate: e.target.value }))}
              />
            </div>
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Description</label>
            <textarea className={shared.formTextarea}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell sellers and buyers what makes this auction special..."
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
              onClick={createEvent}
              disabled={saving || !form.title || !form.submissionDeadline || !form.biddingStartDate || !form.biddingEndDate}
            >
              {saving ? 'Creating...' : 'Create Auction Event'}
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className={shared.loading}>Loading auction events...</div>
      ) : (
        <div className={styles.list}>
          {events.map(event => {
            const sc         = EVENT_STATUS_STYLE[event.status]
            const transition = STATUS_TRANSITIONS[event.status]
            const isOpen     = expanded === event.id
            const pending    = pendingCount(event.id)

            return (
              <div key={event.id} className={styles.eventCard}>

                {/* Event header */}
                <div className={styles.eventHeader}>
                  <div className={styles.eventHeaderLeft} onClick={() => toggleEvent(event.id)}>
                    <div style={{ flex: 1 }}>
                      <div className={styles.eventTitleRow}>
                        <Gavel size={16} color="#7C2D12" />
                        <span className={styles.eventTitle}>{event.title}</span>
                        <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </div>
                      {event.theme && (
                        <div className={styles.eventTheme}>Theme: {event.theme}</div>
                      )}

                      {/* Date pipeline */}
                      <div className={styles.pipeline}>
                        <div className={`${styles.pipeStep} ${new Date() > new Date(event.submissionDeadline) ? styles.pipeStepDone : ''}`}>
                          <span className={styles.pipeLabel}>Submissions close</span>
                          <span className={styles.pipeDate}>{fmt(event.submissionDeadline)}</span>
                        </div>
                        <div className={styles.pipeDivider} />
                        <div className={`${styles.pipeStep} ${new Date() > new Date(event.catalogueOpenDate) ? styles.pipeStepDone : ''}`}>
                          <span className={styles.pipeLabel}>Catalogue opens</span>
                          <span className={styles.pipeDate}>{fmt(event.catalogueOpenDate)}</span>
                        </div>
                        <div className={styles.pipeDivider} />
                        <div className={`${styles.pipeStep} ${new Date() > new Date(event.biddingStartDate) ? styles.pipeStepDone : ''}`}>
                          <span className={styles.pipeLabel}>Bidding starts</span>
                          <span className={styles.pipeDate}>{fmt(event.biddingStartDate)}</span>
                        </div>
                        <div className={styles.pipeDivider} />
                        <div className={`${styles.pipeStep} ${new Date() > new Date(event.biddingEndDate) ? styles.pipeStepDone : ''}`}>
                          <span className={styles.pipeLabel}>Hammer falls</span>
                          <span className={styles.pipeDate}>{fmt(event.biddingEndDate)}</span>
                        </div>
                      </div>

                      <div className={styles.eventStats}>
                        <span>{event._count.items} item{event._count.items !== 1 ? 's' : ''} submitted</span>
                        {pending > 0 && (
                          <span className={styles.pendingTag}>{pending} pending review</span>
                        )}
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronUp size={18} color="#6b7280" />
                      : <ChevronDown size={18} color="#6b7280" />
                    }
                  </div>

                  {/* Transition button */}
                  {transition && (
                    <div className={styles.eventControls}>
                      <button
                        className={shared.btnPrimary}
                        onClick={() => transitionStatus(event.id, transition.next)}
                        disabled={transitioning === event.id}
                      >
                        <Gavel size={13} />
                        {transitioning === event.id ? '...' : transition.label}
                      </button>
                    </div>
                  )}
                  {event.status === 'ENDED' && (
                    <div className={styles.endedBadge}>
                      <Gavel size={14} />
                      Auction Complete
                    </div>
                  )}
                </div>

                {/* Items panel */}
                {isOpen && (
                  <div className={styles.itemsPanel}>
                    {!items[event.id] ? (
                      <div className={shared.loading}>Loading items...</div>
                    ) : items[event.id].length === 0 ? (
                      <div className={shared.empty}>No items submitted yet.</div>
                    ) : (
                      items[event.id].map(item => {
                        const isc = ITEM_STATUS_STYLE[item.status] ?? ITEM_STATUS_STYLE.PENDING
                        const reserveMet = item.reservePrice != null && item.currentBid != null
                          && item.currentBid >= item.reservePrice

                        return (
                          <div key={item.id} className={styles.itemCard}>

                            {/* Image thumbnails */}
                            {item.images.length > 0 && (
                              <div className={styles.imageThumbs}>
                                {item.images.slice(0, 4).map((img, i) => (
                                  <img key={i} src={img} alt="" className={styles.thumb} />
                                ))}
                              </div>
                            )}

                            <div className={styles.itemBody}>
                              <div className={styles.itemHeader}>
                                <div>
                                  <div className={styles.itemTitle}>{item.title}</div>
                                  <div className={styles.itemMeta}>
                                    {item.seller.brandName} · {item.category.name}
                                  </div>
                                </div>
                                <span className={shared.badge} style={{ background: isc.bg, color: isc.color }}>
                                  {item.status}
                                </span>
                              </div>

                              {/* Pricing row */}
                              <div className={styles.pricingRow}>
                                <span className={styles.priceTag}>
                                  Start: <strong>R{item.startPrice.toFixed(2)}</strong>
                                </span>
                                {item.reservePrice != null && (
                                  <span className={`${styles.priceTag} ${styles.reserveTag}`}>
                                    <ShieldAlert size={11} />
                                    Reserve: R{item.reservePrice.toFixed(2)}
                                    <span className={styles.reserveNote}>(hidden from buyers)</span>
                                  </span>
                                )}
                              </div>

                              {/* Artist statement */}
                              {item.artistStatement && (
                                <div className={styles.artistStatement}>
                                  &ldquo;{item.artistStatement}&rdquo;
                                </div>
                              )}

                              {/* Description preview */}
                              <div className={styles.itemDesc}>
                                {item.description.length > 120
                                  ? item.description.slice(0, 120) + '...'
                                  : item.description}
                              </div>

                              {/* LIVE — bidding activity */}
                              {(item.status === 'LIVE' || (item.status === 'APPROVED' && event.status === 'LIVE')) && (
                                <div className={styles.liveRow}>
                                  {item.currentBid != null ? (
                                    <>
                                      <span className={styles.currentBid}>
                                        Current bid: <strong>R{item.currentBid.toFixed(2)}</strong>
                                      </span>
                                      <span className={styles.bidCount}>
                                        {item._count.bids} bid{item._count.bids !== 1 ? 's' : ''}
                                      </span>
                                      {item.reservePrice != null && (
                                        <span className={reserveMet ? styles.reserveMet : styles.reserveNotMet}>
                                          {reserveMet ? '✓ Reserve met' : '✗ Reserve not met'}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className={styles.noBids}>No bids yet</span>
                                  )}
                                  {item._count.bids > 0 && (
                                    <button
                                      className={styles.viewBidsBtn}
                                      onClick={() => openBids(item)}
                                    >
                                      <Eye size={12} />
                                      View Bids
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* ENDED — winner and hammer price */}
                              {item.status === 'ENDED' && (
                                <div className={styles.hammerRow}>
                                  <div className={styles.hammerLeft}>
                                    {item.winner ? (
                                      <>
                                        <Trophy size={14} color="#D97706" />
                                        <span className={styles.winnerLabel}>
                                          Sold to <strong>{item.winner.name}</strong>
                                        </span>
                                        <span className={styles.hammerPrice}>
                                          R{item.currentBid?.toFixed(2) ?? '—'}
                                        </span>
                                        {item.reservePrice != null && (
                                          <span className={reserveMet ? styles.reserveMet : styles.reserveNotMet}>
                                            {reserveMet ? '✓ Reserve met' : '✗ Reserve not met'}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className={styles.noBids}>No bids — item unsold</span>
                                    )}
                                  </div>
                                  {item._count.bids > 0 && (
                                    <button
                                      className={styles.viewBidsBtn}
                                      onClick={() => openBids(item)}
                                    >
                                      <Eye size={12} />
                                      View All Bids ({item._count.bids})
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Admin note */}
                              {item.adminNote && (
                                <div className={styles.adminNote}>
                                  Admin note: {item.adminNote}
                                </div>
                              )}

                              {/* PENDING — action buttons */}
                              {item.status === 'PENDING' && (
                                <div className={styles.itemActions}>
                                  <button
                                    className={shared.btnSuccess}
                                    onClick={() => { setReviewId(item.id); setReviewAction('APPROVED') }}
                                  >
                                    <CheckCircle size={14} />
                                    Approve into Catalogue
                                  </button>
                                  <button
                                    className={shared.btnDanger}
                                    onClick={() => { setReviewId(item.id); setReviewAction('CANCELLED') }}
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </div>
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

          {events.length === 0 && (
            <div className={shared.empty}>No auction events yet. Create the first one.</div>
          )}
        </div>
      )}

      {/* ── Item review modal ─────────────────────────────────────────────── */}
      {reviewId && (
        <div className={shared.modalOverlay}>
          <div className={shared.modal}>
            <h2 className={shared.modalTitle}>
              {reviewAction === 'APPROVED' ? 'Approve Item into Catalogue' : 'Reject Item'}
            </h2>
            <p className={styles.modalNote}>
              {reviewAction === 'APPROVED'
                ? 'This item will appear in the catalogue when the event moves to Catalogue Open. Buyers can preview it before bidding opens.'
                : 'The seller will be notified. Provide a reason so they can improve for the next event.'}
            </p>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Note to Seller <span style={{ color: '#9ca3af' }}>(optional)</span>
              </label>
              <textarea
                className={shared.formTextarea}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder={reviewAction === 'APPROVED'
                  ? 'e.g. Approved — please ensure all photos are high resolution before bidding opens.'
                  : 'e.g. This item does not meet the one-of-a-kind requirement. Mass-produced items cannot be listed.'}
              />
            </div>
            <div className={shared.modalActions}>
              <button
                className={shared.btnSecondary}
                onClick={() => { setReviewId(null); setReviewAction(null); setReviewNote('') }}
              >
                Cancel
              </button>
              <button
                className={reviewAction === 'APPROVED' ? shared.btnSuccess : shared.btnDanger}
                onClick={submitItemReview}
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

      {/* ── Bid history modal ─────────────────────────────────────────────── */}
      {bidsItemId && (
        <div className={shared.modalOverlay}>
          <div className={shared.modal}>
            <h2 className={shared.modalTitle}>Bid History — {bidsTitle}</h2>

            {bidsLoading ? (
              <div className={shared.loading}>Loading bids...</div>
            ) : bids.length === 0 ? (
              <div className={shared.empty}>No bids placed yet.</div>
            ) : (
              <div className={styles.bidsList}>
                {bids.map((bid, i) => (
                  <div key={bid.id} className={`${styles.bidRow} ${i === 0 ? styles.bidRowTop : ''}`}>
                    <div className={styles.bidLeft}>
                      {i === 0 && <Trophy size={13} color="#D97706" />}
                      <span className={styles.bidder}>{bid.bidder.name}</span>
                    </div>
                    <div className={styles.bidRight}>
                      <span className={`${styles.bidAmount} ${i === 0 ? styles.bidAmountTop : ''}`}>
                        R{bid.amount.toFixed(2)}
                      </span>
                      <span className={styles.bidTime}>{fmtTime(bid.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={shared.modalActions}>
              <button
                className={shared.btnPrimary}
                onClick={() => { setBidsItemId(null); setBids([]) }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
