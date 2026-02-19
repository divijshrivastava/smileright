import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUsers } from '@/app/admin/actions'
import { canManageUsers } from '@/lib/permissions'
import type { AppRole, Profile } from '@/lib/types'
import UserList from '@/components/admin/UserList'

export default async function UsersPage() {
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

  const role = (profile?.role as AppRole) || 'viewer'

  if (!canManageUsers(role)) {
    redirect('/admin')
  }

  const users = await getUsers()

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">Invite new users and manage roles and permissions</p>
      </div>
      <UserList users={users as Profile[]} currentUserRole={role} />
    </div>
  )
}
