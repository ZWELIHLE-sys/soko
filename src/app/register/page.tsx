'use client'

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', flexDirection: 'column' }}>

      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '52px', height: '52px', background: '#7C2D12',
              borderRadius: '10px', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#FEF3C7', fontSize: '20px', fontWeight: '900',
              fontFamily: 'Georgia, serif', marginBottom: '12px'
            }}>S</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: '#7C2D12' }}>Join Soko</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
              Africa&apos;s own marketplace — To The World
            </div>
          </div>

          {/* Two cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Buyer card */}
            <Link href="/register/buyer" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: '16px',
                padding: '28px 20px', border: '1.5px solid #e5e7eb',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#7C2D12'
                  ;(e.currentTarget as HTMLDivElement).style.background = '#fff7ed'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
                  ;(e.currentTarget as HTMLDivElement).style.background = '#fff'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛍️</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  I want to Shop
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                  Browse and buy authentic African made products
                </div>
              </div>
            </Link>

            {/* Seller card */}
            <Link href="/register/seller" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: '16px',
                padding: '28px 20px', border: '1.5px solid #e5e7eb',
                textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#14532D'
                  ;(e.currentTarget as HTMLDivElement).style.background = '#f0fdf4'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
                  ;(e.currentTarget as HTMLDivElement).style.background = '#fff'
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤲</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  I want to Sell
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                  Sell your African made products to the world
                </div>
              </div>
            </Link>
          </div>

          {/* Sacred rules reminder */}
          <div style={{
            background: '#1C0A00', borderRadius: '12px',
            padding: '20px', marginTop: '20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#D97706', fontWeight: '500', marginBottom: '8px' }}>
              Soko&apos;s 3 Sacred Rules for Sellers
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {[
                '🌍 African owned',
                '🤲 Hand produced',
                '✅ Soko verified',
              ].map(rule => (
                <div key={rule} style={{ fontSize: '12px', color: '#FEF3C7' }}>{rule}</div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#7C2D12', fontWeight: '500', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div style={{ height: '6px', background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)' }} />
    </div>
  )
}