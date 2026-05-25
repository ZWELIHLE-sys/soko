import { prisma } from '@vuna/db'
import CategorySearch from './CategorySearch'
import styles from './CategoriesSection.module.css'

export default async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, description: true },
  })

  return (
    <section className={styles.section}>
      <CategorySearch categories={categories} />
    </section>
  )
}
