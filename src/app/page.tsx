import Header from '@/components/public/Header'
import Hero from '@/components/public/Hero'
import Welcome from '@/components/public/Welcome'
import FeaturedServices from '@/components/public/FeaturedServices'
import DoctorBio from '@/components/public/DoctorBio'
import Testimonials from '@/components/public/Testimonials'
import ClinicInfo from '@/components/public/ClinicInfo'
import TrustSection from '@/components/public/TrustSection'
import Footer from '@/components/public/Footer'
import SmoothScrollLink from '@/components/interactive/SmoothScrollLink'

export const revalidate = 3600

export default function HomePage() {
  return (
    <>
      <SmoothScrollLink />
      <Header />
      <Hero />
      <Welcome />
      <FeaturedServices />
      <DoctorBio />
      <Testimonials />
      <ClinicInfo />
      <TrustSection />
      <Footer />
    </>
  )
}
