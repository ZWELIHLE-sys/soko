import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { brandName: true, isVerified: true } },
      category: { select: { name: true, icon: true } },
      location: { select: { name: true } }
    }
  })
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section style={{ padding: '52px 32px', background: '#fff' }}>
      {/* Divider strip */}
      <div style={{
        height: '4px', marginBottom: '48px',
        background: 'repeating-linear-gradient(90deg, #14532D 0px, #14532D 8px, #D97706 8px, #D97706 16px, #7C2D12 16px, #7C2D12 24px, #C2410C 24px, #C2410C 32px)'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '28px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px', fontWeight: '700', color: '#1a1a1a'
          }}>
            Featured{' '}
            <span style={{ color: '#C2410C' }}>Products</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Handpicked from verified African sellers
          </p>
        </div>
        <Link href="/shop" style={{
          fontSize: '14px', color: '#C2410C',
          textDecoration: 'none', fontWeight: '500'
        }}>
          View all →
        </Link>
      </div>

      {/* Empty state — no products yet */}
      {products.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#FAFAF9', borderRadius: '16px',
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '20px', fontWeight: '600',
            color: '#1a1a1a', marginBottom: '8px'
          }}>
            The first products are coming
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '360px', margin: '0 auto 20px' }}>
            Soko is just getting started. Be the first African creator
            to list your work and reach the world.
          </p>
          <Link href="/register/seller" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#7C2D12', color: '#FEF3C7',
            borderRadius: '8px', fontSize: '14px',
            fontWeight: '500', textDecoration: 'none'
          }}>
            Be The First Seller →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {products.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#fff',
                cursor: 'pointer'
              }}>
                {/* Image area */}
                <div style={{
                  height: '180px',
                  background: '#FEF3C7',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  position: 'relative'
                }}>
                  {product.category.icon}
                  {product.seller.isVerified && (
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: '#14532D', color: '#fff',
                      fontSize: '10px', padding: '3px 8px',
                      borderRadius: '4px', fontWeight: '500'
                    }}>
                      Soko ✓
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{
                    fontSize: '14px', fontWeight: '500',
                    color: '#1a1a1a', marginBottom: '4px'
                  }}>
                    {product.name}
                  </div>
                  <div style={{
                    fontSize: '12px', color: '#9ca3af',
                    marginBottom: '10px'
                  }}>
                    by {product.seller.brandName}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '15px', fontWeight: '600',
                      color: '#7C2D12'
                    }}>
                      R{product.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#d1d5db' }}>
                      📍 {product.location.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}