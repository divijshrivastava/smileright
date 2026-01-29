import { createClient } from '@/lib/supabase/server'
import TrustImagesCarousel from '@/components/interactive/TrustImagesCarousel'
import type { TrustImage } from '@/lib/types'

export default async function TrustSection() {
  const supabase = await createClient()

  const { data: trustImages } = await supabase
    .from('trust_images')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const images: TrustImage[] = trustImages ?? []

  return (
    <section className="trust-section">
      <div className="container">
        {images.length > 0 ? (
          <div style={{ marginBottom: '3rem' }}>
            <TrustImagesCarousel images={images} />
          </div>
        ) : null}

        <div className="trust-grid">
          <div className="trust-item">
            <h4>Trusted Care</h4>
            <p>Families across Kandivali East trust us for comprehensive dental solutions</p>
          </div>
          <div className="trust-item">
            <h4>Advanced Technology</h4>
            <p>State-of-the-art equipment for precise, comfortable treatments</p>
          </div>
          <div className="trust-item">
            <h4>Patient-Centered</h4>
            <p>Personalized care plans tailored to your unique needs and goals</p>
          </div>
          <div className="trust-item">
            <h4>Expert Team</h4>
            <p>Led by Dr. Sneha Kedia, a highly trained Dental Surgeon and Implantologist</p>
          </div>
        </div>
      </div>
    </section>
  )
}
