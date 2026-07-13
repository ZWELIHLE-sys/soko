import { unstable_cache } from 'next/cache'
import { prisma } from '@vuna/db'
import CategorySearch from './CategorySearch'
import styles from './CategoriesSection.module.css'

// Categories almost never change — cache for 5 minutes so the homepage
// doesn't re-query them on every single visit.
const getCategories = unstable_cache(
  async () => prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, icon: true, description: true },
  }),
  ['home-categories'],
  { revalidate: 300, tags: ['categories'] },
)

export default async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section className={styles.section}>
      <CategorySearch categories={categories} />
    </section>
  )
}
