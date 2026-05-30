'use client'

import Image from 'next/image'
import { Star, Trash2, Clock } from 'lucide-react'
import styles from '../featured.module.css'
import type { FeaturedListing } from '../_types'
import { fmtDate, daysLeft } from '../_types'

interface Props {
  listing: FeaturedListing
  removing: boolean
  expired?: boolean
  onRemove: () => void
  onRefeature?: () => void
}

export function FeaturedCard({ listing, removing, expired, onRemove, onRefeature }: Props) {
  const { product: p } = listing

  return (
    <div className={`${styles.listingCard} ${expired ? styles.listingCardExpired : ''}`}>
      <div className={styles.listingThumb}>
        {p.images[0] ? (
          <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
        ) : (
          <span className={styles.thumbFallback}>{p.category.icon}</span>
        )}
      </div>
      <div className={styles.listingInfo}>
        <div className={styles.listingName}>{p.name}</div>
        <div className={styles.listingMeta}>
          {p.seller.brandName}{!expired && ` · R${p.price.toFixed(2)}`}
        </div>
        {listing.note && !expired && <div className={styles.listingNote}>{listing.note}</div>}
        <div className={`${styles.listingExpiry} ${expired ? styles.listingExpiryGrey : ''}`}>
          <Clock size={11} />
          {expired ? `Expired ${fmtDate(listing.expiresAt)}` : `Expires ${fmtDate(listing.expiresAt)} · `}
          {!expired && <strong>{daysLeft(listing.expiresAt)}</strong>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {expired && onRefeature && (
          <button className={styles.refeatureBtn} onClick={onRefeature}>
            <Star size={12} /> Re-feature
          </button>
        )}
        <button className={styles.removeBtn} disabled={removing} onClick={onRemove}>
          <Trash2 size={13} />
          {!expired && (removing ? ' Removing...' : ' Remove')}
        </button>
      </div>
    </div>
  )
}
