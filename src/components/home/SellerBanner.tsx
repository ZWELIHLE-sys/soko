import Link from 'next/link'

export default function SellerBanner() {
  return (
    <section style={{
      background: '#7C2D12',
      padding: '60px 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px', flexWrap: 'wrap'
    }}>
      <div style={{ maxWidth: '560px' }}>
        <div style={{
          fontSize: '11px', color: '#D97706',
          letterSpacing: '3px', textTransform: 'uppercase',
          marginBottom: '12px', fontWeight: '600'
        }}>
          For African Creators
        </div>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '32px', fontWeight: '700',
          color: '#FEF3C7', marginBottom: '14px', lineHeight: '1.2'
        }}>
          Your craft deserves<br />the whole world
        </h2>
        <p style={{
          fontSize: '15px', color: '#FDE68A',
          lineHeight: '1.8', marginBottom: '0'
        }}>
          Join Soko and sell your clothing, art, food, furniture or any
          African made product to buyers across South Africa and beyond.
          Apply for your Soko Verified badge today — no experience needed,
          just your craft and your story.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
        <Link href="/register/seller" style={{
          padding: '14px 32px',
          background: '#FEF3C7', color: '#7C2D12',
          borderRadius: '8px', fontSize: '15px',
          fontWeight: '600', textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          Start Selling Today →
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            '✅ Free to apply',
            '✅ Verified in 24 hours',
            '✅ Sell to the world',
          ].map(item => (
            <div key={item} style={{ fontSize: '13px', color: '#FDE68A' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}