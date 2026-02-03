import { createClient } from '@/lib/supabase/server'
import TestimonialsCarousel from '@/components/interactive/TestimonialsCarousel'
import type { Testimonial } from '@/lib/types'

export default async function Testimonials() {
  const supabase = await createClient()

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const items: Testimonial[] = testimonials ?? []

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Patients Say</h2>
        <p className="section-subtitle">
          Real experiences from families who trust Smile Right for their dental care.
        </p>

        {items.length > 0 ? (
          <TestimonialsCarousel testimonials={items} />
        ) : (
          <p className="section-subtitle">
            Testimonials coming soon.
          </p>
        )}
      </div>
    </section>
  )
}
