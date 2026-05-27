import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SellerSidebar from '@/components/seller/SellerSidebar'
import styles from './seller.module.css'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'SELLER') {
    redirect('/login')
  }

  return (
    <div className={styles.shell}>
      <SellerSidebar user={session.user} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
