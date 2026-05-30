'use client'

import { Search, Star } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../market.module.css'
import type { VerifiedSeller } from '../_types'

interface Props {
  sellers: VerifiedSeller[]
  loading: boolean
  search: string
  assigning: boolean
  onSearchChange: (v: string) => void
  onAssign: (sellerId: string) => void
  onClose: () => void
}

export function MirModal({ sellers, loading, search, assigning, onSearchChange, onAssign, onClose }: Props) {
  const filtered = sellers.filter(s =>
    s.brandName.toLowerCase().includes(search.toLowerCase()) ||
    s.category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={shared.modalOverlay}>
      <div className={shared.modal}>
        <h2 className={shared.modalTitle}>Assign Maker in Residence</h2>
        <p className={styles.mirDesc}>
          The Maker in Residence is the featured seller for this market event.
          Their stall is spotlighted in MC announcements and on the market page.
        </p>

        <div className={shared.formGroup}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={`${shared.formInput} ${styles.searchInput}`}
              placeholder="Search verified sellers..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={shared.loading}>Loading sellers...</div>
        ) : (
          <div className={styles.sellerPickerList}>
            {filtered.map(s => (
              <button
                key={s.id}
                className={styles.sellerPickerRow}
                onClick={() => onAssign(s.id)}
                disabled={assigning}
              >
                <div className={styles.sellerPickerAvatar}>{s.brandName.charAt(0)}</div>
                <div className={styles.sellerPickerInfo}>
                  <div className={styles.sellerPickerName}>{s.brandName}</div>
                  <div className={styles.sellerPickerMeta}>
                    {s.category.name}
                    {s.location && ` · ${s.location.name}`}
                    {` · ${s._count.products} products`}
                  </div>
                </div>
                <Star size={14} color="#D97706" />
              </button>
            ))}
            {filtered.length === 0 && <div className={shared.empty}>No verified sellers found.</div>}
          </div>
        )}

        <div className={shared.modalActions}>
          <button className={shared.btnSecondary} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
