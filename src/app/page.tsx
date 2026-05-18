
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import MissionStrip from '@/components/home/MissionStrip'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import SellerBanner from '@/components/home/SellerBanner'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <MissionStrip />
      <CategoriesSection />
      <FeaturedProducts />
      <SellerBanner />
      <Footer />
    </main>
  )
}