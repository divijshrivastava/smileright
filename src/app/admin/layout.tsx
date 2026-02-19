import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Profile } from '@/lib/types'

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export const metadata: Metadata = {
  title: 'Smile Right Admin',
  description: 'Admin dashboard for Smile Right',
  manifest: '/admin/manifest.webmanifest',
  applicationName: 'Smile Right Admin',
  appleWebApp: {
    capable: true,
    title: 'Smile Right Admin',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/images/logo.png' }],
  },
}

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

  const { count: unreadContactCount } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: pendingApprovalCount } = await supabase
    .from('pending_changes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div style={{ minHeight: '100vh' }} className="admin-layout-shell">
      <AdminSidebar
        profile={profile as Profile}
        unreadContactCount={unreadContactCount ?? 0}
        pendingApprovalCount={pendingApprovalCount ?? 0}
      />
      <main style={{
        padding: '40px',
        background: 'transparent',
        minHeight: '100vh',
      }} className="admin-main">
        <div className="admin-page-shell">
          {children}
        </div>
      </main>
    </div>
  )
}
