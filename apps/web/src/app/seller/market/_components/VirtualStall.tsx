'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Store, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { MarketListing } from '../_types'
import styles from '../market.module.css'

const STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:  { label: 'Under Review',   cls: styles.statusPending,  Icon: Clock        },
  APPROVED: { label: 'Stall Approved', cls: styles.statusApproved, Icon: CheckCircle2 },
  REJECTED: { label: 'Not Selected',   cls: styles.statusRejected, Icon: XCircle      },
}

export function VirtualStall({ listing }: { listing: MarketListing }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS[listing.status] ?? STATUS.PENDING
  const StatusIcon = cfg.Icon

  return (
    <div className={`${styles.listingCard} ${listing.status === 'APPROVED' ? styles.listingCardApproved : ''}`}>
      <div className={styles.listingTop}>
        <div className={styles.listingMeta}>
          <div className={styles.listingMarket}>{listing.market.title}</div>
          <div className={styles.listingDate}>
            Applied {new Date(listing.createdAt).toLocaleDateString('en-ZA', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </div>
        </div>
        <div className={styles.listingRight}>
          {listing.stallNumber && (
            <span className={styles.stallBadge}>Stall #{listing.stallNumber}</span>
          )}
          <span className={`${styles.statusBadge} ${cfg.cls}`}>
            <StatusIcon size={11} /> {cfg.label}
          </span>
        </div>
      </div>

      {listing.adminNote && (
        <div className={styles.adminNote}>Admin: {listing.adminNote}</div>
      )}

      {listing.status === 'APPROVED' && listing.products.length > 0 && (
        <>
          <button className={styles.stallToggle} onClick={() => setOpen(o => !o)}>
            <Store size={13} />
            {open ? 'Hide' : 'View'} Your Virtual Stall
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {open && (
            <div className={styles.virtualStall}>
              <div className={styles.virtualStallLabel}>Your Market Stall</div>
              {listing.sellerNote && (
                <div className={styles.stallNote}>&ldquo;{listing.sellerNote}&rdquo;</div>
              )}
              <div className={styles.stallProducts}>
                {listing.products.map(p => (
                  <div key={p.id} className={styles.stallProduct}>
                    <div className={styles.stallProductImg}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
                      ) : (
                        <div className={styles.stallProductImgFallback} />
                      )}
                      <div className={styles.debutBadge}>Market Debut</div>
                    </div>
                    <div className={styles.stallProductName}>{p.name}</div>
                    <div className={styles.stallProductPrice}>R{p.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
