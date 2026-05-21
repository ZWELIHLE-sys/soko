'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { label: 'Dashboard',    href: '/admin/dashboard',  icon: '📊' },
  { label: 'Sellers',      href: '/admin/sellers',    icon: '🤲' },
  { label: 'Products',     href: '/admin/products',   icon: '🛍️' },
  { label: 'Orders',       href: '/admin/orders',     icon: '📦' },
  { label: 'Buyers',       href: '/admin/buyers',     icon: '👥' },
  { label: 'Payouts',      href: '/admin/payouts',    icon: '💰' },
  { label: 'Monitoring',   href: '/admin/monitoring', icon: '🔍' },
]

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px', minHeight: '100vh',
      background: '#0F172A',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0,
    }}>
      <div style={{
        height: '5px',
        background: 'repeating-linear-gradient(90deg,#7C2D12 0px,#7C2D12 8px,#D97706 8px,#D97706 16px,#14532D 16px,#14532D 24px)'
      }} />

      <div style={{ padding: '24px 20px 16px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#7C2D12',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#FEF3C7',
            fontFamily: 'Georgia, serif', fontWeight: '900', fontSize: '14px'
          }}>V</div>
          <div>
            <div style={{ color: '#FEF3C7', fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '15px' }}>
              Vuna Admin
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', letterSpacing: '1px' }}>
              CONTROL PANEL
            </div>
          </div>
        </Link>
      </div>

      <div style={{
        margin: '0 16px 20px', padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#F1F5F9' }}>
          {user?.name}
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
          Platform Administrator
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                background: isActive ? '#7C2D12' : 'transparent',
              }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? '500' : '400',
                  color: isActive ? '#FEF3C7' : '#94A3B8'
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 12px 24px' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width: '100%', padding: '10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#94A3B8',
            fontSize: '13px', cursor: 'pointer'
          }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}