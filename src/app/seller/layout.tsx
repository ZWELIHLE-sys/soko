import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SellerSidebar from '@/components/seller/SellerSidebar'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'SELLER') {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9' }}>
      <SellerSidebar seller={session.user} />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}