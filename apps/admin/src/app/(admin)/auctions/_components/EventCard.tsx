'use client'

import { ChevronDown, ChevronUp, Gavel } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../auctions.module.css'
import type { AuctionEvent, AuctionItem, EventStatus } from '../_types'
import { EVENT_STATUS_STYLE, STATUS_TRANSITIONS, fmt } from '../_types'
import { AuctionItemCard } from './AuctionItemCard'

interface Props {
  event: AuctionEvent
  isOpen: boolean
  items: AuctionItem[] | undefined
  transitioning: string | null
  onToggle: () => void
  onTransition: (next: EventStatus) => void
  onReview: (id: string, action: 'APPROVED' | 'CANCELLED') => void
  onViewBids: (item: AuctionItem) => void
}

export function EventCard({
  event, isOpen, items, transitioning, onToggle, onTransition, onReview, onViewBids,
}: Props) {
  const sc         = EVENT_STATUS_STYLE[event.status]
  const transition = STATUS_TRANSITIONS[event.status]
  const pending    = event.items?.length ?? 0

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <div className={styles.eventHeaderLeft} onClick={onToggle}>
          <div style={{ flex: 1 }}>
            <div className={styles.eventTitleRow}>
              <Gavel size={16} color="#7C2D12" />
              <span className={styles.eventTitle}>{event.title}</span>
              <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            {event.theme && <div className={styles.eventTheme}>Theme: {event.theme}</div>}

            <div className={styles.pipeline}>
              <div className={`${styles.pipeStep} ${new Date() > new Date(event.submissionDeadline) ? styles.pipeStepDone : ''}`}>
                <span className={styles.pipeLabel}>Submissions close</span>
                <span className={styles.pipeDate}>{fmt(event.submissionDeadline)}</span>
              </div>
              <div className={styles.pipeDivider} />
              <div className={`${styles.pipeStep} ${new Date() > new Date(event.catalogueOpenDate) ? styles.pipeStepDone : ''}`}>
                <span className={styles.pipeLabel}>Catalogue opens</span>
                <span className={styles.pipeDate}>{fmt(event.catalogueOpenDate)}</span>
              </div>
              <div className={styles.pipeDivider} />
              <div className={`${styles.pipeStep} ${new Date() > new Date(event.biddingStartDate) ? styles.pipeStepDone : ''}`}>
                <span className={styles.pipeLabel}>Bidding starts</span>
                <span className={styles.pipeDate}>{fmt(event.biddingStartDate)}</span>
              </div>
              <div className={styles.pipeDivider} />
              <div className={`${styles.pipeStep} ${new Date() > new Date(event.biddingEndDate) ? styles.pipeStepDone : ''}`}>
                <span className={styles.pipeLabel}>Hammer falls</span>
                <span className={styles.pipeDate}>{fmt(event.biddingEndDate)}</span>
              </div>
            </div>

            <div className={styles.eventStats}>
              <span>{event._count.items} item{event._count.items !== 1 ? 's' : ''} submitted</span>
              {pending > 0 && <span className={styles.pendingTag}>{pending} pending review</span>}
            </div>
          </div>
          {isOpen ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
        </div>

        {transition && (
          <div className={styles.eventControls}>
            <button
              className={shared.btnPrimary}
              onClick={() => onTransition(transition.next)}
              disabled={transitioning === event.id}
            >
              <Gavel size={13} />
              {transitioning === event.id ? '...' : transition.label}
            </button>
          </div>
        )}
        {event.status === 'ENDED' && (
          <div className={styles.endedBadge}><Gavel size={14} /> Auction Complete</div>
        )}
      </div>

      {isOpen && (
        <div className={styles.itemsPanel}>
          {!items ? (
            <div className={shared.loading}>Loading items...</div>
          ) : items.length === 0 ? (
            <div className={shared.empty}>No items submitted yet.</div>
          ) : (
            items.map(item => (
              <AuctionItemCard
                key={item.id}
                item={item}
                eventStatus={event.status}
                onReview={onReview}
                onViewBids={onViewBids}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
