'use client'

import { Children, useEffect, useRef, type ReactNode } from 'react'
import styles from './FadeIn.module.css'

interface Props {
  children: ReactNode
  delay?: number
  /** When true, children are staggered with sequential fade-in delays. */
  stagger?: boolean
  /** Per-child delay in ms when stagger is true. Default 60. */
  step?: number
}

function Item({ children, delay }: { children: ReactNode; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.visible)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={styles.wrap}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default function FadeIn({ children, delay = 0, stagger = false, step = 60 }: Props) {
  if (stagger) {
    return (
      <>
        {Children.map(children, (child, i) => (
          <Item key={i} delay={delay + i * step}>{child}</Item>
        ))}
      </>
    )
  }

  return <Item delay={delay}>{children}</Item>
}
