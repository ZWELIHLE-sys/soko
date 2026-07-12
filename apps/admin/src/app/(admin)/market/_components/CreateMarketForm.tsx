'use client'

import shared from '../../../admin.module.css'
import styles from '../market.module.css'
import type { MarketType, EMPTY_MARKET_FORM } from '../_types'
import { TYPE_LABEL, TYPE_TIMES } from '../_types'

type FormState = typeof EMPTY_MARKET_FORM

interface Props {
  form: FormState
  saving: boolean
  error: string | null
  onFormChange: (updates: Partial<FormState>) => void
  onCreate: () => void
  onCancel: () => void
}

export function CreateMarketForm({ form, saving, error, onFormChange, onCreate, onCancel }: Props) {
  return (
    <div className={`${shared.card} ${styles.createForm}`}>
      <h2 className={shared.cardTitle}>Create Market Event</h2>

      <div className={styles.typeSelector}>
        {(['SUNDAY_MARKET', 'FRIDAY_NIGHT_MARKET'] as MarketType[]).map(t => (
          <button
            key={t}
            className={`${styles.typeBtn} ${form.marketType === t ? styles.typeBtnActive : ''}`}
            onClick={() => onFormChange({ marketType: t, title: form.title || TYPE_LABEL[t] })}
          >
            <span className={styles.typeBtnLabel}>{TYPE_LABEL[t]}</span>
            <span className={styles.typeBtnTime}>{TYPE_TIMES[t]}</span>
          </button>
        ))}
      </div>

      <div className={styles.formGrid}>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Title *</label>
          <input
            className={shared.formInput}
            value={form.title}
            onChange={e => onFormChange({ title: e.target.value })}
            placeholder="e.g. Vuna Day Market — 16 August 2026"
          />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Theme</label>
          <input
            className={shared.formInput}
            value={form.theme}
            onChange={e => onFormChange({ theme: e.target.value })}
            placeholder="e.g. Heritage & Craft"
          />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Start Date & Time *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.startDate} onChange={e => onFormChange({ startDate: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>End Date & Time *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.endDate} onChange={e => onFormChange({ endDate: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Application Deadline *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.applicationDeadline}
            onChange={e => onFormChange({ applicationDeadline: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Max Stalls</label>
          <input type="number" className={shared.formInput}
            value={form.maxListings}
            onChange={e => onFormChange({ maxListings: e.target.value })}
            placeholder="Leave blank for unlimited" />
        </div>
      </div>

      <div className={shared.formGroup}>
        <label className={shared.formLabel}>Description</label>
        <textarea className={shared.formTextarea}
          value={form.description}
          onChange={e => onFormChange({ description: e.target.value })}
          placeholder="Describe this market event..." />
      </div>

      {error && <div className={shared.errorMsg} style={{ marginBottom: 12 }}>{error}</div>}

      <div className={shared.modalActions}>
        <button className={shared.btnSecondary} onClick={onCancel}>Cancel</button>
        <button
          className={shared.btnPrimary}
          onClick={onCreate}
          disabled={saving || !form.title || !form.startDate || !form.endDate || !form.applicationDeadline}
        >
          {saving ? 'Creating...' : 'Create Market'}
        </button>
      </div>
    </div>
  )
}
