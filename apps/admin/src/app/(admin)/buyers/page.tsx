'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './buyers.module.css'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'

interface Buyer {
  id:              string
  name:            string
  email:           string
  phone:           string | null
  avatar:          string | null
  suburb:          string | null
  status:          'ACTIVE' | 'SUSPENDED' | 'FLAGGED'
  isVerified:      boolean
  isAdminVerified: boolean
  createdAt:       string
  location:        { name: string } | null
  _count:          { orders: number; reviews: number }
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: '#DCFCE7', color: '#166534' },
  SUSPENDED: { bg: '#FEE2E2', color: '#991B1B' },
  FLAGGED:   { bg: '#FEF9C3', color: '#92400E' },
}

const FILTERS = ['ALL', 'ACTIVE', 'SUSPENDED', 'FLAGGED']

export default function AdminBuyersPage() {
  const [buyers, setBuyers]   = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('ALL')
  const [updating, setUpdating]     = useState<string | null>(null)
  const [locationId, setLocationId] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = locationId ? `/api/buyers?locationId=${locationId}` : '/api/buyers'
    fetch(url)
      .then(r => r.json())
      .then(data => { setBuyers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [locationId])

  const patchBuyer = async (id: string, patch: { status?: string; isAdminVerified?: boolean }) => {
    setUpdating(id)
    const res = await fetch(`/api/buyers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const updated = await res.json()
      setBuyers(prev => prev.map(b =>
        b.id === id ? { ...b, ...updated } : b
      ))
    }
    setUpdating(null)
  }

  const searched = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  )
  const filtered = filter === 'ALL' ? searched : searched.filter(b => b.status === filter)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Buyers</h1>
        <p className={shared.pageSub}>Manage buyer accounts — verify, suspend or flag.</p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}>
            {tab}{tab !== 'ALL' && ` (${buyers.filter(b => b.status === tab).length})`}
          </button>
        ))}
      </div>

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      <input
        className={`${shared.formInput} ${styles.searchInput}`}
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className={shared.loading}>Loading buyers...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(buyer => {
            const sc = STATUS_STYLE[buyer.status] ?? STATUS_STYLE.ACTIVE
            const busy = updating === buyer.id
            return (
              <div key={buyer.id} className={styles.buyerCard}>
                <div className={styles.avatar}>
                  {buyer.name.charAt(0).toUpperCase()}
                </div>

                <div className={styles.info}>
                  <div className={styles.name}>{buyer.name}</div>
                  <div className={styles.meta}>
                    {buyer.email}{buyer.phone ? ` · ${buyer.phone}` : ''}
                  </div>
                  {buyer.location && (
                    <div className={styles.location}>
                      <MapPin size={11} />
                      {buyer.location.name}
                      {buyer.suburb ? ` · ${buyer.suburb}` : ''}
                    </div>
                  )}
                  <div className={styles.flags}>
                    <span className={`${styles.flagTag} ${buyer.isVerified ? styles.flagVerified : styles.flagPending}`}>
                      {buyer.isVerified ? 'Email verified' : 'Email unverified'}
                    </span>
                    {buyer.isAdminVerified && (
                      <span className={`${styles.flagTag} ${styles.flagAdmin}`}>Admin verified</span>
                    )}
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.topRow}>
                    <span className={shared.badge} style={{ background: sc.bg, color: sc.color }}>
                      {buyer.status}
                    </span>
                    <div className={styles.stats}>
                      <span className={styles.statItem}>{buyer._count.orders} orders</span>
                      <span className={styles.statItem}>{buyer._count.reviews} reviews</span>
                    </div>
                  </div>
                  <div className={styles.joined}>
                    Joined {new Date(buyer.createdAt).toLocaleDateString('en-ZA')}
                  </div>
                  <div className={styles.btns}>
                    {!buyer.isAdminVerified && (
                      <button className={shared.btnSuccess} disabled={busy}
                        onClick={() => patchBuyer(buyer.id, { isAdminVerified: true })}>
                        {busy ? '...' : 'Verify'}
                      </button>
                    )}
                    {buyer.status === 'ACTIVE' && (
                      <>
                        <button className={shared.btnDanger} disabled={busy}
                          onClick={() => patchBuyer(buyer.id, { status: 'SUSPENDED' })}>
                          Suspend
                        </button>
                        <button className={`${shared.btnDanger} ${styles.btnFlag}`} disabled={busy}
                          onClick={() => patchBuyer(buyer.id, { status: 'FLAGGED' })}>
                          Flag
                        </button>
                      </>
                    )}
                    {buyer.status === 'SUSPENDED' && (
                      <button className={shared.btnSuccess} disabled={busy}
                        onClick={() => patchBuyer(buyer.id, { status: 'ACTIVE' })}>
                        {busy ? '...' : 'Reinstate'}
                      </button>
                    )}
                    {buyer.status === 'FLAGGED' && (
                      <>
                        <button className={shared.btnSuccess} disabled={busy}
                          onClick={() => patchBuyer(buyer.id, { status: 'ACTIVE' })}>
                          {busy ? '...' : 'Clear Flag'}
                        </button>
                        <button className={shared.btnDanger} disabled={busy}
                          onClick={() => patchBuyer(buyer.id, { status: 'SUSPENDED' })}>
                          Suspend
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className={shared.empty}>No buyers found.</div>}
        </div>
      )}
    </div>
  )
}
