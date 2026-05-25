
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import MissionStrip from '@/components/home/MissionStrip'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BuyerBanner from '@/components/home/BuyerBanner'
import SellerBanner from '@/components/home/SellerBanner'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <MissionStrip />
      <CategoriesSection />
      <FeaturedProducts />
      <BuyerBanner />
      <SellerBanner />
      <Footer />
    </main>
  )
}