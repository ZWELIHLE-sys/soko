'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import styles from './CategorySearch.module.css'

interface Category {
  id: string
  name: string
  slug: string
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
        filtered.length === 0 ? (
          <p className={styles.empty}>No categories match &ldquo;{q}&rdquo;</p>
        ) : (
          <div className={styles.pillRow}>
            {filtered.map(cat => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={styles.pill}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
