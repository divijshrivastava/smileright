'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { logLogoutEvent } from '@/app/admin/actions'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await logLogoutEvent().catch(() => {})
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        background: 'transparent',
        color: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '4px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}
    >
      Sign Out
    </button>
  )
}
