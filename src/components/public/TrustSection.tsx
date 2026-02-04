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
    .limit(50)

  const images: TrustImage[] = trustImages ?? []

  return (
    <section className="trust-section">
      <div className="container">
        <h2 className="section-title">Why Families Choose Smile Right</h2>
        <p className="section-subtitle">
          Trusted excellence in dental care with measurable results and satisfied patients
        </p>

        {/* Trust Stats */}
        <div className="trust-stats">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Happy Patients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Treatments Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5★</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Years Experience</div>
          </div>
        </div>

        {images.length > 0 ? (
          <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            <TrustImagesCarousel images={images} />
          </div>
        ) : null}

        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon">🔬</div>
            <h4>Advanced Technology</h4>
            <p>Latest equipment and techniques for precise, comfortable treatments</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">💙</div>
            <h4>Patient-Centered</h4>
            <p>Personalized care plans tailored to your unique needs and goals</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">👨‍⚕️</div>
            <h4>Expert Team</h4>
            <p>Led by Dr. Sneha Kedia, highly trained Dental Surgeon & Implantologist</p>
          </div>
        </div>
      </div>
    </section>
  )
}
