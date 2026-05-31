'use client'

import { useState } from 'react'
import { MapPin, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../sellers.module.css'
import type { Seller } from '../_types'
import { STATUS_STYLE } from '../_types'
import { ProofPanel } from './ProofPanel'

interface Props {
  seller: Seller
  updating: boolean
  onUpdateStatus: (id: string, status: string) => void
}

export function SellerCard({ seller, updating, onUpdateStatus }: Props) {
  const [proofOpen, setProofOpen] = useState(false)
  const sc = STATUS_STYLE[seller.status] ?? STATUS_STYLE.REJECTED

  return (
    <div className={styles.sellerCard}>
      <div className={styles.sellerRow}>
        <div className={styles.sellerInfo}>
          <div className={styles.avatar}>{seller.brandName.charAt(0)}</div>
          <div>
            <div className={styles.brandName}>{seller.brandName}</div>
            <div className={styles.meta}>
              {seller.name} · {seller.email} · {seller.phone}
            </div>
            <div className={styles.metaIcons}>
              <span><Tag size={11} />{seller.category.name}</span>
              <span><MapPin size={11} />{seller.location.name}</span>
            </div>
            <div className={styles.counts}>
              {seller._count.products} products · {seller._count.orders} orders ·
              Joined {new Date(seller.createdAt).toLocaleDateString('en-ZA')}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>
            {seller.status}
          </span>

          <div className={styles.btns}>
            <button className={styles.proofToggleBtn} onClick={() => setProofOpen(o => !o)}>
              {proofOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {proofOpen ? 'Hide Proof' : 'Review Proof'}
            </button>

            {seller.status === 'PENDING' && (
              <>
                <button className={shared.btnSuccess} disabled={updating}
                  onClick={() => onUpdateStatus(seller.id, 'VERIFIED')}>
                  {updating ? '...' : 'Verify'}
                </button>
                <button className={shared.btnDanger} disabled={updating}
                  onClick={() => onUpdateStatus(seller.id, 'REJECTED')}>
                  Reject
                </button>
              </>
            )}
            {seller.status === 'VERIFIED' && (
              <button className={shared.btnDanger} disabled={updating}
                onClick={() => onUpdateStatus(seller.id, 'SUSPENDED')}>
                Suspend
              </button>
            )}
            {seller.status === 'SUSPENDED' && (
              <button className={shared.btnSuccess} disabled={updating}
                onClick={() => onUpdateStatus(seller.id, 'VERIFIED')}>
                Reinstate
              </button>
            )}
          </div>
        </div>
      </div>

      {proofOpen && (
        <ProofPanel
          proofUrls={seller.proofUrls}
          videoUrl={seller.videoUrl}
          socialMediaLink={seller.socialMediaLink}
          bio={seller.bio}
          customCategory={seller.customCategory}
        />
      )}
    </div>
  )
}
