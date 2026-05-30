'use client'

import styles from '../seller.module.css'
import type { Category } from '../_types'
import { CATEGORY_DESC } from '../_types'

interface Props {
  categories: Category[]
  selectedId: string
  customCategory: string
  onSelect: (id: string) => void
  onCustomChange: (value: string) => void
}

export function CategoryGrid({ categories, selectedId, customCategory, onSelect, onCustomChange }: Props) {
  return (
    <div className={styles.fieldLast}>
      <label className={styles.label}>Main category — what do you make?</label>
      <div className={styles.categoryGrid}>
        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.categoryOption} ${selectedId === c.id ? styles.categoryOptionSelected : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <span>
              <div className={styles.categoryOptionName}>{c.name}</div>
              {CATEGORY_DESC[c.slug] && (
                <div className={styles.categoryOptionDesc}>{CATEGORY_DESC[c.slug]}</div>
              )}
            </span>
          </button>
        ))}
      </div>
      {!selectedId && <input type="text" required style={{ display: 'none' }} />}
      {selectedId === 'cat-other' && (
        <input
          className={styles.input}
          type="text"
          required
          placeholder="e.g. Candle making, Soap, Pottery, Weaving..."
          value={customCategory}
          onChange={e => onCustomChange(e.target.value)}
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  )
}
