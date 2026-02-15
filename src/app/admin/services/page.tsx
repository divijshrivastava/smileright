import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ServiceList from '@/components/admin/ServiceList'
import type { Service, Profile } from '@/lib/types'
import { canEditContent } from '@/lib/permissions'

export default async function ServicesPage() {
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

  const role = (profile as Pick<Profile, 'role'>)?.role ?? 'viewer'

  const { data: services } = await supabase
    .from('services')
    .select(`
      *,
      service_images (
        id,
        service_id,
        image_url,
        alt_text,
        caption,
        display_order,
        created_at,
        updated_at,
        created_by,
        updated_by
      )
    `)
    .order('display_order', { ascending: true })
    .limit(100)

  return (
    <div>
      <div style={styles.header} className="admin-page-header">
        <h1 style={styles.title}>Featured Services</h1>
        {canEditContent(role) && (
          <Link href="/admin/services/new" style={styles.addBtn} className="admin-add-btn">
            + Add Service
          </Link>
        )}
      </div>
      <ServiceList services={(services as Service[]) || []} userRole={role} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    margin: 0,
  },
  addBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
}
