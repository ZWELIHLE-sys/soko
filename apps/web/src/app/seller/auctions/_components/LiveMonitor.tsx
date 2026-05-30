'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Award, Timer, TrendingUp } from 'lucide-react'
import styles from '../auctions.module.css'

interface Bid { id: string; amount: number; createdAt: string }

interface ItemDetail {
  id: string
  title: string
  startPrice: number
  currentBid: number | null
  status: string
  auctionEvent: { biddingEndDate: string } | null
  bids: Bid[]
  winner: { name: string } | null
  _count: { bids: number }
}

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

export function LiveMonitor({ itemId }: { itemId: string }) {
  const [detail, setDetail] = useState<ItemDetail | null>(null)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTime = detail?.auctionEvent?.biddingEndDate ?? '1970-01-01T00:00:00.000Z'
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
  const fmt = (d: string) => new Date(d).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <div className={styles.livePanel}>
      <div className={styles.liveStats}>
        <div className={styles.liveStat}>
          <span className={styles.liveStatLabel}>Current Bid</span>
          <span className={styles.liveStatValue}>R{(detail.currentBid ?? detail.startPrice).toFixed(2)}</span>
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
