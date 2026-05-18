import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Shirt, Palette, Armchair, Wheat, Sparkles, Box,
  Cpu, BookOpen, Lamp, Scissors, Music, Leaf, Pencil, Camera,
  Tag,
} from 'lucide-react'
import styles from './CategoriesSection.module.css'

const categoryIcons: Record<string, React.ReactNode> = {
  fashion:     <Shirt size={28} />,
  art:         <Palette size={28} />,
  furniture:   <Armchair size={28} />,
  food:        <Wheat size={28} />,
  beauty:      <Sparkles size={28} />,
  sculpture:   <Box size={28} />,
  electronics: <Cpu size={28} />,
  books:       <BookOpen size={28} />,
  homeware:    <Lamp size={28} />,
  textiles:    <Scissors size={28} />,
  music:       <Music size={28} />,
  wellness:    <Leaf size={28} />,
  drawings:    <Pencil size={28} />,
  photography: <Camera size={28} />,
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
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>
            Browse by <span className={styles.headingAccent}>Category</span>
          </h2>
          <p className={styles.subtitle}>Every category. Every product. African made.</p>
        </div>
        <Link href="/categories" className={styles.seeAll}>See all →</Link>
      </div>

      <div className={styles.grid}>
        {categories.map(cat => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`} className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.icon}>
                {categoryIcons[cat.slug] ?? <Tag size={28} />}
              </div>
              <div className={styles.name}>{cat.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
