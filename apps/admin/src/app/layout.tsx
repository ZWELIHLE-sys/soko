import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata: Metadata = {
  title: 'Vuna Admin',
  description: 'Vuna marketplace administration',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9' }}>
          <AdminSidebar user={session.user} />
          <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
