'use client'

import shared from '../../../admin.module.css'
import styles from '../auctions.module.css'

interface Props {
  action: 'APPROVED' | 'CANCELLED'
  note: string
  updating: boolean
  onNoteChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function ItemReviewModal({ action, note, updating, onNoteChange, onConfirm, onCancel }: Props) {
  return (
    <div className={shared.modalOverlay}>
      <div className={shared.modal}>
        <h2 className={shared.modalTitle}>
          {action === 'APPROVED' ? 'Approve Item into Catalogue' : 'Reject Item'}
        </h2>
        <p className={styles.modalNote}>
          {action === 'APPROVED'
            ? 'This item will appear in the catalogue when the event moves to Catalogue Open. Buyers can preview it before bidding opens.'
            : 'The seller will be notified. Provide a reason so they can improve for the next event.'}
        </p>
        <div className={shared.formGroup}>
          <label className={shared.formLabel}>
            Note to Seller <span style={{ color: '#9ca3af' }}>(optional)</span>
          </label>
          <textarea
            className={shared.formTextarea}
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder={action === 'APPROVED'
              ? 'e.g. Approved — please ensure all photos are high resolution before bidding opens.'
              : 'e.g. This item does not meet the one-of-a-kind requirement. Mass-produced items cannot be listed.'}
          />
        </div>
        <div className={shared.modalActions}>
          <button className={shared.btnSecondary} onClick={onCancel}>Cancel</button>
          <button
            className={action === 'APPROVED' ? shared.btnSuccess : shared.btnDanger}
            onClick={onConfirm}
            disabled={updating}
          >
            {updating ? 'Saving...' : action === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  )
}
