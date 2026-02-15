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
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <p style={styles.subtitle}>Manage user roles and permissions</p>
      </div>
      <UserList users={users as Profile[]} currentUserId={user.id} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#666',
    margin: '0.5rem 0 0',
  },
}
