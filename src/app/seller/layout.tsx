import Link from 'next/link'
import { LayoutDashboard, Package } from 'lucide-react'
import styles from './layout.module.css'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <div className={styles.brandIcon}>S</div>
            <div>
              <div className={styles.brandName}>Soko</div>
              <div className={styles.brandSub}>Seller Hub</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Menu</div>

          <Link href="/seller/dashboard" className={styles.navLink}>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link href="/seller/products" className={styles.navLink}>
            <Package size={16} />
            My Products
          </Link>
        </nav>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
