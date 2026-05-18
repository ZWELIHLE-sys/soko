'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* African pattern strip */}
      <div style={{
        height: '6px',
        background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)'
      }} />

      <nav style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: '#7C2D12', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FEF3C7', fontFamily: 'Georgia, serif',
            fontWeight: '900', fontSize: '18px'
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '18px', color: '#7C2D12' }}>
              Soko
            </div>
            <div style={{ fontSize: '9px', color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase' }}>
              To The World
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {[
            { label: 'Shop', href: '/shop' },
            { label: 'Categories', href: '/categories' },
            { label: 'Sellers', href: '/sellers' },
            { label: 'About', href: '/about' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: '14px', color: '#6b7280',
              textDecoration: 'none', fontWeight: '400'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {session ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px', background: '#fff',
                  cursor: 'pointer', fontSize: '13px', color: '#374151'
                }}>
                <div style={{
                  width: '28px', height: '28px', background: '#7C2D12',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#FEF3C7', fontSize: '12px', fontWeight: '600'
                }}>
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                {session.user?.name?.split(' ')[0]}
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '44px',
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: '10px', width: '180px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 200
                }}>
                  <Link
                    href={session.user?.role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'}
                    style={{ display: 'block', padding: '10px 14px', fontSize: '13px', color: '#374151', textDecoration: 'none' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <div style={{ borderTop: '1px solid #f3f4f6' }} />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', fontSize: '13px', color: '#DC2626',
                      background: 'none', border: 'none', cursor: 'pointer'
                    }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 16px',
                border: '1.5px solid #7C2D12',
                color: '#7C2D12', borderRadius: '8px',
                fontSize: '13px', textDecoration: 'none',
                fontWeight: '500'
              }}>
                Sign In
              </Link>
              <Link href="/register/seller" style={{
                padding: '8px 16px',
                background: '#7C2D12', color: '#FEF3C7',
                borderRadius: '8px', fontSize: '13px',
                textDecoration: 'none', fontWeight: '500'
              }}>
                Start Selling
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}