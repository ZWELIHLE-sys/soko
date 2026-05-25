import Link from 'next/link'
import styles from './CategoriesSection.module.css'

const photoCategories = [
  { slug: 'fashion',   label: 'Fashion & Clothing',  sub: 'Clothing, accessories, traditional dress', image: '/images/cat-fashion.jpg'   },
  { slug: 'art',       label: 'Art & Paintings',      sub: 'Paintings, prints and visual art',         image: '/images/cat-art-decor.jpg' },
  { slug: 'textiles',  label: 'Textiles & Fabric',    sub: 'Beadwork, weaving, fabrics and fibre',     image: '/images/cat-textiles.jpg'  },
  { slug: 'sculpture', label: 'Sculpture & Crafts',   sub: 'Carved sculptures and craft objects',      image: '/images/cat-woodwork.jpg'  },
  { slug: 'homeware',  label: 'Homeware & Decor',     sub: 'Home décor, kitchenware and interiors',    image: '/images/cat-homeware.jpg'  },
  { slug: 'wellness',  label: 'Wellness & Herbal',    sub: 'Herbal remedies and holistic wellness',    image: '/images/cat-wellness.jpg'  },
]

export default function CategoriesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.heading}>
            Browse by <span className={styles.headingAccent}>Category</span>
          </h2>
          <p className={styles.subtitle}>Every product. African made.</p>
        </div>
        <Link href="/shop" className={styles.seeAll}>See all →</Link>
      </div>

      <div className={styles.photoGrid}>
        {photoCategories.map(cat => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className={styles.photoCard}
            style={{
              backgroundImage: `linear-gradient(rgba(28,10,0,0.52), rgba(28,10,0,0.52)), url('${cat.image}')`,
            }}
          >
            <div className={styles.photoCardLabel}>{cat.label}</div>
            <div className={styles.photoCardSub}>{cat.sub}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
