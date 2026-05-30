'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../market.module.css'
import type { MarketListing } from '../_types'
import { LISTING_STATUS_STYLE } from '../_types'

interface Props {
  listing: MarketListing
  updating: boolean
  onReview: (id: string, action: 'APPROVED' | 'REJECTED') => void
}

export function ListingRow({ listing, updating, onReview }: Props) {
  const sc = LISTING_STATUS_STYLE[listing.status] ?? LISTING_STATUS_STYLE.PENDING

  return (
    <div className={styles.listingRow}>
      <div className={styles.listingLeft}>
        <div className={styles.listingSeller}>{listing.seller.brandName}</div>
        <div className={styles.listingMeta}>
          {listing.seller.email} · {listing.seller._count.products} products
        </div>

        {listing.stallMessage && (
          <div className={styles.stallMessage}>&ldquo;{listing.stallMessage}&rdquo;</div>
        )}
        {listing.marketPrice != null && (
          <div className={styles.marketPriceTag}>
            Market price: R{listing.marketPrice.toFixed(2)}
          </div>
        )}
        {listing.productIds.length > 0 && (
          <div className={styles.productCount}>
            {listing.productIds.length} product{listing.productIds.length !== 1 ? 's' : ''} selected for this market
          </div>
        )}
        {listing.adminNote && (
          <div className={styles.adminNote}>Admin: {listing.adminNote}</div>
        )}
        {listing.stallNumber != null && (
          <div className={styles.stallBadge}>Stall #{listing.stallNumber}</div>
        )}
        {listing.sellerNote && (
          <div className={styles.sellerNote}>Seller note: &ldquo;{listing.sellerNote}&rdquo;</div>
        )}
      </div>

      <div className={styles.listingActions}>
        <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>
          {listing.status}
        </span>
        {listing.status === 'PENDING' && (
          <>
            <button
              className={shared.btnSuccess}
              disabled={updating}
              onClick={() => onReview(listing.id, 'APPROVED')}
            >
              <CheckCircle size={14} /> Approve
            </button>
            <button
              className={shared.btnDanger}
              disabled={updating}
              onClick={() => onReview(listing.id, 'REJECTED')}
            >
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}
