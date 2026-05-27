'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Store, Clock, CheckCircle2, XCircle, Calendar, Send,
  AlertTriangle, Star, Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import styles from './market.module.css'

interface MakerInResident {
  id: string
  brandName: string
  name: string
  avatar: string | null
  bio: string | null
}

interface Market {
  id: string
  title: string
  description: string | null
  theme: string | null
  startDate: string
  endDate: string
  applicationDeadline: string
  maxListings: number | null
  makerInResident: MakerInResident | null
  _count: { listings: number }
}

interface SellerProduct {
  id: string
  name: string
  images: string[]
  price: number
  category: { name: string }
}

interface ListingProduct {
  id: string
  name: string
  images: string[]
  price: number
}

interface MarketListing {
  id: string
  status: string
  sellerNote: string | null
  adminNote: string | null
  stallNumber: number | null
  createdAt: string
  productIds: string[]
  products: ListingProduct[]
  market: Market
}

const STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:  { label: 'Under Review',  cls: styles.statusPending,  Icon: Clock        },
  APPROVED: { label: 'Stall Approved', cls: styles.statusApproved, Icon: CheckCircle2 },
  REJECTED: { label: 'Not Selected',  cls: styles.statusRejected, Icon: XCircle      },
}

function useCountdown(deadline: string) {
  const [text, setText] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) { setText('Deadline passed'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      if (d > 0) setText(`${d}d ${h}h left to apply`)
      else if (h > 0) setText(`${h}h ${m}m left to apply`)
      else setText(`${m} minutes left to apply`)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [deadline])
  return text
}

