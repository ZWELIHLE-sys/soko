'use client'

import { useState } from 'react'
import { Store, X } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../pieces.module.css'
import type { Piece, MarketOption } from '../_types'

interface Props {
  piece: Piece
  markets: MarketOption[]
  onClose: () => void
  onSubmit: (data: { marketId: string; stallMessage?: string; marketPrice?: number; stallNumber?: number }) => Promise<boolean>
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AssignMarketModal({ piece, markets, onClose, onSubmit }: Props) {
  const [marketId, setMarketId]       = useState('')
  const [stallMessage, setStallMessage] = useState('')
  const [marketPrice, setMarketPrice] = useState('')
  const [stallNumber, setStallNumber] = useState('')
  const [saving, setSaving]           = useState(false)

  const handle = async () => {
    if (!marketId) return
    setSaving(true)
    await onSubmit({
      marketId,
      stallMessage: stallMessage.trim() || undefined,
      marketPrice:  marketPrice ? parseFloat(marketPrice) : undefined,
      stallNumber:  stallNumber ? parseInt(stallNumber)   : undefined,
    })
    setSaving(false)
  }

  return (
    <div className={shared.modalOverlay} onClick={() => !saving && onClose()}>
      <div className={shared.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}><Store size={16} /> Assign to Market</div>
          <button className={styles.modalClose} onClick={onClose} disabled={saving} aria-label="Close"><X size={16} /></button>
        </div>
        <div className={styles.modalPiece}>{piece.title} · {piece.seller.brandName}</div>

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Market event</label>
          {markets.length === 0 ? (
            <div className={styles.formNote}>No upcoming markets available. Create a market event first.</div>
          ) : (
            <select className={shared.formInput} value={marketId} onChange={e => setMarketId(e.target.value)}>
              <option value="">Choose a market...</option>
              {markets.map(m => (
                <option key={m.id} value={m.id}>{m.title} · {fmtDate(m.startDate)}</option>
              ))}
            </select>
          )}
        </div>

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Stall message <span className={styles.optional}>(optional)</span></label>
          <textarea
            className={shared.formTextarea}
            rows={2}
            placeholder="A short message buyers will see at this stall today..."
            value={stallMessage}
            onChange={e => setStallMessage(e.target.value)}
          />
        </div>

        <div className={styles.modalRow}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Stall number <span className={styles.optional}>(optional)</span></label>
            <input className={shared.formInput} type="number" min={1} value={stallNumber} onChange={e => setStallNumber(e.target.value)} />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Market-only price <span className={styles.optional}>(optional)</span></label>
            <input className={shared.formInput} type="number" min={0} step="0.01" placeholder="R" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} />
          </div>
        </div>

        <div className={shared.modalActions}>
          <button className={shared.btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={shared.btnSuccess} onClick={handle} disabled={saving || !marketId}>
            {saving ? 'Assigning...' : 'Assign to Market'}
          </button>
        </div>
      </div>
    </div>
  )
}
