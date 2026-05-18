'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { label: 'Dashboard',  href: '/seller/dashboard',  icon: '📊' },
  { label: 'My Products',href: '/seller/products',   icon: '🛍️' },
  { label: 'Add Product',href: '/seller/products/new',icon: '➕' },
  { label: 'Orders',     href: '/seller/orders',     icon: '📦' },
  { label: 'My Shop',    href: '/seller/shop',       icon: '🏪' },
  { label: 'Settings',   href: '/seller/settings',   icon: '⚙️' },
]

type SellerInfo = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  brandName?: string
  isVerified?: boolean
  role?: string
}

export default function SellerSidebar({ seller }: { seller: SellerInfo }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px', minHeight: '100vh',
      background: '#1C0A00',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0,
    }}>
      {/* Pattern strip */}
      <div style={{
        height: '5px',
        background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 8px, #D97706 8px, #D97706 16px, #14532D 16px, #14532D 24px)'
      }} />

      {/* Logo */}
      <div style={{ padding: '24px 20px 16px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#7C2D12',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#FEF3C7',
            fontFamily: 'Georgia, serif', fontWeight: '900', fontSize: '14px'
          }}>S</div>
          <span style={{ color: '#FEF3C7', fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '16px' }}>
            Soko
          </span>
        </Link>
      </div>

      {/* Seller info */}
      <div style={{
        margin: '0 16px 20px',
        padding: '14px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: '#7C2D12', borderRadius: '50%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#FEF3C7',
          fontSize: '14px', fontWeight: '600',
          marginBottom: '8px'
        }}>
          {seller?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#FEF3C7' }}>
          {seller?.brandName || seller?.name}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          marginTop: '6px', background: seller?.isVerified ? '#14532D' : '#92400E',
          padding: '2px 8px', borderRadius: '4px'
        }}>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: '500' }}>
            {seller?.isVerified ? '✅ Soko Verified' : '⏳ Pending Review'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                marginBottom: '4px', transition: 'all 0.2s',
                background: isActive ? '#7C2D12' : 'transparent',
              }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{
                  fontSize: '13px', fontWeight: isActive ? '500' : '400',
                  color: isActive ? '#FEF3C7' : '#A8A29E'
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '16px 12px 24px' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width: '100%', padding: '10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#A8A29E',
            fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px'
          }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}