function MarketAnnouncement({
  market, sellerProducts, onApplied, alreadyApplied,
}: {
  market: Market
  sellerProducts: SellerProduct[]
  onApplied: () => void
  alreadyApplied: boolean
}) {
  const [open, setOpen]       = useState(false)
  const [note, setNote]       = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const countdown             = useCountdown(market.applicationDeadline)
  const deadlinePassed        = new Date(market.applicationDeadline) < new Date()
  const stallsFull            = market.maxListings ? market._count.listings >= market.maxListings : false

  const toggleProduct = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const handleSubmit = async () => {
    setError('')
    if (selected.length === 0) { setError('Select at least one product you are bringing.'); return }
    setSubmitting(true)
    const res = await fetch('/api/market/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketId: market.id, productIds: selected, sellerNote: note }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? 'Application failed.'); return }
    setOpen(false)
    onApplied()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const stallsLeft = market.maxListings ? market.maxListings - market._count.listings : null

  return (
    <div className={styles.announcementCard}>
      {/* Market header */}
      <div className={styles.announcementTop}>
        <div className={styles.announcementLeft}>
          {market.theme && <div className={styles.announcementTheme}>{market.theme}</div>}
          <h2 className={styles.announcementTitle}>{market.title}</h2>
          <div className={styles.announcementDates}>
            <span><Calendar size={12} /> Event: {fmt(market.startDate)} — {fmt(market.endDate)}</span>
            <span><Clock size={12} /> Apply by: {fmt(market.applicationDeadline)}</span>
          </div>
          {stallsLeft !== null && (
            <div className={`${styles.stallsLeft} ${stallsFull ? styles.stallsFull : ''}`}>
              {stallsFull ? 'No stalls remaining' : `${stallsLeft} stall${stallsLeft !== 1 ? 's' : ''} remaining`}
            </div>
          )}
        </div>
        {!deadlinePassed && !stallsFull && !alreadyApplied && (
          <div className={styles.countdownBadge}>
            <Clock size={12} />
            {countdown}
          </div>
        )}
        {alreadyApplied && (
          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
            <CheckCircle2 size={11} /> Applied
          </span>
        )}
      </div>

      {market.description && (
        <p className={styles.announcementDesc}>{market.description}</p>
      )}

      {/* Maker in Residence spotlight */}
      {market.makerInResident && (
        <div className={styles.makerInResidence}>
          <div className={styles.mirLabel}>
            <Star size={11} /> Maker in Residence
          </div>
          <div className={styles.mirContent}>
            <div className={styles.mirAvatar}>
              {market.makerInResident.avatar ? (
                <Image
                  src={market.makerInResident.avatar}
                  alt={market.makerInResident.brandName}
                  fill style={{ objectFit: 'cover' }} sizes="40px"
                />
              ) : (
                <span>{market.makerInResident.brandName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className={styles.mirName}>{market.makerInResident.brandName}</div>
              {market.makerInResident.bio && (
                <div className={styles.mirBio}>{market.makerInResident.bio.slice(0, 120)}...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply CTA */}
      {!alreadyApplied && !deadlinePassed && !stallsFull && (
        <>
          {!open ? (
            <button className={styles.applyBtn} onClick={() => setOpen(true)}>
              Apply for Your Stall →
            </button>
          ) : (
            <div className={styles.applyForm}>
              <div className={styles.applyFormTitle}>Your Market Application</div>

              {error && (
                <div className={styles.applyError}><AlertTriangle size={13} /> {error}</div>
              )}

              {/* Product selection */}
              <div className={styles.applySection}>
                <div className={styles.applySectionLabel}>
                  <Package size={13} /> Select the products you&apos;re bringing <span className={styles.req}>*</span>
                </div>
                <p className={styles.applySectionHint}>
                  The market is for special, curated items. Choose products that fit the theme and represent your best work.
                </p>
                {sellerProducts.length === 0 ? (
                  <div className={styles.noProducts}>
                    You need at least one active product listed to apply. Add products first.
                  </div>
                ) : (
                  <div className={styles.productSelectGrid}>
                    {sellerProducts.map(p => {
                      const isSelected = selected.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`${styles.productSelectCard} ${isSelected ? styles.productSelectCardOn : ''}`}
                          onClick={() => toggleProduct(p.id)}
                        >
                          <div className={styles.productSelectImg}>
                            {p.images[0] ? (
                              <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                            ) : (
                              <div className={styles.productSelectImgFallback} />
                            )}
                            {isSelected && (
                              <div className={styles.productSelectCheck}>
                                <CheckCircle2 size={16} />
                              </div>
                            )}
                          </div>
                          <div className={styles.productSelectInfo}>
                            <div className={styles.productSelectName}>{p.name}</div>
                            <div className={styles.productSelectPrice}>R{p.price.toFixed(2)}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Stall note */}
              <div className={styles.applySection}>
                <div className={styles.applySectionLabel}>Tell us about your market appearance</div>
                <textarea
                  className={styles.applyTextarea}
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="How does your work fit this market's theme? What makes these pieces special? Any details the team should know..."
                />
              </div>

              <div className={styles.applyActions}>
                <button
                  className={styles.submitApplyBtn}
                  disabled={submitting || selected.length === 0}
                  onClick={handleSubmit}
                >
                  <Send size={13} />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  className={styles.cancelApplyBtn}
                  onClick={() => { setOpen(false); setError('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {deadlinePassed && !alreadyApplied && (
        <div className={styles.closedNote}>Applications closed for this market</div>
      )}
      {stallsFull && !alreadyApplied && (
        <div className={styles.closedNote}>All stalls are filled — check the next market</div>
      )}
    </div>
  )
}

function VirtualStall({ listing }: { listing: MarketListing }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`${styles.listingCard} ${listing.status === 'APPROVED' ? styles.listingCardApproved : ''}`}>
      <div className={styles.listingTop}>
        <div className={styles.listingMeta}>
          <div className={styles.listingMarket}>{listing.market.title}</div>
          <div className={styles.listingDate}>
            Applied {new Date(listing.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className={styles.listingRight}>
          {listing.stallNumber && (
            <span className={styles.stallBadge}>Stall #{listing.stallNumber}</span>
          )}
          <span className={`${styles.statusBadge} ${STATUS[listing.status]?.cls ?? styles.statusPending}`}>
            {(() => { const I = STATUS[listing.status]?.Icon ?? Clock; return <I size={11} /> })()}
            {STATUS[listing.status]?.label ?? listing.status}
          </span>
        </div>
      </div>

      {listing.adminNote && (
        <div className={styles.adminNote}>Admin: {listing.adminNote}</div>
      )}

      {listing.status === 'APPROVED' && listing.products.length > 0 && (
        <>
          <button
            className={styles.stallToggle}
            onClick={() => setOpen(o => !o)}
          >
            <Store size={13} />
            {open ? 'Hide' : 'View'} Your Virtual Stall
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {open && (
            <div className={styles.virtualStall}>
              <div className={styles.virtualStallLabel}>Your Market Stall</div>
              {listing.sellerNote && (
                <div className={styles.stallNote}>&ldquo;{listing.sellerNote}&rdquo;</div>
              )}
              <div className={styles.stallProducts}>
                {listing.products.map(p => (
                  <div key={p.id} className={styles.stallProduct}>
                    <div className={styles.stallProductImg}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                      ) : (
                        <div className={styles.stallProductImgFallback} />
                      )}
                      <div className={styles.debutBadge}>Market Debut</div>
                    </div>
                    <div className={styles.stallProductName}>{p.name}</div>
                    <div className={styles.stallProductPrice}>R{p.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SellerMarketPage() {
  const [markets, setMarkets]             = useState<Market[]>([])
  const [listings, setListings]           = useState<MarketListing[]>([])
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading]             = useState(true)
  const [success, setSuccess]             = useState('')

  const load = useCallback(() => {
    fetch('/api/seller/market-listings')
      .then(r => r.json())
      .then(data => {
        setMarkets(data.markets ?? [])
        setListings(data.listings ?? [])
        setSellerProducts(data.sellerProducts ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleApplied = () => {
    setSuccess('Application submitted! Our team will review it within 48 hours.')
    load()
    setTimeout(() => setSuccess(''), 5000)
  }

  const appliedIds = new Set(listings.map(l => l.market.id))

  if (loading) return <div className={styles.loading}>Loading market info...</div>

  return (
    <div>
      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroBannerEyebrow}>Vuna Pop-Up Market</div>
        <h1 className={styles.heroBannerTitle}>Bring your craft to the market floor</h1>
        <p className={styles.heroBannerSub}>
          Vuna curates pop-up market events with a limited number of stalls.
          When a market is announced, apply with your best work — our team selects sellers
          based on craft quality and theme fit. Being selected is a badge of honour.
        </p>
      </div>

      {success && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {/* Active market announcements */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Open Market Events</div>
        {markets.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyCardEyebrow}>Watch This Space</div>
            <Store size={28} className={styles.emptyCardIcon} />
            <div className={styles.emptyCardTitle}>Next market date coming soon</div>
            <div className={styles.emptyCardSub}>
              Vuna markets are curated pop-up events with limited stalls.
              When the next date is announced, your application form will appear right here.
            </div>
          </div>
        ) : (
          <div className={styles.announcementList}>
            {markets.map(m => (
              <MarketAnnouncement
                key={m.id}
                market={m}
                sellerProducts={sellerProducts}
                onApplied={handleApplied}
                alreadyApplied={appliedIds.has(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* My applications / virtual stalls */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>My Applications & Stalls</div>
        {listings.length === 0 ? (
          <div className={styles.emptySmall}>No applications yet. Apply for an open market above.</div>
        ) : (
          <div className={styles.listingCards}>
            {listings.map(l => (
              <VirtualStall key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
