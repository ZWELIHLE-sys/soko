import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section style={{ padding: '52px 32px', background: '#FAFAF9' }}>
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
            Browse by{' '}
            <span style={{ color: '#C2410C' }}>Category</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Every category. Every product. African made.
          </p>
        </div>
        <Link href="/categories" style={{
          fontSize: '14px', color: '#C2410C',
          textDecoration: 'none', fontWeight: '500'
        }}>
          See all →
        </Link>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {cat.icon}
              </div>
              <div style={{
                fontSize: '13px', fontWeight: '500',
                color: '#1a1a1a', marginBottom: '3px'
              }}>
                {cat.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}