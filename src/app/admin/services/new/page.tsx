import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ServiceForm from '@/components/admin/ServiceForm'
import { adminPageTitleStyle } from '@/styles/admin'

export default async function NewServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">Add New Service</h1>
      <ServiceForm />
    </div>
  )
}
