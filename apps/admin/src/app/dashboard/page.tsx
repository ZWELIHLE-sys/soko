'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
  }, [])

  const cards = stats ? [
    { label: 'Pending Sellers',   value: stats.sellers.pending,   icon: '⏳', color: '#92400E', bg: '#FEF9C3', link: '/admin/sellers', urgent: stats.sellers.pending > 0 },
    { label: 'Verified Sellers',  value: stats.sellers.verified,  icon: '✅', color: '#14532D', bg: '#DCFCE7', link: '/admin/sellers', urgent: false },
    { label: 'Active Products',   value: stats.products.active,   icon: '🛍️', color: '#1D4ED8', bg: '#EFF6FF', link: '/admin/products', urgent: false },
    { label: 'Total Buyers',      value: stats.buyers.total,      icon: '👥', color: '#6D28D9', bg: '#EDE9FE', link: '/admin/buyers', urgent: false },
    { label: 'Pending Orders',    value: stats.orders.pending,    icon: '📦', color: '#92400E', bg: '#FEF9C3', link: '/admin/orders', urgent: stats.orders.pending > 0 },
    { label: 'Total Revenue',     value: `R${stats.finance.totalRevenue.toFixed(2)}`, icon: '💰', color: '#14532D', bg: '#DCFCE7', link: '/admin/payouts', urgent: false },
    { label: 'Vuna Commission',   value: `R${stats.finance.vunaCommission.toFixed(2)}`, icon: '🏦', color: '#7C2D12', bg: '#FEF3C7', link: '/admin/payouts', urgent: false },
    { label: 'Total Orders',      value: stats.orders.total,      icon: '📊', color: '#374151', bg: '#F3F4F6', link: '/admin/orders', urgent: false },
  ] : []

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '26px',
          fontWeight: '700', color: '#1a1a1a', marginBottom: '6px'
        }}>
          Vuna Admin Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Platform overview — everything happening on Vuna right now.
        </p>
      </div>

      {/* Urgent alerts */}
      {stats && stats.sellers.pending > 0 && (
        <div style={{
          background: '#FEF9C3', border: '1px solid #D97706',
          borderRadius: '10px', padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
              ⚠️ {stats.sellers.pending} seller{stats.sellers.pending !== 1 ? 's' : ''} waiting for verification
            </div>
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
              Review and verify sellers to keep Vuna&apos;s quality standard high.
            </div>
          </div>
          <Link href="/admin/sellers" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px', background: '#D97706',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer'
            }}>
              Review Now →
            </button>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Loading dashboard...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '36px'
        }}>
          {cards.map(card => (
            <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                border: `1px solid ${card.urgent ? '#D97706' : '#e5e7eb'}`,
                borderRadius: '12px', padding: '20px', cursor: 'pointer'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: '12px'
                }}>
                  <div style={{
                    width: '40px', height: '40px', background: card.bg,
                    borderRadius: '10px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                  }}>
                    {card.icon}
                  </div>
                  {card.urgent && (
                    <span style={{
                      background: '#FEF9C3', color: '#92400E',
                      fontSize: '10px', fontWeight: '600',
                      padding: '2px 8px', borderRadius: '4px'
                    }}>
                      ACTION
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '24px',
                  fontWeight: '700', color: card.color, marginBottom: '4px'
                }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {card.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e5e7eb', padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '16px', fontWeight: '600',
          color: '#1a1a1a', marginBottom: '16px'
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '✅ Verify Sellers', href: '/admin/sellers', primary: true },
            { label: '📦 Manage Orders', href: '/admin/orders', primary: false },
            { label: '💰 Process Payouts', href: '/admin/payouts', primary: false },
            { label: '🔍 System Monitor', href: '/admin/monitoring', primary: false },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '10px 18px',
                background: action.primary ? '#7C2D12' : '#fff',
                color: action.primary ? '#FEF3C7' : '#374151',
                border: action.primary ? 'none' : '1px solid #e5e7eb',
                borderRadius: '8px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}>
                {action.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}