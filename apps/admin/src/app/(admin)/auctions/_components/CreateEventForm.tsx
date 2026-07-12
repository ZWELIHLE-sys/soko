'use client'

import shared from '../../../admin.module.css'
import styles from '../auctions.module.css'
import type { EMPTY_EVENT_FORM } from '../_types'

type FormState = typeof EMPTY_EVENT_FORM

interface Props {
  form: FormState
  saving: boolean
  error: string | null
  onFormChange: (updates: Partial<FormState>) => void
  onCreate: () => void
  onCancel: () => void
}

export function CreateEventForm({ form, saving, error, onFormChange, onCreate, onCancel }: Props) {
  return (
    <div className={`${shared.card} ${styles.createForm}`}>
      <h2 className={shared.cardTitle}>Create Auction Event</h2>
      <p className={styles.createNote}>
        You choose the dates — the journey order is what matters: pieces show at a market first
        (the viewing), then the hammer lifts here. One-of-a-kind pieces only. Set the dates below
        and sellers can submit items immediately.
      </p>
      <div className={styles.formGrid}>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Title *</label>
          <input className={shared.formInput} value={form.title}
            onChange={e => onFormChange({ title: e.target.value })}
            placeholder="e.g. Vuna Heritage Auction — 2 June 2026" />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Theme</label>
          <input className={shared.formInput} value={form.theme}
            onChange={e => onFormChange({ theme: e.target.value })}
            placeholder="e.g. Contemporary African Craft" />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Submission Deadline *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.submissionDeadline}
            onChange={e => onFormChange({ submissionDeadline: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Catalogue Opens *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.catalogueOpenDate}
            onChange={e => onFormChange({ catalogueOpenDate: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Bidding Start *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.biddingStartDate}
            onChange={e => onFormChange({ biddingStartDate: e.target.value })} />
        </div>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Bidding End (Hammer) *</label>
          <input type="datetime-local" className={shared.formInput}
            value={form.biddingEndDate}
            onChange={e => onFormChange({ biddingEndDate: e.target.value })} />
        </div>
      </div>
      <div className={shared.formGroup}>
        <label className={shared.formLabel}>Description</label>
        <textarea className={shared.formTextarea} value={form.description}
          onChange={e => onFormChange({ description: e.target.value })}
          placeholder="Tell sellers and buyers what makes this auction special..." />
      </div>
      {error && <div className={shared.errorMsg} style={{ marginBottom: 12 }}>{error}</div>}
      <div className={shared.modalActions}>
        <button className={shared.btnSecondary} onClick={onCancel}>Cancel</button>
        <button
          className={shared.btnPrimary}
          onClick={onCreate}
          disabled={saving || !form.title || !form.submissionDeadline || !form.biddingStartDate || !form.biddingEndDate}
        >
          {saving ? 'Creating...' : 'Create Auction Event'}
        </button>
      </div>
    </div>
  )
}
