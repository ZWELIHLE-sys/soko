import { prisma } from '@vuna/db'
import { Star } from 'lucide-react'
import styles from './Testimonials.module.css'

async function getTestimonials() {
  try {
    return await prisma.testimonial.findMany({
      where:   { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take:    6,
      select: {
        id:        true,
        content:   true,
        rating:    true,
        createdAt: true,
        user:      { select: { name: true, avatar: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function Testimonials() {
  const testimonials = await getTestimonials()
  if (testimonials.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>Uvunile — You Have Reaped</div>
        <h2 className={styles.heading}>What our buyers say</h2>
        <p className={styles.sub}>
          Real people. Real purchases. Real impact on African creators.
        </p>

        <div className={styles.grid}>
          {testimonials.map(t => (
            <div key={t.id} className={styles.card}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < t.rating ? '#D97706' : 'none'}
                    color={i < t.rating ? '#D97706' : '#d1d5db'}
                  />
                ))}
              </div>
              <p className={styles.content}>&ldquo;{t.content}&rdquo;</p>
              <div className={styles.author}>
                <div className={styles.authorAvatar}>
                  {t.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.authorName}>{t.user.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
