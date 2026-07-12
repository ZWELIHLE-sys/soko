'use client'

import { useEffect, useState, useCallback } from 'react'
import { Radio, Star, Trophy, Clock, Phone, Mail, CircleStop } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './live.module.css'
import LiveMCComposer from '@/components/LiveMCComposer'

interface FeaturedMakerData {
  current: {
    id: string
    note: string | null
    weekStart: string
    seller: { id: string; brandName: string; avatar: string | null; bio: string | null }
  } | null
  history: { id: string; createdAt: string; seller: { id: string; brandName: string } }[]
}

interface SellerOption { id: string; brandName: string }

interface FirstThreeData {
  market: { id: string; title: string; isLive: boolean } | null
  orders: {
    id: string
    orderNumber: string
    createdAt: string
    totalAmount: number
    buyer: { name: string; email: string; phone: string | null }
    seller: { brandName: string }
  }[]
}

export default function AdminLivePage() {
  const [fm, setFm]             = useState<FeaturedMakerData | null>(null)
  const [sellers, setSellers]   = useState<SellerOption[]>([])
  const [firstThree, setFirstThree] = useState<FirstThreeData | null>(null)

  // Featured maker picker
  const [pickSeller, setPickSeller] = useState('')
  const [pickNote, setPickNote]     = useState('')
  const [settingFm, setSettingFm]   = useState(false)

  const load = useCallback(() => {
    fetch('/api/live/featured-maker').then(r => r.json()).then(setFm).catch(() => {})
    fetch('/api/live/first-three').then(r => r.json()).then(setFirstThree).catch(() => {})
    fetch('/api/sellers').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setSellers(d.filter((s: { status?: string }) => s.status === 'VERIFIED'))
    }).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const setFeatured = async () => {
    if (!pickSeller) return
    setSettingFm(true)
    await fetch('/api/live/featured-maker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: pickSeller, note: pickNote }),
    })
    setSettingFm(false)
    setPickSeller(''); setPickNote('')
    load()
  }

  const endFeatured = async () => {
    if (!confirm('Remove the current Featured Maker from the homepage?')) return
    setSettingFm(true)
    await fetch('/api/live/featured-maker', { method: 'DELETE' })
    setSettingFm(false)
    load()
  }

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>
          <Radio size={20} className={styles.titleIcon} /> Live MC
        </h1>
        <p className={shared.pageSub}>
          The control room. Pick a channel and speak — Market and Auction rooms also have their own mic
          on their management pages.
        </p>
      </div>

      {/* ── Composer (all channels) ── */}
      <LiveMCComposer />

      <div className={styles.grid}>
        {/* ── Featured Maker ── */}
        <div className={shared.card}>
          <div className={styles.cardHeader}>
            <Star size={16} className={styles.cardIcon} />
            <h2 className={shared.cardTitle}>Featured Maker of the Week</h2>
          </div>

          {fm?.current ? (
            <div className={styles.fmCurrent}>
              <div className={styles.fmAvatar}>{fm.current.seller.brandName.charAt(0)}</div>
              <div className={styles.fmDetails}>
                <div className={styles.fmName}>{fm.current.seller.brandName}</div>
                {fm.current.note && <div className={styles.fmNote}>&ldquo;{fm.current.note}&rdquo;</div>}
                <div className={styles.fmSince}>
                  Featured since {new Date(fm.current.weekStart).toLocaleDateString('en-ZA')}
                </div>
              </div>
              <button
                className={styles.endBtn}
                onClick={endFeatured}
                disabled={settingFm}
                title="Remove from homepage"
              >
                <CircleStop size={13} /> End
              </button>
            </div>
          ) : (
            <div className={styles.fmEmpty}>No featured maker set. Pick one below — they own the homepage spotlight.</div>
          )}

          <div className={styles.fmPicker}>
            <select className={shared.formInput} value={pickSeller} onChange={e => setPickSeller(e.target.value)}>
              <option value="">Choose a verified seller...</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.brandName}</option>)}
            </select>
            <input
              className={shared.formInput}
              type="text"
              placeholder="One line: why this maker, this week"
              value={pickNote}
              onChange={e => setPickNote(e.target.value)}
            />
            <button className={shared.btnSuccess} onClick={setFeatured} disabled={settingFm || !pickSeller}>
              {settingFm ? 'Setting...' : 'Set as Featured Maker'}
            </button>
          </div>

          {(fm?.history?.length ?? 0) > 0 && (
            <div className={styles.fmHistory}>
              <div className={styles.fmHistoryLabel}>Past spotlights</div>
              <div className={styles.fmHistoryChips}>
                {fm!.history.map(h => (
                  <span key={h.id} className={styles.fmChip}>{h.seller.brandName}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── First Three ── */}
        <div className={shared.card}>
          <div className={styles.cardHeader}>
            <Trophy size={16} className={styles.cardIcon} />
            <h2 className={shared.cardTitle}>
              The First Three
              {firstThree?.market && (
                <span className={styles.ftMarket}>
                  — {firstThree.market.title}
                  {firstThree.market.isLive && <span className={styles.liveBadge}><span className={styles.liveDot} /> LIVE</span>}
                </span>
              )}
            </h2>
          </div>

          {!firstThree?.market ? (
            <div className={shared.empty}>No market events yet. The first three buyers of each market day appear here.</div>
          ) : firstThree.orders.length === 0 ? (
            <div className={styles.ftWaiting}>
              <Clock size={16} />
              No orders yet for this market. The first 3 buyers will appear here the moment they order —
              contact them to arrange the welcome piece.
            </div>
          ) : (
            <div className={styles.ftGrid}>
              {firstThree.orders.map((o, i) => (
                <div key={o.id} className={styles.ftCard}>
                  <div className={styles.ftRank}>#{i + 1}</div>
                  <div className={styles.ftBuyer}>{o.buyer.name}</div>
                  <div className={styles.ftMeta}>
                    bought from {o.seller.brandName} · R{o.totalAmount.toFixed(2)} · {fmtTime(o.createdAt)}
                  </div>
                  <div className={styles.ftContacts}>
                    <a href={`mailto:${o.buyer.email}`} className={styles.ftContact}><Mail size={11} /> Email</a>
                    {o.buyer.phone && (
                      <a href={`tel:${o.buyer.phone}`} className={styles.ftContact}><Phone size={11} /> {o.buyer.phone}</a>
                    )}
                  </div>
                </div>
              ))}
              {Array.from({ length: 3 - firstThree.orders.length }).map((_, i) => (
                <div key={`empty-${i}`} className={`${styles.ftCard} ${styles.ftCardEmpty}`}>
                  <div className={styles.ftRank}>#{firstThree.orders.length + i + 1}</div>
                  <div className={styles.ftOpen}>Still open</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
