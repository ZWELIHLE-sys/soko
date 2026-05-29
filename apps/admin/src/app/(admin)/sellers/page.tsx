'use client'

import { useEffect, useState } from 'react'
import { MapPin, Tag } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './sellers.module.css'

interface Seller {
  id: string
  name: string
  brandName: string
  email: string
  phone: string
  status: string
  isVerified: boolean
  createdAt: string
  location: { name: string }
  category: { name: string; icon: string }
  _count: { products: number; orders: number }
}

const statusStyle: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#92400E', bg: '#FEF9C3' },
  VERIFIED:  { color: '#14532D', bg: '#DCFCE7' },
  SUSPENDED: { color: '#991B1B', bg: '#FEE2E2' },
  REJECTED:  { color: '#374151', bg: '#F3F4F6' },
}

const FILTERS = ['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED']

export default function AdminSellersPage() {
  const [sellers, setSellers]   = useState<Seller[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sellers')
      .then(r => r.json())
      .then(data => { setSellers(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const res = await fetch(`/api/sellers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setSellers(prev => prev.map(s =>
        s.id === id ? { ...s, status, isVerified: status === 'VERIFIED' } : s
      ))
    }
    setUpdating(null)
  }

  const filtered = filter === 'ALL' ? sellers : sellers.filter(s => s.status === filter)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Seller Management</h1>
        <p className={shared.pageSub}>Review and verify sellers to maintain Vuna&apos;s quality standard.</p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
          >
            {tab}{tab !== 'ALL' && ` (${sellers.filter(s => s.status === tab).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={shared.loading}>Loading sellers...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(seller => {
            const sc = statusStyle[seller.status] ?? statusStyle.REJECTED
            return (
              <div key={seller.id} className={styles.sellerCard}>
                <div className={styles.sellerRow}>
                  <div className={styles.sellerInfo}>
                    <div className={styles.avatar}>
                      {seller.brandName.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.brandName}>{seller.brandName}</div>
                      <div className={styles.meta}>
                        {seller.name} · {seller.email} · {seller.phone}
                      </div>
                      <div className={styles.metaIcons}>
                        <span><Tag size={11} />{seller.category.name}</span>
                        <span><MapPin size={11} />{seller.location.name}</span>
                      </div>
                      <div className={styles.counts}>
                        {seller._count.products} products · {seller._count.orders} orders ·
                        Joined {new Date(seller.createdAt).toLocaleDateString('en-ZA')}
                      </div>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <span
                      className={shared.badge}
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {seller.status}
                    </span>

                    <div className={styles.btns}>
                      {seller.status === 'PENDING' && (
                        <>
                          <button
                            className={shared.btnSuccess}
                            onClick={() => updateStatus(seller.id, 'VERIFIED')}
                            disabled={updating === seller.id}
                          >
                            {updating === seller.id ? '...' : 'Verify'}
                          </button>
                          <button
                            className={shared.btnDanger}
                            onClick={() => updateStatus(seller.id, 'REJECTED')}
                            disabled={updating === seller.id}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {seller.status === 'VERIFIED' && (
                        <button
                          className={shared.btnDanger}
                          onClick={() => updateStatus(seller.id, 'SUSPENDED')}
                          disabled={updating === seller.id}
                        >
                          Suspend
                        </button>
                      )}
                      {seller.status === 'SUSPENDED' && (
                        <button
                          className={shared.btnSuccess}
                          onClick={() => updateStatus(seller.id, 'VERIFIED')}
                          disabled={updating === seller.id}
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className={shared.empty}>No sellers in this category.</div>
          )}
        </div>
      )}
    </div>
  )
}
