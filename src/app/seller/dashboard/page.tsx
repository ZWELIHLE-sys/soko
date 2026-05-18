'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  revenue: number
}

export default function SellerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(r => r.json())
      .then(setStats)
  }, [])

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? '—',
      icon: '🛍️',
      color: '#7C2D12',
      bg: '#FEF3C7',
      link: '/seller/products'
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? '—',
      icon: '📦',
      color: '#14532D',
      bg: '#DCFCE7',
      link: '/seller/orders'
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? '—',
      icon: '⏳',
      color: '#92400E',
      bg: '#FEF9C3',
      link: '/seller/orders'
    },
    {
      label: 'Total Revenue',
      value: stats ? `R${stats.revenue.toFixed(2)}` : '—',
      icon: '💰',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      link: '/seller/orders'
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '26px', fontWeight: '700',
          color: '#1a1a1a', marginBottom: '6px'
        }}>
          Welcome back, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Here is what is happening with your Soko shop today.
        </p>
      </div>

      {/* Verification banner */}
      {!session?.user?.isVerified && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #D97706',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#92400E' }}>
              ⏳ Your seller application is under review
            </div>
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '3px' }}>
              We verify every seller within 24 hours. You will receive an email once approved.
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '36px'
      }}>
        {statCards.map(card => (
          <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}>
              <div style={{
                width: '44px', height: '44px',
                background: card.bg, borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px',
                marginBottom: '14px'
              }}>
                {card.icon}
              </div>
              <div style={{
                fontSize: '26px', fontWeight: '700',
                color: card.color, marginBottom: '4px',
                fontFamily: 'Georgia, serif'
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

      {/* Quick actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '16px', fontWeight: '600',
          color: '#1a1a1a', marginBottom: '14px'
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '➕ Add New Product', href: '/seller/products/new', primary: true },
            { label: '📦 View Orders', href: '/seller/orders', primary: false },
            { label: '🏪 View My Shop', href: '/seller/shop', primary: false },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '10px 20px',
                background: action.primary ? '#7C2D12' : '#fff',
                color: action.primary ? '#FEF3C7' : '#374151',
                border: action.primary ? 'none' : '1px solid #e5e7eb',
                borderRadius: '8px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}>
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started guide */}
      {stats?.totalProducts === 0 && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          padding: '28px'
        }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '18px', fontWeight: '700',
            color: '#1a1a1a', marginBottom: '20px'
          }}>
            🚀 Getting Started on Soko
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                step: '1',
                title: 'Get Soko Verified',
                desc: 'Our team reviews your application within 24 hours.',
                done: session?.user?.isVerified
              },
              {
                step: '2',
                title: 'Upload your first product',
                desc: 'Add photos, description and price for your first listing.',
                done: false
              },
              {
                step: '3',
                title: 'Share your shop',
                desc: 'Tell your community — your first sale starts with your own network.',
                done: false
              },
            ].map(item => (
              <div key={item.step} style={{
                display: 'flex', gap: '14px',
                padding: '14px',
                background: item.done ? '#f0fdf4' : '#FAFAF9',
                borderRadius: '10px',
                border: `1px solid ${item.done ? '#bbf7d0' : '#f3f4f6'}`
              }}>
                <div style={{
                  width: '32px', height: '32px', flexShrink: 0,
                  background: item.done ? '#14532D' : '#e5e7eb',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '600',
                  color: item.done ? '#fff' : '#6b7280'
                }}>
                  {item.done ? '✓' : item.step}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px', fontWeight: '500',
                    color: '#1a1a1a', marginBottom: '3px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}