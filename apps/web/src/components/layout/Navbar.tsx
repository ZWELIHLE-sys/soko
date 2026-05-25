'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import styles from './navbar.module.css'

interface CartItem { quantity: number }

const navLinks = [
  { label: 'Home',    href: '/' },
  { label: 'Shop',    href: '/shop' },
  { label: 'Sellers', href: '/sellers' },
  { label: 'About',   href: '/about' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount,  setCartCount]  = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const cart: CartItem[] = JSON.parse(localStorage.getItem('vuna_cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    updateCount()
    window.addEventListener('vuna_cart_updated', updateCount)
    return () => window.removeEventListener('vuna_cart_updated', updateCount)
  }, [])

  const closeAll = () => { setMenuOpen(false); setMobileOpen(false) }

  return (
    <>
      <div className={styles.strip} />

      <nav className={styles.nav}>
        <Link href="/" className={styles.brand} onClick={closeAll}>
          <div className={styles.brandIcon}>V</div>
          <div>
            <div className={styles.brandName}>Vuna</div>
            <div className={styles.brandSub}>Reap What Africa Makes</div>
          </div>
        </Link>

        <div className={styles.navLinks}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.right}>
          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          <div className={styles.desktopAuth}>
            {session ? (
              <div className={styles.dropdownWrap}>
                <button className={styles.userBtn} onClick={() => setMenuOpen(o => !o)}>
                  <div className={styles.userAvatar}>
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {session.user?.name?.split(' ')[0]}
                </button>
                {menuOpen && (
                  <div className={styles.dropdown}>
                    <Link
                      href={session.user?.role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'}
                      className={styles.dropdownLink}
                      onClick={closeAll}
                    >
                      My Dashboard
                    </Link>
                    {session.user?.role === 'BUYER' && (
                      <Link href="/buyer/orders" className={styles.dropdownLink} onClick={closeAll}>
                        My Orders
                      </Link>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownSignOut} onClick={() => signOut({ callbackUrl: '/' })}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={styles.signInBtn}>Sign In</Link>
                <Link href="/register/seller" className={styles.startSellingBtn}>Start Selling</Link>
              </>
            )}
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={closeAll}>
              {link.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          {session ? (
            <>
              <Link
                href={session.user?.role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'}
                className={styles.mobileLink}
                onClick={closeAll}
              >
                My Dashboard
              </Link>
              {session.user?.role === 'BUYER' && (
                <Link href="/buyer/orders" className={styles.mobileLink} onClick={closeAll}>
                  My Orders
                </Link>
              )}
              <button className={styles.mobileSignOut} onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/login" className={styles.mobileSignIn} onClick={closeAll}>Sign In</Link>
              <Link href="/register/seller" className={styles.mobileStartSelling} onClick={closeAll}>Start Selling</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
