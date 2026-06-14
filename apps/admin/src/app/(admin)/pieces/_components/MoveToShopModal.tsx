'use client'

import { useState } from 'react'
import { Package, X } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../pieces.module.css'
import type { Piece } from '../_types'

interface Props {
  piece: Piece
  onClose: () => void
  onSubmit: (data: { price: number; stock?: number }) => Promise<boolean>
}

export function MoveToShopModal({ piece, onClose, onSubmit }: Props) {
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('1')
  const [saving, setSaving] = useState(false)

  // Helpful default — last auction's high bid (rounded up) is a sensible shop start
  const lastAuction   = piece.auctions[0]
  const suggestedPrice = lastAuction?.currentBid ?? lastAuction?.startPrice ?? null

  const handle = async () => {
    if (!price) return
    setSaving(true)
    await onSubmit({
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 1,
    })
    setSaving(false)
  }

  return (
    <div className={shared.modalOverlay} onClick={() => !saving && onClose()}>
      <div className={shared.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}><Package size={16} /> Move to Shop</div>
          <button className={styles.modalClose} onClick={onClose} disabled={saving} aria-label="Close"><X size={16} /></button>
        </div>
        <div className={styles.modalPiece}>{piece.title} · {piece.seller.brandName}</div>

        {suggestedPrice && (
          <div className={styles.modalHint}>
            Suggested: <strong>R{suggestedPrice.toFixed(2)}</strong> (highest auction bid)
            <button type="button" className={styles.hintBtn} onClick={() => setPrice(String(suggestedPrice))}>
              Use this
            </button>
          </div>
        )}

        <div className={styles.modalRow}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Shop price (R)</label>
            <input className={shared.formInput} type="number" min={1} step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Stock</label>
            <input className={shared.formInput} type="number" min={1} value={stock} onChange={e => setStock(e.target.value)} />
          </div>
        </div>

        <div className={styles.modalFooterNote}>
          A new shop product will be created linked to this piece. Photos, title and description carry over from the piece.
        </div>

        <div className={shared.modalActions}>
          <button className={shared.btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={shared.btnSuccess} onClick={handle} disabled={saving || !price}>
            {saving ? 'Moving...' : 'Move to Shop'}
          </button>
        </div>
      </div>
    </div>
  )
}
