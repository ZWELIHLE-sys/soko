'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import styles from './AdBanner.module.css'

interface Ad {
  id: string
  advertiserName: string
  imageUrl: string
  linkUrl: string | null
}

const DISMISS_KEY = 'vuna_ad_dismissed'

// Site-wide advertising bar (bottom). Shows the advertiser's OWN designed
// banner image — Vuna only provides the neutral container. Dismissible;
// a newly-set ad (different id) shows again even after a previous dismiss.
export default function AdBanner() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [dismissed, setDismissed] = useState(true) // hidden until we know

  useEffect(() => {
    fetch('/api/public/ad')
      .then(r => r.json())
      .then(({ ad }: { ad: Ad | null }) => {
        if (!ad) return
        setAd(ad)
        setDismissed(localStorage.getItem(DISMISS_KEY) === ad.id)
      })
      .catch(() => {})
  }, [])

  if (!ad || dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, ad.id)
    setDismissed(true)
  }

  const inner = (
    <img src={ad.imageUrl} alt={ad.advertiserName} className={styles.image} />
  )

  return (
    <div className={styles.bar}>
      <span className={styles.tag}>Ad</span>
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener sponsored" className={styles.link}>
          {inner}
        </a>
      ) : (
        <div className={styles.link}>{inner}</div>
      )}
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss ad">
        <X size={16} />
      </button>
    </div>
  )
}
