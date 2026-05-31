'use client'

import { useEffect, useState } from 'react'
import shared from '../../admin.module.css'
import styles from './sellers.module.css'
import type { Seller } from './_types'
import { FILTERS } from './_types'
import { SellerCard } from './_components/SellerCard'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'

export default function AdminSellersPage() {
  const [sellers, setSellers]   = useState<Seller[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)
  const [locationId, setLocationId] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = locationId ? `/api/sellers?locationId=${locationId}` : '/api/sellers'
    fetch(url)
      .then(r => r.json())
      .then(data => { setSellers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [locationId])

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
        <p className={shared.pageSub}>
          Review applications and verify sellers to maintain Vuna&apos;s quality standard.
        </p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}>
            {tab}{tab !== 'ALL' && ` (${sellers.filter(s => s.status === tab).length})`}
          </button>
        ))}
      </div>

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      {loading ? (
        <div className={shared.loading}>Loading sellers...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(seller => (
            <SellerCard
              key={seller.id}
              seller={seller}
              updating={updating === seller.id}
              onUpdateStatus={updateStatus}
            />
          ))}
          {filtered.length === 0 && (
            <div className={shared.empty}>No sellers in this category.</div>
          )}
        </div>
      )}
    </div>
  )
}
