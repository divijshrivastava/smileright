import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ServiceForm from '@/components/admin/ServiceForm'

export default async function NewServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="admin-page-content">
      <h1 style={styles.title} className="admin-page-title">Add New Service</h1>
      <ServiceForm />
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
