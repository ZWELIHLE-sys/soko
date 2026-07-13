import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import LiveBanner from '@/components/live/LiveBanner'
import Hero from '@/components/home/Hero'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FeaturedMakerSpotlight from '@/components/home/FeaturedMakerSpotlight'
import Testimonials from '@/components/home/Testimonials'
import BuyerBanner from '@/components/home/BuyerBanner'
import SellerBanner from '@/components/home/SellerBanner'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import SectionFallback from '@/components/ui/SectionFallback'

// The hero + navbar are static and ship instantly. Every below-the-fold
// section queries the database, so each is wrapped in Suspense — Next.js
// streams the hero immediately and fills the sections in as their data
// resolves, instead of blocking the whole page on the slowest query.
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <LiveBanner />
      <Hero />

      <Suspense fallback={<SectionFallback height={260} />}>
        <FadeIn><CategoriesSection /></FadeIn>
      </Suspense>

      <Suspense fallback={null}>
        <FeaturedMakerSpotlight />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>

      <BuyerBanner />
      <SellerBanner />
      <Footer />
    </main>
  )
}
