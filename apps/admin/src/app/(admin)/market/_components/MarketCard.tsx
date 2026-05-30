'use client'

import { ChevronDown, ChevronUp, Eye, EyeOff, Star, CalendarDays, Users } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../market.module.css'
import type { Market, MarketListing } from '../_types'
import { TYPE_LABEL, TYPE_COLOR, EVENT_STATUS_STYLE, getEventStatus } from '../_types'
import { ListingRow } from './ListingRow'

interface Props {
  market: Market
  isOpen: boolean
  listings: MarketListing[] | undefined
  togglingActive: string | null
  updatingListing: string | null
  onToggle: () => void
  onToggleActive: () => void
  onOpenMir: () => void
  onRemoveMir: () => void
  onReview: (listingId: string, action: 'APPROVED' | 'REJECTED') => void
}

export function MarketCard({
  market, isOpen, listings, togglingActive, updatingListing,
  onToggle, onToggleActive, onOpenMir, onRemoveMir, onReview,
}: Props) {
  const eventStatus = getEventStatus(market.startDate, market.endDate)
  const typeColor   = TYPE_COLOR[market.marketType]
  const statusStyle = EVENT_STATUS_STYLE[eventStatus]
  const pending     = market.listings?.length ?? 0

  return (
    <div className={`${styles.marketCard} ${!market.isActive ? styles.marketCardInactive : ''}`}>
      <div className={styles.marketHeader}>
        <div className={styles.marketHeaderLeft} onClick={onToggle} style={{ cursor: 'pointer', flex: 1 }}>
          <div className={styles.marketTitleRow}>
            <span className={shared.badge} style={{ background: typeColor.bg, color: typeColor.color }}>
              {TYPE_LABEL[market.marketType]}
            </span>
            <span className={shared.badge} style={{ background: statusStyle.bg, color: statusStyle.color }}>
              {eventStatus}
            </span>
            {!market.isActive && (
              <span className={shared.badge} style={{ background: '#FEE2E2', color: '#991B1B' }}>HIDDEN</span>
            )}
          </div>

          <div className={styles.marketTitle}>{market.title}</div>

          <div className={styles.marketMeta}>
            <CalendarDays size={12} />
            {new Date(market.startDate).toLocaleDateString('en-ZA', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            })}
            {' — '}
            {new Date(market.endDate).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            {market.theme && ` · ${market.theme}`}
          </div>

          <div className={styles.marketStats}>
            <span>
              <Users size={11} />
              {market._count.listings} application{market._count.listings !== 1 ? 's' : ''}
              {market.maxListings && ` / ${market.maxListings} max`}
            </span>
            {pending > 0 && <span className={styles.pendingTag}>{pending} pending review</span>}
          </div>

          <div className={styles.mirRow}>
            <Star size={12} color="#D97706" />
            <span className={styles.mirLabel}>Maker in Residence:</span>
            {market.makerInResident ? (
              <>
                <span className={styles.mirName}>{market.makerInResident.brandName}</span>
                <button className={styles.mirChangeBtn}
                  onClick={e => { e.stopPropagation(); onOpenMir() }}>Change</button>
                <button className={styles.mirRemoveBtn}
                  onClick={e => { e.stopPropagation(); onRemoveMir() }}>Remove</button>
              </>
            ) : (
              <button className={styles.mirAssignBtn}
                onClick={e => { e.stopPropagation(); onOpenMir() }}>Assign Seller</button>
            )}
          </div>
        </div>

        <div className={styles.marketControls}>
          <button
            className={market.isActive ? shared.btnSecondary : shared.btnSuccess}
            onClick={onToggleActive}
            disabled={togglingActive === market.id}
            title={market.isActive ? 'Hide from sellers' : 'Publish to sellers'}
          >
            {togglingActive === market.id ? '...' : market.isActive ? (
              <><EyeOff size={14} /> Hide</>
            ) : (
              <><Eye size={14} /> Publish</>
            )}
          </button>
          {isOpen
            ? <ChevronUp size={18} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => {}} />
            : <ChevronDown size={18} color="#6b7280" style={{ cursor: 'pointer' }} onClick={onToggle} />
          }
        </div>
      </div>

      {isOpen && (
        <div className={styles.listingsPanel}>
          {!listings ? (
            <div className={shared.loading}>Loading applications...</div>
          ) : listings.length === 0 ? (
            <div className={shared.empty}>No stall applications yet.</div>
          ) : (
            listings.map(listing => (
              <ListingRow
                key={listing.id}
                listing={listing}
                updating={updatingListing === listing.id}
                onReview={onReview}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
