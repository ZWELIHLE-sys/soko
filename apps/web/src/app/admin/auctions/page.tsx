'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Gavel, CheckCircle, XCircle, Clock, Zap, ChevronDown, ChevronUp,
} from 'lucide-react'
import styles from './admin-auctions.module.css'

interface Auction {
  id: string
  title: string
  description: string
  startPrice: number
  reservePrice: number | null
  startTime: string
  endTime: string
  status: 'PENDING' | 'APPROVED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  adminNote: string | null
  createdAt: string
  seller: { brandName: string; email: string; location: { name: string } }
  category: { name: string }
  _count: { bids: number }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

type Tab = 'PENDING' | 'APPROVED' | 'LIVE' | 'ENDED' | 'CANCELLED'

export default function AdminAuctionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [auctions, setAuctions]   = useState<Auction[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<Tab>('PENDING')
  const [actioningId, setActioningId] = useState<string | null>(null)

  const loadAuctions = useCallback(() => {
    fetch('/api/admin/auctions')
      .then(r => r.json())
      .then(data => { setAuctions(data.auctions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') { router.push('/login'); return }
    loadAuctions()
  }, [session, status, router, loadAuctions])

  const handleAction = async (auctionId: string, newStatus: 'APPROVED' | 'LIVE' | 'CANCELLED', adminNote?: string) => {
    setActioningId(auctionId)
    await fetch('/api/admin/auctions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId, status: newStatus, adminNote }),
    })
    loadAuctions()
    setActioningId(null)
  }

  if (loading || status === 'loading') {
    return <div className={styles.loading}>Loading auction management...</div>
  }

  const byStatus = (s: Tab) => auctions.filter(a => a.status === s)
  const tabCounts: Record<Tab, number> = {
    PENDING:   byStatus('PENDING').length,
    APPROVED:  byStatus('APPROVED').length,
    LIVE:      byStatus('LIVE').length,
    ENDED:     byStatus('ENDED').length,
    CANCELLED: byStatus('CANCELLED').length,
  }
  const shown = byStatus(tab)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'PENDING',   label: 'Pending' },
    { key: 'APPROVED',  label: 'Approved' },
    { key: 'LIVE',      label: 'Live' },
    { key: 'ENDED',     label: 'Ended' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Auction Management</h1>
          <p className={styles.subtitle}>{auctions.length} total auction{auctions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{tabCounts.PENDING}</span>
          <span className={styles.statLabel}>Awaiting Review</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statNum} ${styles.statGreen}`}>{tabCounts.APPROVED}</span>
          <span className={styles.statLabel}>Approved</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statNum} ${styles.statLive}`}>{tabCounts.LIVE}</span>
          <span className={styles.statLabel}>Live Now</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{tabCounts.ENDED}</span>
          <span className={styles.statLabel}>Ended</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span className={`${styles.tabCount} ${tab === t.key ? styles.tabCountActive : ''}`}>
                {tabCounts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Auction list */}
      {shown.length === 0 ? (
        <div className={styles.empty}>
          <Gavel size={36} />
          <p>No {tab.toLowerCase()} auctions.</p>
        </div>
      ) : (
        <div className={styles.auctionList}>
          {shown.map(auction => (
            <AuctionRow
              key={auction.id}
              auction={auction}
              actioning={actioningId === auction.id}
              onApprove={() => handleAction(auction.id, 'APPROVED')}
              onGoLive={() => handleAction(auction.id, 'LIVE')}
              onCancel={(note) => handleAction(auction.id, 'CANCELLED', note)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AuctionRow({
  auction, actioning, onApprove, onGoLive, onCancel,
}: {
  auction: Auction
  actioning: boolean
  onApprove: () => void
  onGoLive: () => void
  onCancel: (note: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelNote, setCancelNote] = useState('')

  const isPending  = auction.status === 'PENDING'
  const isApproved = auction.status === 'APPROVED'
  const isLive     = auction.status === 'LIVE'

  return (
    <div className={styles.auctionRow}>
      <div className={styles.auctionMain}>
        <div className={styles.auctionInfo}>
          <div className={styles.auctionTitle}>{auction.title}</div>
          <div className={styles.auctionMeta}>
            <span>{auction.seller.brandName}</span>
            <span>·</span>
            <span>{auction.seller.location.name}</span>
            <span>·</span>
            <span>{auction.category.name}</span>
            <span>·</span>
            <span>R{auction.startPrice.toFixed(2)} start</span>
          </div>
          <div className={styles.auctionDates}>
            <Clock size={11} />
            {fmtDateTime(auction.startTime)} — {fmtDateTime(auction.endTime)}
          </div>
        </div>

        <div className={styles.auctionActions}>
          <span className={`${styles.statusBadge} ${styles[`status${auction.status}`]}`}>
            {auction.status === 'LIVE' && <span className={styles.liveDot} />}
            {auction.status}
          </span>

          {isPending && (
            <button className={styles.approveBtn} onClick={onApprove} disabled={actioning}>
              <CheckCircle size={13} /> Approve
            </button>
          )}
          {isApproved && (
            <button className={styles.liveBtn} onClick={onGoLive} disabled={actioning}>
              <Zap size={13} /> Go Live
            </button>
          )}
          {(isPending || isApproved || isLive) && (
            <button className={styles.cancelBtn} onClick={() => setShowCancel(v => !v)} disabled={actioning}>
              <XCircle size={13} /> Cancel
            </button>
          )}
          <button className={styles.expandBtn} onClick={() => setExpanded(v => !v)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className={styles.auctionDetail}>
          <p className={styles.auctionDescription}>{auction.description}</p>
          <div className={styles.detailGrid}>
            <div>
              <span className={styles.detailLabel}>Reserve Price</span>
              <span className={styles.detailVal}>
                {auction.reservePrice ? `R${auction.reservePrice.toFixed(2)}` : 'None'}
              </span>
            </div>
            <div>
              <span className={styles.detailLabel}>Bids so far</span>
              <span className={styles.detailVal}>{auction._count.bids}</span>
            </div>
            <div>
              <span className={styles.detailLabel}>Submitted</span>
              <span className={styles.detailVal}>{fmtDate(auction.createdAt)}</span>
            </div>
            <div>
              <span className={styles.detailLabel}>Seller email</span>
              <span className={styles.detailVal}>{auction.seller.email}</span>
            </div>
          </div>
          {auction.adminNote && (
            <div className={styles.adminNoteRow}>
              <span className={styles.detailLabel}>Admin note:</span> {auction.adminNote}
            </div>
          )}
        </div>
      )}

      {/* Cancel form */}
      {showCancel && (
        <div className={styles.cancelForm}>
          <input
            className={styles.cancelInput}
            placeholder="Reason for cancellation (optional)"
            value={cancelNote}
            onChange={e => setCancelNote(e.target.value)}
          />
          <button
            className={styles.confirmCancelBtn}
            onClick={() => { onCancel(cancelNote); setShowCancel(false) }}
          >
            Confirm Cancel
          </button>
        </div>
      )}
    </div>
  )
}
