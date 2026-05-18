import Link from 'next/link'

const links = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'New Arrivals', href: '/shop?sort=new' },
    { label: 'Verified Sellers', href: '/sellers' },
  ],
  Sell: [
    { label: 'Start Selling', href: '/register/seller' },
    { label: 'Seller Rules', href: '/seller-rules' },
    { label: 'Soko Verified', href: '/verified' },
    { label: 'Seller Login', href: '/login' },
  ],
  Company: [
    { label: 'About Soko', href: '/about' },
    { label: 'Our Mission', href: '/mission' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Umzila-AfriRoute', href: '/company' },
  ],
}

export default function Footer() {
  return (
    <>
      {/* Pre-footer seller strip */}
      <div style={{
        background: '#1C0A00',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        flexWrap: 'wrap'
      }}>
        {[
          { icon: '🌍', text: 'African owned' },
          { icon: '🤲', text: 'Hand produced' },
          { icon: '✅', text: 'Soko verified' },
          { icon: '🚚', text: 'SA delivery' },
          { icon: '🌱', text: 'Ground level first' },
        ].map(item => (
          <div key={item.text} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', color: '#FDE68A'
          }}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <footer style={{
        background: '#fff',
        padding: '48px 32px 24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '32px', marginBottom: '40px'
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', marginBottom: '14px'
            }}>
              <div style={{
                width: '36px', height: '36px', background: '#7C2D12',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#FEF3C7',
                fontFamily: 'Georgia, serif', fontWeight: '900', fontSize: '16px'
              }}>S</div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '18px', fontWeight: '700', color: '#7C2D12'
              }}>Soko</div>
            </div>
            <p style={{
              fontSize: '13px', color: '#6b7280',
              lineHeight: '1.7', maxWidth: '240px'
            }}>
              Africa&apos;s own marketplace. Every product African made,
              African owned, and sold to the world.
            </p>
            <div style={{
              marginTop: '16px',
              fontSize: '11px', color: '#9ca3af',
              letterSpacing: '1px'
            }}>
              An Umzila-AfriRoute platform
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <div style={{
                fontSize: '12px', fontWeight: '600',
                color: '#1a1a1a', textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: '14px'
              }}>
                {title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => (
                  <Link key={item.href} href={item.href} style={{
                    fontSize: '13px', color: '#6b7280',
                    textDecoration: 'none'
                  }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid #f3f4f6',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            © 2026 Soko — Umzila-AfriRoute (Pty) Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
              <Link key={item} href="#" style={{
                fontSize: '12px', color: '#9ca3af', textDecoration: 'none'
              }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Bottom African pattern */}
      <div style={{
        height: '6px',
        background: 'repeating-linear-gradient(90deg, #7C2D12 0px, #7C2D12 12px, #D97706 12px, #D97706 24px, #14532D 24px, #14532D 36px, #C2410C 36px, #C2410C 48px)'
      }} />
    </>
  )
}