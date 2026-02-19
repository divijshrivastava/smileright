import TestimonialForm from '@/components/admin/TestimonialForm'

export default function NewTestimonialPage() {
  return (
    <div className="admin-page-content">
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#292828',
        marginBottom: '2rem',
      }} className="admin-page-title">
        Add New Testimonial
      </h1>
      <TestimonialForm />
    </div>
  )
}
