'use client'

import Image from 'next/image'
import { Star, Search, X, AlertTriangle } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../featured.module.css'
import type { ProductResult } from '../_types'
import { DURATIONS, addDays } from '../_types'

interface Props {
  query: string
  results: ProductResult[]
  searching: boolean
  selected: ProductResult | null
  expiresAt: string
  note: string
  saving: boolean
  error: string
  onQueryChange: (v: string) => void
  onSelect: (p: ProductResult) => void
  onClearSelection: () => void
  onExpiresChange: (v: string) => void
  onNoteChange: (v: string) => void
  onAdd: () => void
  onClose: () => void
}

export function AddFeaturedForm({
  query, results, searching, selected, expiresAt, note, saving, error,
  onQueryChange, onSelect, onClearSelection, onExpiresChange, onNoteChange, onAdd, onClose,
}: Props) {
  return (
    <div className={`${shared.card} ${styles.addForm}`}>
      <div className={styles.addFormHeader}>
        <h2 className={shared.cardTitle}>Feature a Product</h2>
        <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
      </div>

      {error && <div className={styles.errorBanner}><AlertTriangle size={13} /> {error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Search for a product</label>
        {selected ? (
          <div className={styles.selectedProduct}>
            <div className={styles.selectedThumb}>
              {selected.images[0] ? (
                <Image src={selected.images[0]} alt={selected.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
              ) : (
                <span>{selected.category.icon}</span>
              )}
            </div>
            <div className={styles.selectedInfo}>
              <div className={styles.selectedName}>{selected.name}</div>
              <div className={styles.selectedMeta}>{selected.seller.brandName} · R{selected.price.toFixed(2)}</div>
            </div>
            <button className={styles.clearSelection} onClick={onClearSelection}><X size={14} /></button>
          </div>
        ) : (
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input className={styles.searchInput} value={query}
              onChange={e => onQueryChange(e.target.value)} placeholder="Type product name..." />
            {searching && <span className={styles.searchSpinner}>...</span>}
          </div>
        )}

        {!selected && results.length > 0 && (
          <div className={styles.dropdown}>
            {results.map(p => (
              <button key={p.id} className={styles.dropdownItem}
                onClick={() => { onSelect(p); onQueryChange('') }}>
                <div className={styles.dropThumb}>
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                  ) : (
                    <span style={{ fontSize: 18 }}>{p.category.icon}</span>
                  )}
                </div>
                <div className={styles.dropInfo}>
                  <div className={styles.dropName}>{p.name}</div>
                  <div className={styles.dropMeta}>{p.seller.brandName} · R{p.price.toFixed(2)} · {p.status}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Feature for</label>
        <div className={styles.durationRow}>
          {DURATIONS.map(d => (
            <button key={d.days}
              className={`${styles.durationBtn} ${expiresAt === addDays(d.days) ? styles.durationActive : ''}`}
              onClick={() => onExpiresChange(addDays(d.days))}>
              {d.label}
            </button>
          ))}
          <input type="date" className={styles.dateInput} value={expiresAt}
            onChange={e => onExpiresChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Admin note <span className={styles.optional}>(optional)</span></label>
        <input className={styles.input} value={note} onChange={e => onNoteChange(e.target.value)}
          placeholder="e.g. Best seller from June market — requested by seller" />
      </div>

      <div className={styles.formActions}>
        <button className={styles.featureBtn} disabled={saving || !selected} onClick={onAdd}>
          <Star size={13} /> {saving ? 'Featuring...' : 'Feature on Home Page'}
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
