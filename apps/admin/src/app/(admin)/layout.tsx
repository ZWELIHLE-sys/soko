import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AdminLiveBar from '@/components/AdminLiveBar'
import styles from '../admin.module.css'

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar user={session.user} />
      <main className={styles.main}>
        <AdminLiveBar />
        <div className={styles.mainInner}>
          {children}
        </div>
      </main>
    </div>
  )
}
