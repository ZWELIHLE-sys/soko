'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Clock, CheckCircle2, Calendar, Send,
  AlertTriangle, Star, Package,
} from 'lucide-react'
import type { Market, SellerProduct } from '../_types'
import styles from '../market.module.css'

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

interface Props {
  market: Market
  sellerProducts: SellerProduct[]
  onApplied: () => void
  alreadyApplied: boolean
}

export function MarketAnnouncement({ market, sellerProducts, onApplied, alreadyApplied }: Props) {
  const [open, setOpen]         = useState(false)
  const [note, setNote]         = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const countdown               = useCountdown(market.applicationDeadline)
  const deadlinePassed          = new Date(market.applicationDeadline) < new Date()
  const stallsFull              = market.maxListings ? market._count.listings >= market.maxListings : false
  const stallsLeft              = market.maxListings ? market.maxListings - market._count.listings : null

  const toggleProduct = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

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

  return (
    <div className={styles.announcementCard}>
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
          <div className={styles.countdownBadge}><Clock size={12} />{countdown}</div>
        )}
        {alreadyApplied && (
          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
            <CheckCircle2 size={11} /> Applied
          </span>
        )}
      </div>

      {market.description && <p className={styles.announcementDesc}>{market.description}</p>}

      {market.makerInResident && (
        <div className={styles.makerInResidence}>
          <div className={styles.mirLabel}><Star size={11} /> Maker in Residence</div>
          <div className={styles.mirContent}>
            <div className={styles.mirAvatar}>
              {market.makerInResident.avatar ? (
                <Image src={market.makerInResident.avatar} alt={market.makerInResident.brandName}
                  fill style={{ objectFit: 'cover' }} sizes="40px" />
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

      {!alreadyApplied && !deadlinePassed && !stallsFull && (
        <>
          {!open ? (
            <button className={styles.applyBtn} onClick={() => setOpen(true)}>
              Apply for Your Stall →
            </button>
          ) : (
            <div className={styles.applyForm}>
              <div className={styles.applyFormTitle}>Your Market Application</div>
              {error && <div className={styles.applyError}><AlertTriangle size={13} /> {error}</div>}

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
                        <button key={p.id} type="button"
                          className={`${styles.productSelectCard} ${isSelected ? styles.productSelectCardOn : ''}`}
                          onClick={() => toggleProduct(p.id)}
                        >
                          <div className={styles.productSelectImg}>
                            {p.images[0] ? (
                              <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                            ) : (
                              <div className={styles.productSelectImgFallback} />
                            )}
                            {isSelected && <div className={styles.productSelectCheck}><CheckCircle2 size={16} /></div>}
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

              <div className={styles.applySection}>
                <div className={styles.applySectionLabel}>Tell us about your market appearance</div>
                <textarea className={styles.applyTextarea} rows={3} value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="How does your work fit this market's theme? What makes these pieces special?..."
                />
              </div>

              <div className={styles.applyActions}>
                <button className={styles.submitApplyBtn}
                  disabled={submitting || selected.length === 0} onClick={handleSubmit}>
                  <Send size={13} />{submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button className={styles.cancelApplyBtn} onClick={() => { setOpen(false); setError('') }}>
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
