import Link from 'next/link'
import { Globe, HandHeart, ShieldCheck, Truck, Sprout } from 'lucide-react'
import styles from './Footer.module.css'

const badges = [
  { icon: <Globe size={14} />, text: 'African owned' },
  { icon: <HandHeart size={14} />, text: 'Hand produced' },
  { icon: <ShieldCheck size={14} />, text: 'Soko verified' },
  { icon: <Truck size={14} />, text: 'SA delivery' },
  { icon: <Sprout size={14} />, text: 'Ground level first' },
]

const links = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'New Arrivals', href: '/shop?sort=new' },
    { label: 'Verified Sellers', href: '/sellers' },
  ],
  Sell: [
    { label: 'Start Selling', href: '/register/seller' },
    { label: 'Seller Rules', href: '/seller-rules' },
    { label: 'Soko Verified', href: '/verified' },
    { label: 'Seller Login', href: '/login' },
  ],
  Company: [
    { label: 'About Soko', href: '/about' },
    { label: 'Our Mission', href: '/mission' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Umzila-AfriRoute', href: '/company' },
  ],
}

export default function Footer() {
  return (
    <>
      <div className={styles.preFooter}>
        {badges.map(item => (
          <div key={item.text} className={styles.preFooterItem}>
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <div className={styles.topRow}>
          <div>
            <div className={styles.brand}>
              <div className={styles.logoIcon}>S</div>
              <div className={styles.logoName}>Soko</div>
            </div>
            <p className={styles.brandDesc}>
              Africa&apos;s own marketplace. Every product African made,
              African owned, and sold to the world.
            </p>
            <div className={styles.brandSub}>An Umzila-AfriRoute platform</div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <div className={styles.colTitle}>{title}</div>
              <div className={styles.colLinks}>
                {items.map(item => (
                  <Link key={item.href} href={item.href} className={styles.colLink}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.copyright}>
            © 2026 Soko — Umzila-AfriRoute (Pty) Ltd. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
              <Link key={item} href="#" className={styles.legalLink}>{item}</Link>
            ))}
          </div>
        </div>
      </footer>

      <div className={styles.patternStrip} />
    </>
  )
}
