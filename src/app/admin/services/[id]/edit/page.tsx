import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ServiceForm from '@/components/admin/ServiceForm'
import type { Service, ServiceImage } from '@/lib/types'
import { adminPageTitleStyle } from '@/styles/admin'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { id } = await params

  const { data: service } = await supabase
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
        is_primary,
        created_at,
        updated_at,
        created_by,
        updated_by
      )
    `)
    .eq('id', id)
    .single()

  if (!service) {
    notFound()
  }

  // Sort service_images by display_order
  const serviceWithSortedImages = {
    ...service,
    service_images: (service.service_images || [])
      .slice()
      .sort((a: ServiceImage, b: ServiceImage) => a.display_order - b.display_order),
  }

  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">Edit Service</h1>
      <ServiceForm service={serviceWithSortedImages as Service} />
    </div>
  )
}
