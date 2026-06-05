'use client'

import { useEffect, useState } from 'react'
import shared from '../../admin.module.css'
import styles from './products.module.css'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: string
  images: string[]
  createdAt: string
  seller:   { brandName: string }
  category: { name: string }
}

const statusStyle: Record<string, { color: string; bg: string }> = {
  DRAFT:     { color: '#92400E', bg: '#FEF9C3' },
  ACTIVE:    { color: '#14532D', bg: '#DCFCE7' },
  SOLD_OUT:  { color: '#6b7280', bg: '#F3F4F6' },
  SUSPENDED: { color: '#991B1B', bg: '#FEE2E2' },
}

const FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'SOLD_OUT', 'SUSPENDED']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [updating, setUpdating]     = useState<string | null>(null)
  const [locationId, setLocationId] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = locationId ? `/api/products?locationId=${locationId}` : '/api/products'
    fetch(url)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [locationId])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const res = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    }
    setUpdating(null)
  }

  const filtered = filter === 'ALL' ? products : products.filter(p => p.status === filter)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Products</h1>
        <p className={shared.pageSub}>Review and moderate all products on the platform.</p>
      </div>

      <div className={shared.tabs}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${shared.tab} ${filter === tab ? shared.tabActive : ''}`}
          >
            {tab}{tab !== 'ALL' && ` (${products.filter(p => p.status === tab).length})`}
          </button>
        ))}
      </div>

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      {loading ? (
        <div className={shared.loading}>Loading products...</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(product => {
            const sc = statusStyle[product.status] ?? statusStyle.DRAFT
            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productRow}>
                  <div className={styles.productInfo}>
                    {product.images[0] && (
                      <img src={product.images[0]} alt={product.name} className={styles.thumb} />
                    )}
                    <div>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productMeta}>
                        {product.seller.brandName} · {product.category.name}
                      </div>
                      <div className={styles.productMeta}>
                        R{product.price.toFixed(2)} · {product.stock} in stock ·
                        Added {new Date(product.createdAt).toLocaleDateString('en-ZA')}
                      </div>
                    </div>
                  </div>

                  <div className={styles.productActions}>
                    <span
                      className={shared.badge}
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {product.status}
                    </span>
                    {product.status !== 'SUSPENDED' && (
                      <button
                        className={shared.btnDanger}
                        onClick={() => updateStatus(product.id, 'SUSPENDED')}
                        disabled={updating === product.id}
                      >
                        {updating === product.id ? '...' : 'Suspend'}
                      </button>
                    )}
                    {product.status === 'SUSPENDED' && (
                      <button
                        className={shared.btnSuccess}
                        onClick={() => updateStatus(product.id, 'ACTIVE')}
                        disabled={updating === product.id}
                      >
                        {updating === product.id ? '...' : 'Reinstate'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className={shared.empty}>No products in this category.</div>}
        </div>
      )}
    </div>
  )
}
