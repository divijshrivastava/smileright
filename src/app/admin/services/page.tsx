import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ServiceList from '@/components/admin/ServiceList'
import type { Service, Profile } from '@/lib/types'
import { canEditContent } from '@/lib/permissions'
import {
  adminPageHeaderStyle,
  adminPageTitleInHeaderStyle,
  adminPrimaryActionLinkStyle,
} from '@/styles/admin'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as Pick<Profile, 'role'>)?.role ?? 'viewer'

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
    .order('display_order', { ascending: true })
    .limit(100)

  return (
    <div className="admin-page-content">
      <div style={adminPageHeaderStyle} className="admin-page-header">
        <h1 style={adminPageTitleInHeaderStyle} className="admin-page-title">Treatments & Services</h1>
        {canEditContent(role) && (
          <Link href="/admin/services/new" style={adminPrimaryActionLinkStyle} className="admin-add-btn admin-primary-btn">
            + Add Treatment/Service
          </Link>
        )}
      </div>
      <ServiceList services={(services as Service[]) || []} userRole={role} />
    </div>
  )
}
