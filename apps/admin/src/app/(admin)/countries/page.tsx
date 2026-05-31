'use client'

import { useEffect, useState } from 'react'
import { Globe, Lock, Unlock } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './countries.module.css'

interface Country {
  id: string
  name: string
  code: string
  isUnlocked: boolean
}

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(d => { setCountries(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const toggle = async (country: Country) => {
    setToggling(country.id)
    const res = await fetch(`/api/countries/${country.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUnlocked: !country.isUnlocked }),
    })
    const updated = await res.json()
    setCountries(cs => cs.map(c => c.id === updated.id ? updated : c))
    setToggling(null)
  }

  const unlocked = countries.filter(c => c.isUnlocked)
  const locked   = countries.filter(c => !c.isUnlocked)

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>African Countries</h1>
        <p className={shared.pageSub}>
          Unlock a country to allow sellers and buyers from that country to register on Vuna.
          South Africa is always unlocked. All others require your approval.
        </p>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>
          Unlocked <span className={styles.count}>{unlocked.length}</span>
        </h2>
        {loading ? (
          <div className={shared.loading}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            {unlocked.map(c => (
              <div key={c.id} className={`${styles.countryRow} ${styles.countryRowActive}`}>
                <div className={styles.countryInfo}>
                  <Globe size={14} className={styles.globeIcon} />
                  <span className={styles.countryName}>{c.name}</span>
                  <span className={styles.countryCode}>{c.code}</span>
                </div>
                {c.id !== 'country-za' && (
                  <button
                    className={styles.lockBtn}
                    disabled={toggling === c.id}
                    onClick={() => toggle(c)}
                  >
                    <Lock size={13} /> {toggling === c.id ? 'Locking...' : 'Lock'}
                  </button>
                )}
                {c.id === 'country-za' && (
                  <span className={styles.defaultBadge}>Default</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>
          Locked <span className={styles.count}>{locked.length}</span>
        </h2>
        <p className={styles.lockedSub}>
          Press Unlock to open registration for sellers and buyers in that country.
        </p>
        <div className={styles.grid}>
          {locked.map(c => (
            <div key={c.id} className={styles.countryRow}>
              <div className={styles.countryInfo}>
                <Globe size={14} className={styles.globeIconMuted} />
                <span className={styles.countryNameMuted}>{c.name}</span>
                <span className={styles.countryCode}>{c.code}</span>
              </div>
              <button
                className={styles.unlockBtn}
                disabled={toggling === c.id}
                onClick={() => toggle(c)}
              >
                <Unlock size={13} /> {toggling === c.id ? 'Unlocking...' : 'Unlock'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
