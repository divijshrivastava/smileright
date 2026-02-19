import TestimonialForm from '@/components/admin/TestimonialForm'
import { adminPageTitleStyle } from '@/styles/admin'

export default function NewTestimonialPage() {
  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">
        Add New Testimonial
      </h1>
      <TestimonialForm />
    </div>
  )
}
