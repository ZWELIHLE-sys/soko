'use client'

import { useEffect, useState } from 'react'

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

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#92400E', bg: '#FEF9C3' },
  VERIFIED:  { color: '#14532D', bg: '#DCFCE7' },
  SUSPENDED: { color: '#991B1B', bg: '#FEE2E2' },
  REJECTED:  { color: '#374151', bg: '#F3F4F6' },
}

export default function AdminSellersPage() {
  const [sellers, setSellers]   = useState<Seller[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/sellers')
      .then(r => r.json())
      .then(data => { setSellers(data); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const res = await fetch(`/api/admin/sellers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      setSellers(prev => prev.map(s =>
        s.id === id ? { ...s, status, isVerified: status === 'VERIFIED' } : s
      ))
    }
    setUpdating(null)
  }

  const filtered = filter === 'ALL'
    ? sellers
    : sellers.filter(s => s.status === filter)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '26px',
          fontWeight: '700', color: '#1a1a1a', marginBottom: '6px'
        }}>
          Seller Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Review and verify sellers to maintain Vuna&apos;s quality standard.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '7px 16px', borderRadius: '6px',
              border: '1px solid #e5e7eb', fontSize: '12px',
              fontWeight: '500', cursor: 'pointer',
              background: filter === tab ? '#7C2D12' : '#fff',
              color: filter === tab ? '#FEF3C7' : '#6b7280'
            }}>
            {tab} {tab !== 'ALL' && `(${sellers.filter(s => s.status === tab).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading sellers...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(seller => (
            <div key={seller.id} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '14px', padding: '20px'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'
              }}>
                {/* Seller info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', background: '#7C2D12',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#FEF3C7',
                    fontSize: '18px', fontWeight: '700',
                    fontFamily: 'Georgia, serif', flexShrink: 0
                  }}>
                    {seller.brandName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '3px' }}>
                      {seller.brandName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                      {seller.name} · {seller.email} · {seller.phone}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {seller.category.icon} {seller.category.name} · 📍 {seller.location.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                      {seller._count.products} products · {seller._count.orders} orders ·
                      Joined {new Date(seller.createdAt).toLocaleDateString('en-ZA')}
                    </div>
                  </div>
                </div>

                {/* Status and actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '500',
                    background: statusConfig[seller.status]?.bg,
                    color: statusConfig[seller.status]?.color
                  }}>
                    {seller.status}
                  </span>

                  {seller.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateStatus(seller.id, 'VERIFIED')}
                        disabled={updating === seller.id}
                        style={{
                          padding: '7px 14px', background: '#14532D',
                          color: '#fff', border: 'none', borderRadius: '6px',
                          fontSize: '12px', fontWeight: '500',
                          cursor: updating === seller.id ? 'not-allowed' : 'pointer'
                        }}>
                        {updating === seller.id ? '...' : '✅ Verify'}
                      </button>
                      <button
                        onClick={() => updateStatus(seller.id, 'REJECTED')}
                        disabled={updating === seller.id}
                        style={{
                          padding: '7px 14px', background: '#fff',
                          color: '#DC2626', border: '1px solid #FECACA',
                          borderRadius: '6px', fontSize: '12px',
                          cursor: updating === seller.id ? 'not-allowed' : 'pointer'
                        }}>
                        Reject
                      </button>
                    </div>
                  )}

                  {seller.status === 'VERIFIED' && (
                    <button
                      onClick={() => updateStatus(seller.id, 'SUSPENDED')}
                      disabled={updating === seller.id}
                      style={{
                        padding: '7px 14px', background: '#fff',
                        color: '#DC2626', border: '1px solid #FECACA',
                        borderRadius: '6px', fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                      Suspend
                    </button>
                  )}

                  {seller.status === 'SUSPENDED' && (
                    <button
                      onClick={() => updateStatus(seller.id, 'VERIFIED')}
                      disabled={updating === seller.id}
                      style={{
                        padding: '7px 14px', background: '#14532D',
                        color: '#fff', border: 'none',
                        borderRadius: '6px', fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px',
              color: '#9ca3af', fontSize: '14px'
            }}>
              No sellers in this category.
            </div>
          )}
        </div>
      )}
    </div>
  )
}