import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TestimonialList from '@/components/admin/TestimonialList'
import type { Testimonial, Profile } from '@/lib/types'
import { canEditContent } from '@/lib/permissions'
import {
  adminPageHeaderWrapStyle,
  adminPageTitleInHeaderStyle,
  adminPrimaryActionLinkCompactStyle,
} from '@/styles/admin'

export default async function TestimonialsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const role = (profile as Pick<Profile, 'role'>)?.role ?? 'viewer'

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="admin-page-content">
      <div style={adminPageHeaderWrapStyle} className="admin-page-header">
        <h1 style={adminPageTitleInHeaderStyle} className="admin-page-title">
          Testimonials
        </h1>
        {canEditContent(role) && (
          <Link
            href="/admin/testimonials/new"
            style={adminPrimaryActionLinkCompactStyle}
            className="admin-add-btn admin-primary-btn"
          >
            Add Testimonial
          </Link>
        )}
      </div>

      <TestimonialList
        testimonials={(testimonials as Testimonial[]) ?? []}
        userRole={role}
      />
    </div>
  )
}
