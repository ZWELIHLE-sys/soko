'use client'

import { useState } from 'react'
import { Gavel, X } from 'lucide-react'
import shared from '../../../admin.module.css'
import styles from '../pieces.module.css'
import type { Piece, AuctionEventOption } from '../_types'

interface Props {
  piece: Piece
  events: AuctionEventOption[]
  onClose: () => void
  onSubmit: (data: { auctionEventId: string; startPrice: number; reservePrice?: number; artistStatement?: string }) => Promise<boolean>
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export function MoveToAuctionModal({ piece, events, onClose, onSubmit }: Props) {
  const [auctionEventId, setAuctionEventId] = useState('')
  const [startPrice, setStartPrice]   = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [artistStatement, setArtistStatement] = useState('')
  const [saving, setSaving]           = useState(false)

  const handle = async () => {
    if (!auctionEventId || !startPrice) return
    setSaving(true)
    await onSubmit({
      auctionEventId,
      startPrice:   parseFloat(startPrice),
      reservePrice: reservePrice ? parseFloat(reservePrice) : undefined,
      artistStatement: artistStatement.trim() || undefined,
    })
    setSaving(false)
  }

  return (
    <div className={shared.modalOverlay} onClick={() => !saving && onClose()}>
      <div className={shared.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}><Gavel size={16} /> Move to Auction</div>
          <button className={styles.modalClose} onClick={onClose} disabled={saving} aria-label="Close"><X size={16} /></button>
        </div>
        <div className={styles.modalPiece}>{piece.title} · {piece.seller.brandName}</div>

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Auction event</label>
          {events.length === 0 ? (
            <div className={styles.formNote}>No upcoming auction events available. Create one first.</div>
          ) : (
            <select className={shared.formInput} value={auctionEventId} onChange={e => setAuctionEventId(e.target.value)}>
              <option value="">Choose an auction event...</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} · ends {fmtDate(e.biddingEndDate)} · {e.status}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.modalRow}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Start price (R)</label>
            <input className={shared.formInput} type="number" min={1} step="0.01" required value={startPrice} onChange={e => setStartPrice(e.target.value)} />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Reserve price <span className={styles.optional}>(optional, guidance only)</span></label>
            <input className={shared.formInput} type="number" min={0} step="0.01" value={reservePrice} onChange={e => setReservePrice(e.target.value)} />
          </div>
        </div>

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Artist statement <span className={styles.optional}>(optional, 2–3 sentences from the maker)</span></label>
          <textarea
            className={shared.formTextarea}
            rows={3}
            placeholder="The maker's words about this piece, in their voice..."
            value={artistStatement}
            onChange={e => setArtistStatement(e.target.value)}
          />
        </div>

        <div className={shared.modalActions}>
          <button className={shared.btnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={shared.btnSuccess} onClick={handle} disabled={saving || !auctionEventId || !startPrice}>
            {saving ? 'Moving...' : 'Move to Auction'}
          </button>
        </div>
      </div>
    </div>
  )
}
