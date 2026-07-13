import styles from './SectionFallback.module.css'

// Streaming placeholder — holds vertical space so the page doesn't jump as
// each below-the-fold section streams in behind the hero.
export default function SectionFallback({ height = 320 }: { height?: number }) {
  return (
    <div className={styles.fallback} style={{ minHeight: height }}>
      <div className={styles.shimmer} />
    </div>
  )
}
