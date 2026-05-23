import Link from 'next/link'
import { prisma } from '@vuna/db'
import {
  Shirt, Palette, Armchair, Wheat, Sparkles, Box,
  Cpu, BookOpen, Lamp, Scissors, Hammer, Leaf, Pencil, Camera,
  Tag,
} from 'lucide-react'
import styles from './CategoriesSection.module.css'

const categoryIcons: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={18} />,
  art:         <Palette size={18} />,
  furniture:   <Armchair size={18} />,
  food:        <Wheat size={18} />,
  beauty:      <Sparkles size={18} />,
  sculpture:   <Box size={18} />,
  electronics: <Cpu size={18} />,
  books:       <BookOpen size={18} />,
  homeware:    <Lamp size={18} />,
  textiles:    <Scissors size={18} />,
  metalwork:   <Hammer size={18} />,
  wellness:    <Leaf size={18} />,
  drawings:    <Pencil size={18} />,
  photography: <Camera size={18} />,
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section className={styles.section}>
      <div className={styles.imageBanner}>
        <h2 className={styles.heading}>
          Browse by <span className={styles.headingAccent}>Category</span>
        </h2>
        <p className={styles.subtitle}>Every category. Every product. African made.</p>
      </div>

      <div className={styles.headerRow}>
        <Link href="/shop" className={styles.seeAll}>See all →</Link>
      </div>

      <div className={styles.grid}>
        {categories.map(cat => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`} className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.icon}>
                {categoryIcons[cat.slug] ?? <Tag size={18} />}
              </div>
              <div className={styles.name}>{cat.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
