import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TestimonialForm from '@/components/admin/TestimonialForm'
import type { Testimonial } from '@/lib/types'
import { adminPageTitleStyle } from '@/styles/admin'

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
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">
        Edit Testimonial
      </h1>
      <TestimonialForm testimonial={testimonial as Testimonial} />
    </div>
  )
}
