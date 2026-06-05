'use client'

import { useSyncExternalStore } from 'react'
import { Cookie } from 'lucide-react'
import Link from 'next/link'
import styles from './CookieBanner.module.css'

const KEY = 'vuna_cookie_consent'
const CHANGE = 'vuna_consent_change'

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(CHANGE, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(CHANGE, cb)
  }
}

function setConsent(value: string) {
  localStorage.setItem(KEY, value)
  window.dispatchEvent(new Event(CHANGE))
}

export default function CookieBanner() {
  // Returns null (no consent yet) or the stored value.
  // Server snapshot is truthy so the banner never renders on the server.
  const consent = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY),
    () => 'ssr',
  )

  if (consent !== null) return null

  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        <div className={styles.title}><Cookie size={15} className={styles.titleIcon} /> We use essential cookies only</div>
        <div className={styles.desc}>
          Vuna uses essential cookies to keep you logged in and your cart saved.
          No tracking. No advertising. See our{' '}
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.btnAccept} onClick={() => setConsent('acknowledged')}>
          Got it
        </button>
      </div>
    </div>
  )
}
