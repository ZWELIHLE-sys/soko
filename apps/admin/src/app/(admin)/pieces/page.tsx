'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { MapPin, Gavel, Store, Package, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './pieces.module.css'
import type { Piece, Stage, MarketOption, AuctionEventOption } from './_types'
import { STAGE_STYLE, FILTERS } from './_types'
import { AssignMarketModal } from './_components/AssignMarketModal'
import { MoveToAuctionModal } from './_components/MoveToAuctionModal'
import { MoveToShopModal } from './_components/MoveToShopModal'

type ModalKind = 'assign-market' | 'to-auction' | 'to-shop' | null

export default function AdminPiecesPage() {
  const [pieces, setPieces]   = useState<Piece[]>([])
  const [markets, setMarkets] = useState<MarketOption[]>([])
  const [events, setEvents]   = useState<AuctionEventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'ALL' | Stage>('ALL')
  const [busy, setBusy]       = useState<string | null>(null)
  const [modal, setModal]     = useState<{ kind: ModalKind; piece: Piece | null }>({ kind: null, piece: null })

  const load = useCallback(async () => {
    setLoading(true)
    const [piecesRes, metaRes] = await Promise.all([
      fetch('/api/pieces').then(r => r.json()),
      fetch('/api/pieces/meta').then(r => r.json()),
    ])
    setPieces(Array.isArray(piecesRes) ? piecesRes : [])
    setMarkets(metaRes?.markets ?? [])
    setEvents(metaRes?.auctionEvents ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const callAction = async (pieceId: string, body: Record<string, unknown>) => {
    setBusy(pieceId)
    const res = await fetch(`/api/pieces/${pieceId}/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setBusy(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Action failed.')
      return false
    }
    setModal({ kind: null, piece: null })
    await load()
    return true
  }

  const markSold = (pieceId: string) => {
    if (!confirm('Mark this piece as sold? This is final.')) return
    callAction(pieceId, { action: 'sold' })
  }

  const filtered = filter === 'ALL' ? pieces : pieces.filter(p => p.currentStage === filter)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}><Sparkles size={20} className={styles.titleIcon} /> Pieces</h1>
        <p className={shared.pageSub}>
          Track B — special pieces moving through Market → Auction → Shop. Regular shop listings are not here.
        </p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
          >
            {tab}{tab !== 'ALL' && ` (${pieces.filter(p => p.currentStage === tab).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={shared.loading}>Loading pieces...</div>
      ) : filtered.length === 0 ? (
        <div className={shared.empty}>No pieces in this stage yet.</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(piece => {
            const cfg = STAGE_STYLE[piece.currentStage]
            const isBusy = busy === piece.id
            const hasMarketListing = piece.marketListings.length > 0
            const hasAuction       = piece.auctions.length > 0
            const hasProduct       = piece.products.length > 0

            return (
              <div key={piece.id} className={styles.card}>
                <div className={styles.thumb}>
                  {piece.images[0] ? (
                    <Image src={piece.images[0]} alt={piece.title} fill sizes="104px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className={styles.thumbFallback}>{piece.category.name.charAt(0)}</span>
                  )}
                </div>

                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{piece.title}</h3>
                    <span className={shared.badge} style={{ background: cfg.bg, color: cfg.color }}>
                      <cfg.Icon size={11} /> {cfg.label}
                    </span>
                  </div>
                  <div className={styles.meta}>
                    {piece.seller.brandName}
                    {piece.seller.location && <> · <MapPin size={11} /> {piece.seller.location.name}</>}
                    {' · '}{piece.category.name}
                  </div>
                  <p className={styles.desc}>{piece.description}</p>

                  <div className={styles.journey}>
                    {hasMarketListing && (
                      <div className={styles.journeyStage}>
                        <Store size={11} /> Market: {piece.marketListings[0].market.title}
                        {piece.marketListings[0].stallNumber && ` · stall #${piece.marketListings[0].stallNumber}`}
                      </div>
                    )}
                    {hasAuction && (
                      <div className={styles.journeyStage}>
                        <Gavel size={11} /> Auction: {piece.auctions[0].auctionEvent?.title ?? '—'}
                        {' · '}{piece.auctions[0]._count.bids} bid{piece.auctions[0]._count.bids !== 1 ? 's' : ''}
                        {piece.auctions[0].currentBid && ` · R${piece.auctions[0].currentBid.toFixed(2)}`}
                      </div>
                    )}
                    {hasProduct && (
                      <div className={styles.journeyStage}>
                        <Package size={11} /> Shop: R{piece.products[0].price.toFixed(2)} · {piece.products[0].status}
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    {piece.currentStage === 'MARKET' && !hasMarketListing && (
                      <button
                        className={shared.btnSuccess}
                        disabled={isBusy}
                        onClick={() => setModal({ kind: 'assign-market', piece })}
                      >
                        <Store size={12} /> Assign to Market
                      </button>
                    )}
                    {piece.currentStage === 'MARKET' && hasMarketListing && (
                      <button
                        className={shared.btnSuccess}
                        disabled={isBusy}
                        onClick={() => setModal({ kind: 'to-auction', piece })}
                      >
                        <Gavel size={12} /> Move to Auction <ArrowRight size={11} />
                      </button>
                    )}
                    {piece.currentStage === 'AUCTION' && (
                      <>
                        <button
                          className={shared.btnSuccess}
                          disabled={isBusy}
                          onClick={() => setModal({ kind: 'to-shop', piece })}
                        >
                          <Package size={12} /> Move to Shop <ArrowRight size={11} />
                        </button>
                        <button
                          className={shared.btnSecondary}
                          disabled={isBusy}
                          onClick={() => markSold(piece.id)}
                        >
                          <CheckCircle2 size={12} /> Mark Sold (won at auction)
                        </button>
                      </>
                    )}
                    {piece.currentStage === 'SHOP' && (
                      <button
                        className={shared.btnSuccess}
                        disabled={isBusy}
                        onClick={() => markSold(piece.id)}
                      >
                        <CheckCircle2 size={12} /> Mark Sold
                      </button>
                    )}
                    {(piece.currentStage === 'SOLD' || piece.currentStage === 'RETIRED') && (
                      <span className={styles.terminalNote}>
                        <XCircle size={11} /> No further actions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal.kind === 'assign-market' && modal.piece && (
        <AssignMarketModal
          piece={modal.piece}
          markets={markets}
          onClose={() => setModal({ kind: null, piece: null })}
          onSubmit={(data) => callAction(modal.piece!.id, { action: 'assign-market', ...data })}
        />
      )}
      {modal.kind === 'to-auction' && modal.piece && (
        <MoveToAuctionModal
          piece={modal.piece}
          events={events}
          onClose={() => setModal({ kind: null, piece: null })}
          onSubmit={(data) => callAction(modal.piece!.id, { action: 'to-auction', ...data })}
        />
      )}
      {modal.kind === 'to-shop' && modal.piece && (
        <MoveToShopModal
          piece={modal.piece}
          onClose={() => setModal({ kind: null, piece: null })}
          onSubmit={(data) => callAction(modal.piece!.id, { action: 'to-shop', ...data })}
        />
      )}
    </div>
  )
}
