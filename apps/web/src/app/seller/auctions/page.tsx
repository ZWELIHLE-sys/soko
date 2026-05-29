'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Gavel, Clock, CheckCircle2, Zap, XCircle, Timer,
  Send, AlertTriangle, UploadCloud, X, TrendingUp, Award,
  BookOpen, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react'
import styles from './auctions.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category { id: string; name: string }

interface AuctionEvent {
  id: string
  title: string
  description: string | null
  theme: string | null
  status: string
  submissionDeadline: string
  catalogueOpenDate: string
  biddingStartDate: string
  biddingEndDate: string
  _count: { items: number }
}

interface MyItem {
  id: string
  title: string
  artistStatement: string | null
  startPrice: number
  currentBid: number | null
  status: string
  adminNote: string | null
  auctionEventId: string | null
  auctionEvent: {
    id: string; title: string; status: string;
    biddingStartDate: string; biddingEndDate: string;
  } | null
  category: { name: string }
  _count: { bids: number }
}

interface Bid { id: string; amount: number; createdAt: string }

interface ItemDetail extends MyItem {
  bids: Bid[]
  winner: { name: string } | null
}

// ─── Status configs ───────────────────────────────────────────────────────────

const ITEM_STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:   { label: 'Under Review',  cls: styles.statusPending,   Icon: Clock        },
  APPROVED:  { label: 'In Catalogue',  cls: styles.statusApproved,  Icon: CheckCircle2 },
  LIVE:      { label: 'Bidding Open',  cls: styles.statusLive,      Icon: Zap          },
  ENDED:     { label: 'Auction Ended', cls: styles.statusEnded,     Icon: Timer        },
  CANCELLED: { label: 'Not Selected',  cls: styles.statusCancelled, Icon: XCircle      },
}

