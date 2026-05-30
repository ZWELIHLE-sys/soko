'use client'

import shared from '../../../admin.module.css'

interface Props {
  action: 'APPROVED' | 'REJECTED'
  note: string
  stall: string
  updating: boolean
  onNoteChange: (v: string) => void
  onStallChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function ReviewModal({ action, note, stall, updating, onNoteChange, onStallChange, onConfirm, onCancel }: Props) {
  return (
    <div className={shared.modalOverlay}>
      <div className={shared.modal}>
        <h2 className={shared.modalTitle}>
          {action === 'APPROVED' ? 'Approve Stall Application' : 'Reject Application'}
        </h2>

        {action === 'APPROVED' && (
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Stall Number</label>
            <input
              type="number"
              className={shared.formInput}
              value={stall}
              onChange={e => onStallChange(e.target.value)}
              placeholder="Assign a stall number"
            />
          </div>
        )}

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>
            Note to Seller <span style={{ color: '#9ca3af' }}>(optional)</span>
          </label>
          <textarea
            className={shared.formTextarea}
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder={action === 'APPROVED'
              ? 'e.g. Arrive by 7 AM for setup. Stall is near the entrance.'
              : 'e.g. Applications are full for this event — please apply next time.'}
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
