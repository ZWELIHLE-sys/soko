'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, CalendarDays, Users, ArrowRight, MapPin, Clock } from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'
import styles from './market.module.css'

interface MarketEvent {
  id: string
  title: string
  description: string | null
  theme: string | null
  startDate: string
  endDate: string
  applicationDeadline: string
  bannerImage: string | null
  makerInResident: { brandName: string; avatar: string | null; bio: string | null } | null
  listings: { id: string }[]
}

export default function BuyerMarketPage() {
  const [markets, setMarkets] = useState<MarketEvent[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/buyer/market')
      .then(r => r.json())
      .then(data => { setMarkets(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const formatRange = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
    if (s.getFullYear() !== e.getFullYear()) {
      return `${s.toLocaleDateString('en-ZA', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('en-ZA', { ...opts, year: 'numeric' })}`
    }
    return `${s.toLocaleDateString('en-ZA', opts)} – ${e.toLocaleDateString('en-ZA', { ...opts, year: 'numeric' })}`
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return <PageLoader text="Loading market events..." />

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Vuna Market</h1>
        <p className={styles.subtitle}>
          Our weekly pop-up — local makers, growers and builders, one place.
        </p>
      </div>

      {markets.length === 0 ? (
        <div className={styles.empty}>
          <Store size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No upcoming markets yet</h2>
          <p className={styles.emptyText}>
            Market dates are announced here when confirmed. Check back soon — the next event is being planned.
          </p>
          <Link href="/market" className={styles.emptyBtn}>
            <Store size={14} /> Explore the Market Page
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {markets.map(market => {
            const now = new Date()
            const start = new Date(market.startDate)
            const end   = new Date(market.endDate)
            const isLive     = now >= start && now <= end
            const isUpcoming = now < start
            const isPast     = now > end

            return (
              <div key={market.id} className={`${styles.card} ${isLive ? styles.cardLive : ''}`}>
                {/* Banner */}
                <div className={styles.cardBanner}>
                  <div className={styles.bannerPills}>
                    {isLive     && <span className={styles.pillLive}>🟢 Live Now</span>}
                    {isUpcoming && <span className={styles.pillUpcoming}>Upcoming</span>}
                    {isPast     && <span className={styles.pillPast}>Past Event</span>}
                    {market.theme && <span className={styles.pillTheme}>{market.theme}</span>}
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{market.title}</h2>

                  <div className={styles.cardDate}>
                    <CalendarDays size={14} />
                    {formatRange(market.startDate, market.endDate)}
                  </div>

                  {isUpcoming && (
                    <div className={styles.deadlineRow}>
                      <Clock size={12} />
                      Seller applications close {fmtDate(market.applicationDeadline)}
                    </div>
                  )}

                  {market.description && (
                    <p className={styles.cardDesc}>{market.description}</p>
                  )}

                  {market.makerInResident && (
                    <div className={styles.mir}>
                      <MapPin size={12} />
                      Maker in Residence: <strong>{market.makerInResident.brandName}</strong>
                      {market.makerInResident.bio && (
                        <span className={styles.mirBio}> — {market.makerInResident.bio}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.stallCount}>
                      <Users size={13} />
                      {market.listings.length} confirmed seller{market.listings.length !== 1 ? 's' : ''}
                    </div>

                    <div className={styles.cardActions}>
                      <Link href="/market" className={styles.viewBtn}>
                        {isLive ? 'See Live Market' : isUpcoming ? 'Preview Sellers' : 'View Event'}
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom promo banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLabel}>The Vuna Market</div>
        <h2 className={styles.bannerTitle}>Where home gathers</h2>
        <p className={styles.bannerText}>
          Every Vuna Market is a curated gathering of our most gifted local makers.
          Meet the weavers, potters, designers, and farmers behind the products —
          and buy directly from the source.
        </p>
        <Link href="/market" className={styles.bannerLink}>
          Browse the Market <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
