'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, HandHeart, Globe, ShieldCheck } from 'lucide-react'
import styles from './register.module.css'

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.patternStrip} />

      <div className={styles.center}>
        <div className={styles.wrapper}>

          <div className={styles.logoBox}>
            <div className={styles.logoImgWrap}>
              <Image src="/images/handlogo-full.png" alt="Vuna Marketplace" fill sizes="200px" className={styles.logoImg} />
            </div>
            <div className={styles.logoTitle}>Join Vuna</div>
            <div className={styles.logoSub}>Your local marketplace</div>
          </div>

          <div className={styles.grid}>
            <Link href="/register/buyer" className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardIcon}><ShoppingBag size={36} strokeWidth={1.5} /></div>
                <div className={styles.cardTitle}>I want to Shop</div>
                <div className={styles.cardDesc}>Browse and buy authentic locally made products</div>
              </div>
            </Link>

            <Link href="/register/seller" className={styles.cardLink}>
              <div className={`${styles.card} ${styles.cardSeller}`}>
                <div className={styles.cardIcon}><HandHeart size={36} strokeWidth={1.5} /></div>
                <div className={styles.cardTitle}>I want to Sell</div>
                <div className={styles.cardDesc}>Sell your locally made products to buyers across the country</div>
              </div>
            </Link>
          </div>

          <div className={styles.sacredRules}>
            <div className={styles.sacredTitle}>Vuna&apos;s 3 Sacred Rules for Sellers</div>
            <div className={styles.sacredList}>
              <div className={styles.sacredItem}><Globe size={14} /> Locally owned</div>
              <div className={styles.sacredItem}><HandHeart size={14} /> Maker made</div>
              <div className={styles.sacredItem}><ShieldCheck size={14} /> Vuna Verified</div>
            </div>
          </div>

          <div className={styles.footer}>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>Sign in</Link>
          </div>
        </div>
      </div>

      <div className={styles.patternStrip} />
    </div>
  )
}
