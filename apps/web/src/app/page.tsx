
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

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <LiveBanner />
      <Hero />
      <FadeIn><CategoriesSection /></FadeIn>
      <FeaturedMakerSpotlight />
      <FeaturedProducts />
      <Testimonials />
      <BuyerBanner />
      <SellerBanner />
      <Footer />
    </main>
  )
}