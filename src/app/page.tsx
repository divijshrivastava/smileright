import Header from '@/components/public/Header'
import Hero from '@/components/public/Hero'
import Welcome from '@/components/public/Welcome'
import FeaturedServices from '@/components/public/FeaturedServices'
import DoctorBio from '@/components/public/DoctorBio'
import Testimonials from '@/components/public/Testimonials'
import ClinicInfo from '@/components/public/ClinicInfo'
import TrustSection from '@/components/public/TrustSection'
import FAQ from '@/components/public/FAQ'
import Footer from '@/components/public/Footer'
import SmoothScrollLink from '@/components/interactive/SmoothScrollLink'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/lib/types'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: services } = await supabase
    .from('services')
    .select(`
      *,
      service_images (
        id,
        service_id,
        image_url,
        alt_text,
        caption,
        display_order,
        created_at,
        updated_at,
        created_by,
        updated_by
      )
    `)
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  // Sort service_images by display_order
  const servicesWithSortedImages = (services as Service[])?.map(service => ({
    ...service,
    service_images: service.service_images?.sort((a, b) => a.display_order - b.display_order)
  })) || []

  return (
    <>
      <SmoothScrollLink />
      <FloatingWhatsApp />
      <Header />
      <Hero />
      <Welcome />
      <TrustSection />
      <FeaturedServices services={servicesWithSortedImages} />
      <DoctorBio />
      <Testimonials />
      <FAQ />
      <ClinicInfo />
      <Footer />
    </>
  )
}
