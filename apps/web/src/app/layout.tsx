import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import CookieBanner from '@/components/layout/CookieBanner'
import AdBanner from '@/components/layout/AdBanner'


export const metadata: Metadata = {
  title: 'Vuna — Where Local Is Celebrated And Cherished',
  description: "Your local marketplace. Every product locally made, Vuna verified.",
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
        <AdBanner />
      </body>
    </html>
  )
}