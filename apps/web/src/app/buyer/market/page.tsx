'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, CalendarDays, Users, ArrowRight, MapPin } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/buyer/market')
      .then(r => r.json())
      .then(data => { setMarkets(Array.isArray(data) ? data : []); setLoading(false) })
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

  if (loading) return <div className={styles.loading}>Loading market events...</div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Vuna Market</h1>
        <p className={styles.subtitle}>
          Our monthly pop-up — African makers, handmade goods, one place.
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
            <Store size={14} /> Market Page <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {markets.map(market => {
            const upcoming = new Date(market.startDate) > new Date()
            return (
              <div key={market.id} className={styles.card}>
                <div className={styles.cardBanner}>
                  {market.theme && (
                    <span className={styles.themePill}>{market.theme}</span>
                  )}
                  {upcoming && (
                    <span className={styles.upcomingPill}>Upcoming</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{market.title}</h2>

                  <div className={styles.cardDate}>
                    <CalendarDays size={14} />
                    {formatRange(market.startDate, market.endDate)}
                  </div>

                  {market.description && (
                    <p className={styles.cardDesc}>{market.description}</p>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.stallCount}>
                      <Users size={13} />
                      {market.listings.length} confirmed seller{market.listings.length !== 1 ? 's' : ''}
                    </div>

                    {market.makerInResident && (
                      <div className={styles.mir}>
                        <MapPin size={12} />
                        Maker in Residence: <strong>{market.makerInResident.brandName}</strong>
                      </div>
                    )}

                    <Link href="/market" className={styles.viewBtn}>
                      View Market Page <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.banner}>
        <div className={styles.bannerLabel}>The Vuna Market</div>
        <h2 className={styles.bannerTitle}>Where Africa gathers every Sunday</h2>
        <p className={styles.bannerText}>
          Every Vuna Market is a curated gathering of Africa&apos;s most gifted makers.
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
