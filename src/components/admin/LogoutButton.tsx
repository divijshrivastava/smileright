'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { logLogoutEvent } from '@/app/admin/actions'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await logLogoutEvent().catch(() => { })
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="admin-btn admin-btn--ghost"
      style={{
        color: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(255,255,255,0.3)',
      }}
    >
      Sign Out
    </button>
  )
}
