'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, ArrowRight, Sunset } from 'lucide-react'
import { kindIcon } from './liveIcons'
import styles from './MCFeed.module.css'

interface Announcement {
  id: string
  message: string
  link: string | null
  kind: string
  channel: string
  marketId: string | null
  auctionEventId: string | null
  expiresAt: string | null
  createdAt: string
}

interface EventDates {
  id: string
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

// The MC's stage inside the venue. Market and auction feeds are anchored to the
// ACTUAL event the page is showing — only that event's announcements appear,
// and after the event ends the room shows its formal close until the closing
// window passes. The shop room hears the SHOP channel (no event structure).
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

  // This room's event and its life state
  let eventLive = false
  let eventClosed = false
  let moments: Announcement[] = []

  if (channel === 'MARKET') {
    if (!m) return null
    moments = (data.announcements ?? []).filter(ann => ann.marketId === m.id)
    if (m.startDate && m.endDate) {
      const start = new Date(m.startDate).getTime()
      const end = new Date(m.endDate).getTime()
      eventLive = now >= start && now <= end
      eventClosed = now > end
    }
  } else if (channel === 'AUCTION') {
    if (!a) return null
    moments = (data.announcements ?? []).filter(ann => ann.auctionEventId === a.id)
    if (a.biddingStartDate && a.biddingEndDate) {
      const start = new Date(a.biddingStartDate).getTime()
      const end = new Date(a.biddingEndDate).getTime()
      eventLive = now >= start && now <= end
      eventClosed = now > end
    }
  } else {
    moments = (data.announcements ?? []).filter(ann => ann.channel === 'SHOP')
  }

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
        {eventClosed && (
          <span className={styles.closedBadge}>
            <Sunset size={11} /> EVENT CLOSED
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
