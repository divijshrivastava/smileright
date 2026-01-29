import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TestimonialForm from '@/components/admin/TestimonialForm'
import type { Testimonial } from '@/lib/types'

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single()

  if (!testimonial) {
    notFound()
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#292828',
        marginBottom: '2rem',
      }}>
        Edit Testimonial
      </h1>
      <TestimonialForm testimonial={testimonial as Testimonial} />
    </div>
  )
}
