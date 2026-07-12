'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Drum, Gavel, BookOpen, Gift, Store, ArrowRight, type LucideIcon } from 'lucide-react'
import { kindIcon } from './liveIcons'
import styles from './LiveBanner.module.css'

interface Announcement {
  id: string
  message: string
  link: string | null
  kind: string
  expiresAt: string | null
  createdAt: string
}

interface EventDates {
  id: string
  title: string
  startDate?: string
  endDate?: string
  catalogueOpenDate?: string
  biddingStartDate?: string
  biddingEndDate?: string
}

interface LiveData {
  announcements: Announcement[]
  nextMarket: EventDates | null
  nextAuction: EventDates | null
}

const POLL_MS = 25_000
const ROTATE_MS = 7_000
const DAY = 24 * 60 * 60 * 1000

function countdown(target: number, now: number) {
  const diff = Math.max(0, target - now)
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// The drumbeat: what the strip says when the MC is quiet, driven purely by event dates.
function getDrumbeat(
  data: LiveData,
  now: number,
): { Icon: LucideIcon; text: string; link: string; live: boolean } | null {
  const m = data.nextMarket
  if (m?.startDate && m?.endDate) {
    const start = new Date(m.startDate).getTime()
    const end = new Date(m.endDate).getTime()
    if (now >= start && now <= end) {
      return { Icon: Store, text: `The market is OPEN — ${m.title} is happening right now`, link: '/market', live: true }
    }
    if (now < start) {
      const untilStart = start - now
      if (untilStart <= 12 * 60 * 60 * 1000) {
        return { Icon: Drum, text: `${m.title} opens in ${countdown(start, now)}`, link: '/market', live: false }
      }
      if (untilStart <= 2 * DAY) {
        return { Icon: Gift, text: `${m.title} — the first 3 buyers receive a gift from our makers`, link: '/market', live: false }
      }
      if (untilStart <= 4 * DAY) {
        return { Icon: Drum, text: `Something is coming... ${m.title}`, link: '/market', live: false }
      }
    }
  }

  const a = data.nextAuction
  if (a?.biddingStartDate && a?.biddingEndDate) {
    const bidStart = new Date(a.biddingStartDate).getTime()
    const bidEnd = new Date(a.biddingEndDate).getTime()
    const catOpen = a.catalogueOpenDate ? new Date(a.catalogueOpenDate).getTime() : null
    if (now >= bidStart && now <= bidEnd) {
      return { Icon: Gavel, text: `Bidding is LIVE — ${a.title}`, link: '/auctions', live: true }
    }
    if (now < bidStart) {
      const untilBid = bidStart - now
      if (untilBid <= 12 * 60 * 60 * 1000) {
        return { Icon: Gavel, text: `${a.title} — the hammer lifts in ${countdown(bidStart, now)}`, link: '/auctions', live: false }
      }
      if (catOpen && now >= catOpen) {
        return { Icon: BookOpen, text: `The catalogue is open — preview the pieces before ${a.title}`, link: '/auctions', live: false }
      }
      if (untilBid <= 4 * DAY) {
        return { Icon: Drum, text: `Something is coming... ${a.title}`, link: '/auctions', live: false }
      }
    }
  }

  return null
}

export default function LiveBanner() {
  const [data, setData] = useState<LiveData | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const load = () =>
      fetch('/api/public/live')
        .then(r => r.json())
        .then(setData)
        .catch(() => {})
    load()
    const poll = setInterval(load, POLL_MS)
    return () => clearInterval(poll)
  }, [])

  // One shared clock: drives both the countdown tick and announcement rotation
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    const rotate = setInterval(() => setRotation(r => r + 1), ROTATE_MS)
    return () => { clearInterval(tick); clearInterval(rotate) }
  }, [])

  if (!data) return null

  // On air = not expired; expired ones stay in the day's feed, not the strip
  const onAir = (data.announcements ?? []).filter(
    a => !a.expiresAt || new Date(a.expiresAt).getTime() > now,
  )

  // MC speaks first; drumbeat carries the room between announcements
  if (onAir.length > 0) {
    const a = onAir[rotation % onAir.length]
    const Icon = kindIcon(a.kind)
    const inner = (
      <>
        <span className={styles.liveDot} />
        <span className={styles.mcTag}>LIVE</span>
        <span key={a.id} className={styles.message}>
          <Icon size={14} className={styles.msgIcon} />
          {a.message}
        </span>
      </>
    )
    return a.link ? (
      <Link href={a.link} className={`${styles.banner} ${styles.mc}`}>{inner}</Link>
    ) : (
      <div className={`${styles.banner} ${styles.mc}`}>{inner}</div>
    )
  }

  const beat = getDrumbeat(data, now)
  if (!beat) return null

  return (
    <Link href={beat.link} className={`${styles.banner} ${beat.live ? styles.mc : styles.drumbeat}`}>
      {beat.live && <span className={styles.liveDot} />}
      <span className={styles.message}>
        <beat.Icon size={14} className={styles.msgIcon} />
        {beat.text}
      </span>
      <ArrowRight size={14} className={styles.arrow} />
    </Link>
  )
}
