'use client'

import { CheckCircle, XCircle, Eye, Trophy, ShieldAlert, MapPin, Trash2 } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../auctions.module.css'
import type { AuctionItem, EventStatus } from '../_types'
import { ITEM_STATUS_STYLE } from '../_types'

interface Props {
  item: AuctionItem
  eventStatus: EventStatus
  onReview: (id: string, action: 'APPROVED' | 'CANCELLED') => void
  onViewBids: (item: AuctionItem) => void
  onDelete: (id: string) => void
}

export function AuctionItemCard({ item, eventStatus, onReview, onViewBids, onDelete }: Props) {
  const isc        = ITEM_STATUS_STYLE[item.status] ?? ITEM_STATUS_STYLE.PENDING
  const reserveMet = item.reservePrice != null && item.currentBid != null
    && item.currentBid >= item.reservePrice

  return (
    <div className={styles.itemCard}>
      {item.images.length > 0 && (
        <div className={styles.imageThumbs}>
          {item.images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className={styles.thumb} />
          ))}
        </div>
      )}

      <div className={styles.itemBody}>
        <div className={styles.itemHeader}>
          <div>
            <div className={styles.itemTitle}>{item.title}</div>
            <div className={styles.itemMeta}>
              {item.seller.brandName} · {item.category.name}
              {item.seller.location && (
                <span className={styles.itemLocation}>
                  <MapPin size={10} /> {item.seller.location.name}
                </span>
              )}
            </div>
          </div>
          <span className={shared.badge} style={{ background: isc.bg, color: isc.color }}>
            {item.status}
          </span>
        </div>

        <div className={styles.pricingRow}>
          <span className={styles.priceTag}>Start: <strong>R{item.startPrice.toFixed(2)}</strong></span>
          {item.reservePrice != null && (
            <span className={`${styles.priceTag} ${styles.reserveTag}`}>
              <ShieldAlert size={11} />
              Reserve: R{item.reservePrice.toFixed(2)}
              <span className={styles.reserveNote}>(hidden from buyers)</span>
            </span>
          )}
        </div>

        {item.artistStatement && (
          <div className={styles.artistStatement}>&ldquo;{item.artistStatement}&rdquo;</div>
        )}

        <div className={styles.itemDesc}>
          {item.description.length > 120 ? item.description.slice(0, 120) + '...' : item.description}
        </div>

        {(item.status === 'LIVE' || (item.status === 'APPROVED' && eventStatus === 'LIVE')) && (
          <div className={styles.liveRow}>
            {item.currentBid != null ? (
              <>
                <span className={styles.currentBid}>
                  Current bid: <strong>R{item.currentBid.toFixed(2)}</strong>
                </span>
                <span className={styles.bidCount}>{item._count.bids} bid{item._count.bids !== 1 ? 's' : ''}</span>
                {item.reservePrice != null && (
                  <span className={reserveMet ? styles.reserveMet : styles.reserveNotMet}>
                    {reserveMet ? '✓ Reserve met' : '✗ Reserve not met'}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.noBids}>No bids yet</span>
            )}
            {item._count.bids > 0 && (
              <button className={styles.viewBidsBtn} onClick={() => onViewBids(item)}>
                <Eye size={12} /> View Bids
              </button>
            )}
          </div>
        )}

        {item.status === 'ENDED' && (
          <div className={styles.hammerRow}>
            <div className={styles.hammerLeft}>
              {item.winner ? (
                <>
                  <Trophy size={14} color="#D97706" />
                  <span className={styles.winnerLabel}>
                    Sold to <strong>{item.winner.name}</strong>
                    {item.winner.location && (
                      <span className={styles.winnerLocation}>
                        <MapPin size={10} /> {item.winner.location.name}
                      </span>
                    )}
                  </span>
                  <span className={styles.hammerPrice}>R{item.currentBid?.toFixed(2) ?? '—'}</span>
                  {item.reservePrice != null && (
                    <span className={reserveMet ? styles.reserveMet : styles.reserveNotMet}>
                      {reserveMet ? '✓ Reserve met' : '✗ Reserve not met'}
                    </span>
                  )}
                </>
              ) : (
                <span className={styles.noBids}>No bids — item unsold</span>
              )}
            </div>
            {item._count.bids > 0 && (
              <button className={styles.viewBidsBtn} onClick={() => onViewBids(item)}>
                <Eye size={12} /> View All Bids ({item._count.bids})
              </button>
            )}
          </div>
        )}

        {item.adminNote && (
          <div className={styles.adminNote}>Admin note: {item.adminNote}</div>
        )}

        <div className={styles.itemActions}>
          {item.status === 'PENDING' && (
            <>
              <button className={shared.btnSuccess}
                onClick={() => onReview(item.id, 'APPROVED')}>
                <CheckCircle size={14} /> Approve into Catalogue
              </button>
              <button className={shared.btnDanger}
                onClick={() => onReview(item.id, 'CANCELLED')}>
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          <button
            className={shared.btnDanger}
            onClick={() => onDelete(item.id)}
            title="Delete this auction item permanently (also clears its bids)"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
