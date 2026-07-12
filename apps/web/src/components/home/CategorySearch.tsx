'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Shirt, Palette, Sofa, Wheat, Sparkles, Gem,
  Cpu, BookOpen, Home, Scissors, Hammer, Leaf, PenLine,
  Camera, Package, PawPrint, Sprout, type LucideIcon,
} from 'lucide-react'
import styles from './CategorySearch.module.css'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fashion:     Shirt,
  art:         Palette,
  furniture:   Sofa,
  food:        Wheat,
  livestock:   PawPrint,
  produce:     Sprout,
  beauty:      Sparkles,
  sculpture:   Gem,
  electronics: Cpu,
  books:       BookOpen,
  homeware:    Home,
  textiles:    Scissors,
  metalwork:   Hammer,
  wellness:    Leaf,
  drawings:    PenLine,
  photography: Camera,
  other:       Package,
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export default function CategorySearch({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')

  const q = query.trim()

  const filtered = q
    ? categories.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.description?.toLowerCase().includes(q.toLowerCase())
      )
    : []

  return (
    <div className={styles.wrap}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.input}
          type="text"
          placeholder="Search a category — fashion, art, wellness..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          spellCheck={false}
        />
        {query && (
          <button className={styles.clear} onClick={() => setQuery('')} aria-label="Clear">
            ×
          </button>
        )}
      </div>

      {q && (
        <>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No categories match &ldquo;{q}&rdquo;</p>
          ) : (
            <div className={styles.pillRow}>
              {filtered.map(cat => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? Package
                return (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className={styles.pill}
                  >
                    <span className={styles.pillIcon}><Icon size={13} /></span>
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          )}
          <Link
            href={`/shop?q=${encodeURIComponent(q)}`}
            className={styles.productSearchLink}
          >
            Search all products for &ldquo;{q}&rdquo; →
          </Link>
        </>
      )}
    </div>
  )
}
