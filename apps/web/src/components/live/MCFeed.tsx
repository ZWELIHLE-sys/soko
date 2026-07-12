'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, ArrowRight } from 'lucide-react'
import { kindIcon } from './liveIcons'
import styles from './MCFeed.module.css'

interface Announcement {
  id: string
  message: string
  link: string | null
  kind: string
  channel: string
  expiresAt: string | null
  createdAt: string
}

interface EventDates {
  startDate?: string
  endDate?: string
  biddingStartDate?: string
  biddingEndDate?: string
}

interface LiveData {
  announcements: Announcement[]
  nextMarket: EventDates | null
  nextAuction: EventDates | null
}

const POLL_MS = 20_000

// The MC's stage inside the venue: every moment of the day, newest first.
// Each room hears its own channel plus GLOBAL; renders nothing when there
// is no live event and nothing has been said.
export default function MCFeed({ channel }: { channel: 'MARKET' | 'AUCTION' | 'SHOP' }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const load = () =>
      fetch('/api/public/live')
        .then(r => r.json())
        .then(setData)
        .catch(() => {})
    load()
    const poll = setInterval(load, POLL_MS)
    const tick = setInterval(() => setNow(Date.now()), 30_000)
    return () => { clearInterval(poll); clearInterval(tick) }
  }, [])

  if (!data) return null

  const m = data.nextMarket
  const a = data.nextAuction
  const marketLive = !!(m?.startDate && m?.endDate &&
    now >= new Date(m.startDate).getTime() && now <= new Date(m.endDate).getTime())
  const auctionLive = !!(a?.biddingStartDate && a?.biddingEndDate &&
    now >= new Date(a.biddingStartDate).getTime() && now <= new Date(a.biddingEndDate).getTime())
  // ON AIR means THIS room's event is running, not any event on the platform.
  // The shop has no scheduled event — its feed only appears once the MC speaks to it.
  const eventLive =
    channel === 'MARKET'  ? marketLive :
    channel === 'AUCTION' ? auctionLive :
    false

  const moments = (data.announcements ?? []).filter(
    ann => ann.channel === channel || ann.channel === 'GLOBAL',
  )
  if (!eventLive && moments.length === 0) return null

  const isOnAir = (ann: Announcement) =>
    !ann.expiresAt || new Date(ann.expiresAt).getTime() > now

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <section className={styles.stage}>
      <div className={styles.header}>
        <span className={styles.headerIcon}><Radio size={15} /></span>
        <span className={styles.headerTitle}>Live from the MC</span>
        {eventLive && (
          <span className={styles.onAirBadge}>
            <span className={styles.liveDot} /> ON AIR
          </span>
        )}
      </div>

      {moments.length === 0 ? (
        <div className={styles.warmup}>
          The MC is on the floor — announcements will land here as they happen.
        </div>
      ) : (
        <div className={styles.feed}>
          {moments.map(ann => {
            const Icon = kindIcon(ann.kind)
            const live = isOnAir(ann)
            const body = (
              <>
                <span className={`${styles.momentIcon} ${live ? styles.momentIconLive : ''}`}>
                  <Icon size={14} />
                </span>
                <span className={styles.momentMsg}>{ann.message}</span>
                <span className={styles.momentTime}>{fmtTime(ann.createdAt)}</span>
                {ann.link && <ArrowRight size={13} className={styles.momentArrow} />}
              </>
            )
            return ann.link ? (
              <Link key={ann.id} href={ann.link} className={`${styles.moment} ${live ? styles.momentLive : ''}`}>
                {body}
              </Link>
            ) : (
              <div key={ann.id} className={`${styles.moment} ${live ? styles.momentLive : ''}`}>
                {body}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
