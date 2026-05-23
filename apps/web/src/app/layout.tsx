import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import CookieBanner from '@/components/layout/CookieBanner'


export const metadata: Metadata = {
  title: 'Vuna — Reap What Africa Makes',
  description: "Africa's own marketplace. Every product African made, African owned.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  )
}