'use client'

import { Trophy } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../auctions.module.css'
import type { Bid } from '../_types'
import { fmtTime } from '../_types'

interface Props {
  title: string
  bids: Bid[]
  loading: boolean
  onClose: () => void
}

export function BidHistoryModal({ title, bids, loading, onClose }: Props) {
  return (
    <div className={shared.modalOverlay}>
      <div className={shared.modal}>
        <h2 className={shared.modalTitle}>Bid History — {title}</h2>

        {loading ? (
          <div className={shared.loading}>Loading bids...</div>
        ) : bids.length === 0 ? (
          <div className={shared.empty}>No bids placed yet.</div>
        ) : (
          <div className={styles.bidsList}>
            {bids.map((bid, i) => (
              <div key={bid.id} className={`${styles.bidRow} ${i === 0 ? styles.bidRowTop : ''}`}>
                <div className={styles.bidLeft}>
                  {i === 0 && <Trophy size={13} color="#D97706" />}
                  <span className={styles.bidder}>{bid.bidder.name}</span>
                </div>
                <div className={styles.bidRight}>
                  <span className={`${styles.bidAmount} ${i === 0 ? styles.bidAmountTop : ''}`}>
                    R{bid.amount.toFixed(2)}
                  </span>
                  <span className={styles.bidTime}>{fmtTime(bid.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={shared.modalActions}>
          <button className={shared.btnPrimary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