const EVENT_STATUS: Record<string, { label: string; cls: string }> = {
  ANNOUNCED:      { label: 'Open for Submissions', cls: styles.eventOpen    },
  CATALOGUE_OPEN: { label: 'Catalogue Preview',    cls: styles.eventCat     },
  LIVE:           { label: 'Bidding Live',          cls: styles.eventLive    },
  ENDED:          { label: 'Concluded',             cls: styles.eventEnded   },
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(target: string, unit: 'full' | 'short' = 'full') {
  const [text, setText] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setText('—'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (unit === 'short') {
        setText(d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`)
      } else {
        setText(d > 0 ? `${d} day${d !== 1 ? 's' : ''} ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m ${s}s left`)
      }
    }
    tick()
    const id = setInterval(tick, unit === 'full' ? 30000 : 1000)
    return () => clearInterval(id)
  }, [target, unit])
  return text
}

// ─── Live monitor sub-component ───────────────────────────────────────────────

function LiveMonitor({ itemId }: { itemId: string }) {
  const [detail, setDetail] = useState<ItemDetail | null>(null)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTime = detail?.auctionEvent?.biddingEndDate ?? new Date(Date.now() + 60000).toISOString()
  const countdown = useCountdown(endTime, 'short')

  const poll = useCallback(() => {
    fetch(`/api/seller/auctions/${itemId}`).then(r => r.json()).then(setDetail)
  }, [itemId])

  useEffect(() => {
    poll()
    ref.current = setInterval(poll, 15000)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [poll])

  if (!detail) return <div className={styles.liveLoading}>Loading...</div>

  const isEnded = detail.status === 'ENDED'
  const fmt = (d: string) => new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className={styles.livePanel}>
      <div className={styles.liveStats}>
        <div className={styles.liveStat}>
          <span className={styles.liveStatLabel}>Current Bid</span>
          <span className={styles.liveStatValue}>
            R{(detail.currentBid ?? detail.startPrice).toFixed(2)}
          </span>
        </div>
        <div className={styles.liveStat}>
          <span className={styles.liveStatLabel}>Total Bids</span>
          <span className={styles.liveStatValue}>{detail._count.bids}</span>
        </div>
        {!isEnded && (
          <div className={styles.liveStat}>
            <span className={styles.liveStatLabel}>Time Left</span>
            <span className={`${styles.liveStatValue} ${styles.liveCountdown}`}>{countdown}</span>
          </div>
        )}
      </div>
      {isEnded && detail.winner && (
        <div className={styles.winnerBanner}>
          <Award size={13} /> Won by {detail.winner.name} — R{(detail.currentBid ?? 0).toFixed(2)}
        </div>
      )}
      {isEnded && !detail.winner && (
        <div className={styles.noWinnerBanner}><Timer size={13} /> Ended with no bids</div>
      )}
      {detail.bids.length > 0 && (
        <div className={styles.bidFeed}>
          <div className={styles.bidFeedTitle}><TrendingUp size={11} /> Bid History</div>
          {detail.bids.map((b, i) => (
            <div key={b.id} className={`${styles.bidRow} ${i === 0 ? styles.bidRowTop : ''}`}>
              <span className={styles.bidAmt}>R{b.amount.toFixed(2)}</span>
              <span className={styles.bidTime}>{fmt(b.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Submit form ──────────────────────────────────────────────────────────────

const BLANK = { title: '', description: '', artistStatement: '', categoryId: '', startPrice: '', reservePrice: '' }

function SubmitForm({
  event, categories, onSubmitted, onCancel,
}: {
  event: AuctionEvent
  categories: Category[]
  onSubmitted: () => void
  onCancel: () => void
}) {
  const [form, setForm]       = useState(BLANK)
  const [images, setImages]   = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

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
        <input
          className={styles.input}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Hand-beaded Zulu neck piece — one of a kind"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Artist Statement <span className={styles.optional}>recommended — 2–3 sentences</span>
        </label>
        <textarea
          className={styles.textarea}
          rows={3}
          value={form.artistStatement}
          onChange={e => setForm(f => ({ ...f, artistStatement: e.target.value }))}
          placeholder="Tell bidders the story of this piece — what inspired it, how it was made, what makes it one of a kind..."
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Full Description <span className={styles.req}>*</span></label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Materials, dimensions, technique, condition — everything a serious bidder wants to know..."
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Category <span className={styles.req}>*</span></label>
          <select
            className={styles.input}
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Starting Bid (R) <span className={styles.req}>*</span></label>
          <input
            className={styles.input} type="number" min="1" step="0.01"
            value={form.startPrice}
            onChange={e => setForm(f => ({ ...f, startPrice: e.target.value }))}
            placeholder="e.g. 350.00"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Reserve Price (R) <span className={styles.optional}>optional — hidden minimum</span></label>
        <input
          className={styles.input} type="number" min="1" step="0.01"
          value={form.reservePrice}
          onChange={e => setForm(f => ({ ...f, reservePrice: e.target.value }))}
          placeholder="Leave blank if you have no minimum"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Photos <span className={styles.optional}>up to 5 · JPEG/PNG/WebP · max 10MB</span>
        </label>
        <div className={styles.imageGrid}>
          {images.map((url, i) => (
            <div key={i} className={styles.imageThumb}>
              <Image src={url} alt="" fill style={{ objectFit: 'cover' }} sizes="80px" />
              <button className={styles.imageRemove} onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}>
                <X size={10} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className={styles.imageUpload}>
              {uploading ? <span className={styles.uploadingText}>...</span> : <UploadCloud size={20} />}
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SellerAuctionsPage() {
  const [events, setEvents]     = useState<AuctionEvent[]>([])
  const [myItems, setMyItems]   = useState<MyItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]   = useState(true)
  const [submittingTo, setSubmittingTo] = useState<string | null>(null) // eventId
  const [expanded, setExpanded] = useState<string | null>(null)
  const [success, setSuccess]   = useState('')

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/seller/auction-events').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([{ events: ev, myItems: mi }, cats]) => {
      setEvents(ev ?? [])
      setMyItems(mi ?? [])
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmitted = () => {
    setSuccess('Item submitted for consideration! We will review it for the catalogue.')
    setSubmittingTo(null)
    load()
    setTimeout(() => setSuccess(''), 6000)
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (loading) return <div className={styles.loading}>Loading auctions...</div>

  // Group my items by event
  const itemsByEvent: Record<string, MyItem[]> = {}
  const noEventItems: MyItem[] = []
  for (const item of myItems) {
    if (item.auctionEventId) {
      itemsByEvent[item.auctionEventId] = [...(itemsByEvent[item.auctionEventId] ?? []), item]
    } else {
      noEventItems.push(item)
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroBannerEyebrow}>Vuna Auctions</div>
        <h1 className={styles.heroBannerTitle}>Submit your best work for the catalogue</h1>
        <p className={styles.heroBannerSub}>
          Vuna runs curated auction events — like an auction house, not a listing site.
          When an event is announced, submit your piece. Our team selects what enters the catalogue.
          Buyers bid when the event goes live. Hammer prices are published.
        </p>
      </div>

      {success && (
        <div className={styles.successBanner}><CheckCircle2 size={15} /> {success}</div>
      )}

      {/* Upcoming events */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Upcoming Auction Events</div>
        {events.length === 0 ? (
          <div className={styles.emptyCard}>
            <Gavel size={32} className={styles.emptyCardIcon} />
            <div className={styles.emptyCardTitle}>No auction events announced yet</div>
            <div className={styles.emptyCardSub}>
              Our team announces curated auction events periodically. Watch your email for the next one.
            </div>
          </div>
        ) : (
          <div className={styles.eventList}>
            {events.map(ev => {
              const statusCfg = EVENT_STATUS[ev.status] ?? EVENT_STATUS.ANNOUNCED
              const submissionOpen = ev.status === 'ANNOUNCED' && new Date() <= new Date(ev.submissionDeadline)
              const myEventItems = itemsByEvent[ev.id] ?? []
              const alreadySubmitted = myEventItems.length > 0

              return (
                <div key={ev.id} className={`${styles.eventCard} ${ev.status === 'LIVE' ? styles.eventCardLive : ''}`}>
                  <div className={styles.eventTop}>
                    <div className={styles.eventLeft}>
                      {ev.theme && <div className={styles.eventTheme}>{ev.theme}</div>}
                      <div className={styles.eventTitle}>{ev.title}</div>
                      <div className={styles.eventDates}>
                        <span><Calendar size={11} /> Submissions close: {fmt(ev.submissionDeadline)}</span>
                        <span><BookOpen size={11} /> Catalogue opens: {fmt(ev.catalogueOpenDate)}</span>
                        <span><Gavel size={11} /> Bidding: {fmt(ev.biddingStartDate)} — {fmt(ev.biddingEndDate)}</span>
                      </div>
                    </div>
                    <div className={styles.eventRight}>
                      <span className={`${styles.eventStatusBadge} ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                      {submissionOpen && !alreadySubmitted && (
                        <button
                          className={styles.submitItemBtn}
                          onClick={() => setSubmittingTo(ev.id)}
                        >
                          Submit Your Item →
                        </button>
                      )}
                      {alreadySubmitted && (
                        <span className={styles.submittedNote}>
                          <CheckCircle2 size={11} /> {myEventItems.length} item{myEventItems.length !== 1 ? 's' : ''} submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {ev.description && (
                    <p className={styles.eventDesc}>{ev.description}</p>
                  )}

                  {/* My items for this event */}
                  {myEventItems.length > 0 && (
                    <div className={styles.myEventItems}>
                      <div className={styles.myItemsLabel}>My Submissions</div>
                      {myEventItems.map(item => {
                        const cfg = ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING
                        const canMonitor = item.status === 'LIVE' || item.status === 'ENDED'
                        const isOpen = expanded === item.id

                        return (
                          <div key={item.id} className={`${styles.itemCard} ${item.status === 'LIVE' ? styles.itemCardLive : ''}`}>
                            <div
                              className={styles.itemCardInner}
                              onClick={() => canMonitor && setExpanded(isOpen ? null : item.id)}
                              style={{ cursor: canMonitor ? 'pointer' : 'default' }}
                            >
                              <div className={styles.itemLeft}>
                                <div className={styles.itemTitle}>{item.title}</div>
                                {item.artistStatement && (
                                  <div className={styles.itemStatement}>&ldquo;{item.artistStatement}&rdquo;</div>
                                )}
                                <div className={styles.itemMeta}>
                                  {item.category.name} · {item._count.bids} bid{item._count.bids !== 1 ? 's' : ''}
                                  {canMonitor && <span className={styles.tapHint}> · tap to {isOpen ? 'collapse' : 'monitor'}</span>}
                                </div>
                                {item.adminNote && (
                                  <div className={styles.itemAdminNote}>Review note: {item.adminNote}</div>
                                )}
                              </div>
                              <div className={styles.itemRight}>
                                <div className={styles.itemPrice}>
                                  R{(item.currentBid ?? item.startPrice).toFixed(2)}
                                  <span className={styles.priceSub}>{item.currentBid ? 'current bid' : 'start price'}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${cfg.cls}`}>
                                  <cfg.Icon size={11} /> {cfg.label}
                                </span>
                                {item.status === 'LIVE' && (
                                  <Link href={`/auctions/${item.id}`} className={styles.viewLiveBtn}
                                    onClick={e => e.stopPropagation()}>
                                    View Public Listing →
                                  </Link>
                                )}
                              </div>
                            </div>
                            {canMonitor && isOpen && <LiveMonitor itemId={item.id} />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Submission form inline */}
                  {submittingTo === ev.id && (
                    <SubmitForm
                      event={ev}
                      categories={categories}
                      onSubmitted={handleSubmitted}
                      onCancel={() => setSubmittingTo(null)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Items not linked to any event (legacy) */}
      {noEventItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Other Submissions</div>
          <div className={styles.auctionList}>
            {noEventItems.map(item => {
              const cfg = ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING
              return (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemCardInner}>
                    <div className={styles.itemLeft}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemMeta}>{item.category.name}</div>
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemPrice}>R{item.startPrice.toFixed(2)}</div>
                      <span className={`${styles.statusBadge} ${cfg.cls}`}>
                        <cfg.Icon size={11} /> {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
