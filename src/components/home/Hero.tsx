import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{
      background: '#1C0A00',
      padding: '72px 32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Kente pattern - right side */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '240px', height: '100%',
        opacity: 0.12,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 80px)',
      }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const colors = ['#C2410C', '#D97706', '#14532D', '#7C2D12']
          return (
            <div key={i} style={{
              background: colors[i % colors.length],
              height: '80px'
            }} />
          )
        })}
      </div>

      <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {/* Tag */}
        <div style={{
          display: 'inline-block',
          background: '#D97706', color: '#1C0A00',
          fontSize: '11px', fontWeight: '600',
          padding: '4px 14px', borderRadius: '4px',
          letterSpacing: '1px', textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          🌍 Africa&apos;s Own Marketplace
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontWeight: '900', fontSize: '52px',
          color: '#FEF3C7', lineHeight: '1.1',
          marginBottom: '12px'
        }}>
          From African Hands<br />
          <span style={{ color: '#D97706' }}>To The World</span>
        </h1>

        {/* Slogan */}
        <div style={{
          fontSize: '11px', color: '#D97706',
          letterSpacing: '5px', textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          SOKO — WHERE AFRICA SELLS
        </div>

        {/* Description */}
        <p style={{
          fontSize: '16px', color: '#D6D3D1',
          maxWidth: '480px', lineHeight: '1.8',
          marginBottom: '32px'
        }}>
          Every product on Soko is African made, African owned and
          Soko verified. From the grandmother in Limpopo making pottery,
          to the designer in Durban stitching streetwear — if African
          hands built it, it belongs here.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link href="/shop" style={{
            padding: '14px 28px',
            background: '#D97706', color: '#1C0A00',
            borderRadius: '8px', fontSize: '15px',
            fontWeight: '600', textDecoration: 'none'
          }}>
            Shop African Made
          </Link>
          <Link href="/register/seller" style={{
            padding: '14px 28px',
            background: 'transparent', color: '#FEF3C7',
            border: '1.5px solid #FEF3C7',
            borderRadius: '8px', fontSize: '15px',
            textDecoration: 'none'
          }}>
            Sell Your Work
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '40px',
          paddingTop: '28px',
          borderTop: '1px solid #3D1A00',
          flexWrap: 'wrap'
        }}>
          {[
            { num: '9', label: 'SA Provinces' },
            { num: '14', label: 'Categories' },
            { num: '3', label: 'Sacred Rules' },
            { num: '🌍', label: 'Global Reach' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '28px', fontWeight: '700',
                color: '#FEF3C7'
              }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}