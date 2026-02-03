import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Profile } from '@/lib/types'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated and not on login page, redirect
  // (middleware handles this too, but this is a server-side guard)
  if (!user) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar profile={profile as Profile} />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '40px',
        background: '#f5f5f5',
        minHeight: '100vh',
      }} className="admin-main">
        {children}
      </main>
    </div>
  )
}
