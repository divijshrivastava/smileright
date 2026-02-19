import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrustImageForm from '@/components/admin/TrustImageForm'

export default async function NewTrustImagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-page-content">
      <h1 style={styles.title} className="admin-page-title">Create New Trust Image</h1>
      <TrustImageForm />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    marginBottom: '2rem',
  },
}
