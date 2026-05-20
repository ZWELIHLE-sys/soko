import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BuyerSidebar from '@/components/buyer/BuyerSidebar'
import styles from './buyer.module.css'

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'BUYER') {
    redirect('/login')
  }

  return (
    <div className={styles.shell}>
      <BuyerSidebar user={session.user} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
