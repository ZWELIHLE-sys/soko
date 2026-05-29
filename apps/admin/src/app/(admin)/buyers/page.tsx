'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './buyers.module.css'

interface Buyer {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  createdAt: string
  location: { name: string } | null
  _count: { orders: number; reviews: number }
}

export default function AdminBuyersPage() {
  const [buyers, setBuyers]   = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetch('/api/buyers')
      .then(r => r.json())
      .then(data => { setBuyers(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Buyers</h1>
        <p className={shared.pageSub}>All registered buyers on the platform.</p>
      </div>

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
          {filtered.map(buyer => (
            <div key={buyer.id} className={styles.buyerCard}>
              <div className={styles.avatar}>
                {buyer.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{buyer.name}</div>
                <div className={styles.meta}>{buyer.email}{buyer.phone ? ` · ${buyer.phone}` : ''}</div>
                {buyer.location && (
                  <div className={styles.location}>
                    <MapPin size={11} />{buyer.location.name}
                  </div>
                )}
              </div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statVal}>{buyer._count.orders}</span>
                  <span className={styles.statLbl}>orders</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statVal}>{buyer._count.reviews}</span>
                  <span className={styles.statLbl}>reviews</span>
                </div>
                <div className={styles.joined}>
                  Joined {new Date(buyer.createdAt).toLocaleDateString('en-ZA')}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className={shared.empty}>No buyers found.</div>}
        </div>
      )}
    </div>
  )
}
