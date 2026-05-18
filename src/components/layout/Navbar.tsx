'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className={styles.patternStrip} />

      <nav className={styles.nav}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>S</div>
          <div>
            <div className={styles.logoName}>Soko</div>
            <div className={styles.logoSub}>To The World</div>
          </div>
        </Link>

        <div className={styles.navLinks}>
          {[
            { label: 'Shop', href: '/shop' },
            { label: 'Categories', href: '/categories' },
            { label: 'Sellers', href: '/sellers' },
            { label: 'About', href: '/about' },
          ].map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          {session ? (
            <div className={styles.userMenu}>
              <button onClick={() => setMenuOpen(!menuOpen)} className={styles.userBtn}>
                <div className={styles.avatar}>
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                {session.user?.name?.split(' ')[0]}
              </button>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <Link
                    href={session.user?.role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'}
                    className={styles.dropdownLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.signOutBtn}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.signInBtn}>Sign In</Link>
              <Link href="/register/seller" className={styles.sellBtn}>Start Selling</Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
