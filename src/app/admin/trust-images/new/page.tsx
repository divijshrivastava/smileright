import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrustImageForm from '@/components/admin/TrustImageForm'
import { adminPageTitleStyle } from '@/styles/admin'

export default async function NewTrustImagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">Create New Trust Image</h1>
      <TrustImageForm />
    </div>
  )
}
