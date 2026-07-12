'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gavel, Store, Package, CheckCircle2, XCircle, Sparkles, AlertTriangle, Plus, Star } from 'lucide-react'
import styles from './pieces.module.css'

type Stage = 'MARKET' | 'AUCTION' | 'FEATURED' | 'SHOP' | 'SOLD' | 'RETIRED'

interface Piece {
  id:           string
  title:        string
  description:  string
  images:       string[]
  currentStage: Stage
  createdAt:    string
  category: { name: string; slug: string }
  marketListings: { id: string; status: string; stallNumber: number | null; market: { id: string; title: string; startDate: string; endDate: string } }[]
  auctions:       { id: string; status: string; currentBid: number | null; startPrice: number; auctionEvent: { id: string; title: string; biddingEndDate: string } | null; _count: { bids: number } }[]
  products:       { id: string; name: string; price: number; status: string; stock: number }[]
}

const STAGE_STYLE: Record<Stage, { bg: string; color: string; label: string; Icon: React.ElementType; sub: string }> = {
  MARKET:   { bg: '#FFEDD5', color: '#9A3412', label: 'In Market',  Icon: Store,        sub: 'Currently showing at a Vuna market.' },
  AUCTION:  { bg: '#FEF9C3', color: '#92400E', label: 'In Auction', Icon: Gavel,        sub: 'Up for bidding right now. Cannot be retired during active bidding.' },
  FEATURED: { bg: '#FDE68A', color: '#7C2D12', label: 'Featured',   Icon: Star,         sub: 'On the Vuna homepage spotlight — buyable now, settles into the shop when the feature ends.' },
  SHOP:     { bg: '#D1FAE5', color: '#065F46', label: 'In Shop',    Icon: Package,      sub: 'Available for direct purchase in the shop.' },
  SOLD:     { bg: '#DCFCE7', color: '#14532D', label: 'Sold',       Icon: CheckCircle2, sub: 'This piece has been sold. Sivunile.' },
  RETIRED:  { bg: '#F3F4F6', color: '#6B7280', label: 'Retired',    Icon: XCircle,      sub: 'You retired this piece from the journey.' },
}

const CAN_RETIRE: Stage[] = ['MARKET', 'SHOP']

export default function SellerPiecesPage() {
  const [pieces, setPieces]   = useState<Piece[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<Piece | null>(null)
  const [retiring, setRetiring] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/seller/pieces')
      .then(r => r.json())
      .then(data => { setPieces(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const retire = async () => {
    if (!confirming) return
    setRetiring(true)
    setError('')
    const res = await fetch(`/api/seller/pieces/${confirming.id}/retire`, { method: 'POST' })
    setRetiring(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to retire piece.')
      return
    }
    setConfirming(null)
    load()
  }

  const counts = {
    MARKET:   pieces.filter(p => p.currentStage === 'MARKET').length,
    AUCTION:  pieces.filter(p => p.currentStage === 'AUCTION').length,
    FEATURED: pieces.filter(p => p.currentStage === 'FEATURED').length,
    SHOP:     pieces.filter(p => p.currentStage === 'SHOP').length,
    SOLD:     pieces.filter(p => p.currentStage === 'SOLD').length,
    RETIRED:  pieces.filter(p => p.currentStage === 'RETIRED').length,
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <Sparkles size={20} className={styles.titleIcon} /> My Special Pieces
          </h1>
          <p className={styles.subtitle}>
            Pieces you have entered into the Vuna journey — Market → Auction → Shop.
            Regular shop listings are managed separately under <strong>Products</strong>.
          </p>
        </div>
        <Link href="/seller/pieces/new" className={styles.submitBtn}>
          <Plus size={14} /> Submit a Special Piece
        </Link>
      </div>

      {pieces.length > 0 && (
        <div className={styles.statRow}>
          <div className={styles.stat}><Store size={12} /> {counts.MARKET} in market</div>
          <div className={styles.stat}><Gavel size={12} /> {counts.AUCTION} in auction</div>
          {counts.FEATURED > 0 && <div className={styles.stat}><Star size={12} /> {counts.FEATURED} featured</div>}
          <div className={styles.stat}><Package size={12} /> {counts.SHOP} in shop</div>
          <div className={styles.stat}><CheckCircle2 size={12} /> {counts.SOLD} sold</div>
          {counts.RETIRED > 0 && <div className={styles.stat}><XCircle size={12} /> {counts.RETIRED} retired</div>}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading your pieces...</div>
      ) : pieces.length === 0 ? (
        <div className={styles.empty}>
          <Sparkles size={40} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No special pieces yet</h2>
          <p className={styles.emptyText}>
            Submit a special piece to enter the Vuna journey — Market debut, Monday auction,
            then Shop listing if unsold. Choose pieces that deserve the spotlight.
          </p>
          <Link href="/seller/pieces/new" className={styles.emptyBtn}>
            <Plus size={14} /> Submit Your First Piece
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {pieces.map(piece => {
            const cfg = STAGE_STYLE[piece.currentStage]
            const canRetire = CAN_RETIRE.includes(piece.currentStage)
            return (
              <div key={piece.id} className={styles.card}>
                <div className={styles.thumb}>
                  {piece.images[0] ? (
                    <Image src={piece.images[0]} alt={piece.title} fill sizes="120px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className={styles.thumbFallback}>{piece.category.name.charAt(0)}</span>
                  )}
                </div>

                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.pieceTitle}>{piece.title}</h3>
                    <span className={styles.stageBadge} style={{ background: cfg.bg, color: cfg.color }}>
                      <cfg.Icon size={11} /> {cfg.label}
                    </span>
                  </div>
                  <div className={styles.category}>{piece.category.name}</div>
                  <p className={styles.stageSub}>
                    {piece.currentStage === 'MARKET' && piece.marketListings.length === 0
                      ? 'Submitted. Waiting for admin to assign your piece to a Sunday Market.'
                      : cfg.sub}
                  </p>

                  <div className={styles.journey}>
                    {piece.marketListings[0] && (
                      <div className={styles.journeyStage}>
                        <Store size={11} /> {piece.marketListings[0].market.title}
                        {piece.marketListings[0].stallNumber && ` · stall #${piece.marketListings[0].stallNumber}`}
                      </div>
                    )}
                    {piece.auctions[0] && (
                      <div className={styles.journeyStage}>
                        <Gavel size={11} /> {piece.auctions[0].auctionEvent?.title ?? 'Auction'}
                        {' · '}{piece.auctions[0]._count.bids} bid{piece.auctions[0]._count.bids !== 1 ? 's' : ''}
                        {piece.auctions[0].currentBid && ` · R${piece.auctions[0].currentBid.toFixed(2)}`}
                      </div>
                    )}
                    {piece.products[0] && (
                      <div className={styles.journeyStage}>
                        <Package size={11} /> Shop: R{piece.products[0].price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {canRetire && (
                    <div className={styles.actions}>
                      <button className={styles.retireBtn} onClick={() => setConfirming(piece)}>
                        Retire Piece
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirming && (
        <div className={styles.modalOverlay} onClick={() => !retiring && setConfirming(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}><AlertTriangle size={22} /></div>
            <h3 className={styles.modalTitle}>Retire &ldquo;{confirming.title}&rdquo;?</h3>
            <p className={styles.modalText}>
              Buyers will no longer see this piece in the market or shop. This action cannot be undone.
            </p>
            {error && <div className={styles.modalError}>{error}</div>}
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => setConfirming(null)}
                disabled={retiring}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirm}
                onClick={retire}
                disabled={retiring}
              >
                {retiring ? 'Retiring...' : 'Yes, Retire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
