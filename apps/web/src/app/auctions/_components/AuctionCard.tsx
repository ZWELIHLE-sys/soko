import Link from 'next/link'
import Image from 'next/image'
import { Gavel, Clock, BadgeCheck, MapPin } from 'lucide-react'
import type { AuctionItem } from '../_types'
import styles from '../auctions.module.css'

function timeLabel(endDate: Date | null | undefined, status: string) {
  if (status === 'ENDED') return 'Ended'
  if (status === 'APPROVED') return 'Starting soon'
  if (!endDate) return 'In progress'
  const diff = endDate.getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`
  if (h > 0)   return `${h}h ${m}m left`
  return `${m}m left`
}

export function AuctionCard({ auction }: { auction: AuctionItem }) {
  const isLive  = auction.status === 'LIVE'
  const isEnded = auction.status === 'ENDED'
  const endDate = auction.auctionEvent?.biddingEndDate ?? null
  const label   = timeLabel(endDate, auction.status)
  const price   = auction.currentBid ?? auction.startPrice

  return (
    <Link href={`/auctions/${auction.id}`} className={styles.card}>
      <div className={styles.cardImageWrap}>
        {auction.images[0] ? (
          <Image
            src={auction.images[0]}
            alt={auction.title}
            fill
            className={styles.cardImg}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.cardImageFallback}>
            <Gavel size={32} />
          </div>
        )}
        <div className={`${styles.statusBadge} ${styles[`status${auction.status}`]}`}>
          {isLive && <span className={styles.livePulse} />}
          {isLive ? 'Live' : isEnded ? 'Ended' : 'Soon'}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardCategory}>{auction.category.name}</div>
        <div className={styles.cardTitle}>{auction.title}</div>

        <div className={styles.cardMeta}>
          <span className={styles.cardSeller}>
            {auction.seller.brandName}
            {auction.seller.isVerified && <BadgeCheck size={11} className={styles.verified} />}
          </span>
          <span className={styles.cardLocation}>
            <MapPin size={10} /> {auction.seller.location.name}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <div>
            <div className={styles.priceLabel}>
              {auction.currentBid ? 'Current bid' : 'Starting at'}
            </div>
            <div className={styles.price}>R{price.toFixed(2)}</div>
          </div>
          <div className={styles.cardRight}>
            <div className={styles.bids}>{auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}</div>
            <div className={`${styles.timeLabel} ${isLive ? styles.timeLive : ''}`}>
              <Clock size={11} /> {label}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
