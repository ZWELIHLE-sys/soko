import Link from 'next/link'
import Image from 'next/image'
import styles from './footer.module.css'

const mainLinks = [
  { label: 'Home',    href: '/' },
  { label: 'Shop',    href: '/shop' },
  { label: 'Sellers', href: '/sellers' },
  { label: 'About',   href: '/about' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Image src="/images/handlogo-tree-cream.png" alt="Vuna" fill sizes="44px" className={styles.brandLogo} />
          </div>
          <div>
            <div className={styles.brandText}>Vuna</div>
            <div className={styles.tagline}>Marketplace</div>
            <div className={styles.slogan}>Where Local Is Celebrated And Cherished</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {mainLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.copy}>
          &copy; {new Date().getFullYear()} Vuna. All rights reserved.
        </div>
      </div>

      <div className={styles.legal}>
        {legalLinks.map(link => (
          <Link key={link.href} href={link.href} className={styles.legalLink}>
            {link.label}
          </Link>
        ))}
        <span className={styles.legalNote}>Umzila-AfriRoute</span>
      </div>
    </footer>
  )
}
