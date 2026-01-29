import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: totalCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: draftCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', false)

  return (
    <div>
      <h1 style={styles.heading}>Dashboard</h1>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{totalCount ?? 0}</p>
          <p style={styles.statLabel}>Total Testimonials</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{publishedCount ?? 0}</p>
          <p style={styles.statLabel}>Published</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNumber}>{draftCount ?? 0}</p>
          <p style={styles.statLabel}>Drafts</p>
        </div>
      </div>

      <div style={styles.quickLinks}>
        <h2 style={styles.subHeading}>Quick Actions</h2>
        <div style={styles.linkGrid}>
          <Link href="/admin/testimonials" style={styles.actionCard}>
            <p style={styles.actionTitle}>Manage Testimonials</p>
            <p style={styles.actionDesc}>View, edit, and publish testimonials</p>
          </Link>
          <Link href="/admin/testimonials/new" style={styles.actionCard}>
            <p style={styles.actionTitle}>Add Testimonial</p>
            <p style={styles.actionDesc}>Create a new patient testimonial</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    marginBottom: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '3rem',
  },
  statCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center' as const,
  },
  statNumber: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#1B73BA',
    margin: 0,
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  quickLinks: {
    marginTop: '1rem',
  },
  subHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: '#292828',
    marginBottom: '1.5rem',
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  actionCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  actionTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#292828',
    margin: 0,
    marginBottom: '0.5rem',
  },
  actionDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
}
