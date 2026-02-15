import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageSquareQuote, Stethoscope, ImageIcon, Plus, ArrowUpRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch all statistics
  const { count: totalTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })

  const { count: publishedTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  const { count: publishedServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalTrustImages } = await supabase
    .from('trust_images')
    .select('*', { count: 'exact', head: true })

  const { count: publishedTrustImages } = await supabase
    .from('trust_images')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  // Fetch recent testimonials
  const { data: recentTestimonials } = await supabase
    .from('testimonials')
    .select('id, name, rating, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent services
  const { data: recentServices } = await supabase
    .from('services')
    .select('id, title, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 style={styles.heading}>Dashboard</h1>
      <p style={styles.welcome}>Welcome to the Smile Right Admin Panel</p>

      {/* Statistics Overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Content Overview</h2>
        <div style={styles.statsGrid} className="admin-stats-grid">
          <div style={styles.statCard}>
            <div style={styles.statIcon}><MessageSquareQuote size={24} color="#1B73BA" /></div>
            <p style={styles.statNumber}>{totalTestimonials ?? 0}</p>
            <p style={styles.statLabel}>Total Testimonials</p>
            <p style={styles.statSubtext}>
              {publishedTestimonials ?? 0} published
            </p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><Stethoscope size={24} color="#1B73BA" /></div>
            <p style={styles.statNumber}>{totalServices ?? 0}</p>
            <p style={styles.statLabel}>Total Services</p>
            <p style={styles.statSubtext}>
              {publishedServices ?? 0} published
            </p>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><ImageIcon size={24} color="#1B73BA" /></div>
            <p style={styles.statNumber}>{totalTrustImages ?? 0}</p>
            <p style={styles.statLabel}>Trust Images</p>
            <p style={styles.statSubtext}>
              {publishedTrustImages ?? 0} published
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeading}>Quick Actions</h2>
        <div style={styles.linkGrid} className="admin-link-grid">
          <Link href="/admin/testimonials/new" style={styles.actionCard}>
            <div style={styles.actionIcon}><Plus size={24} /></div>
            <p style={styles.actionTitle}>Add Testimonial</p>
            <p style={styles.actionDesc}>Create a new patient testimonial</p>
          </Link>
          <Link href="/admin/services/new" style={styles.actionCard}>
            <div style={styles.actionIcon}><Plus size={24} /></div>
            <p style={styles.actionTitle}>Add Service</p>
            <p style={styles.actionDesc}>Create a new dental service</p>
          </Link>
          <Link href="/admin/trust-images/new" style={styles.actionCard}>
            <div style={styles.actionIcon}><Plus size={24} /></div>
            <p style={styles.actionTitle}>Add Trust Image</p>
            <p style={styles.actionDesc}>Upload trust section image</p>
          </Link>
          <Link href="/" target="_blank" style={{ ...styles.actionCard, ...styles.viewSiteCard }}>
            <div style={{ ...styles.actionIcon, color: 'rgba(255,255,255,0.8)' }}><ArrowUpRight size={24} /></div>
            <p style={{ ...styles.actionTitle, color: '#fff' }}>View Live Site</p>
            <p style={{ ...styles.actionDesc, color: 'rgba(255,255,255,0.9)' }}>See your changes on the website</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.recentSection} className="admin-recent-section">
        <div style={styles.recentColumn}>
          <h2 style={styles.sectionHeading}>Recent Testimonials</h2>
          {recentTestimonials && recentTestimonials.length > 0 ? (
            <div style={styles.recentList}>
              {recentTestimonials.map((t) => (
                <Link key={t.id} href={`/admin/testimonials/${t.id}/edit`} style={styles.recentItem} className="admin-recent-item">
                  <div style={styles.recentItemHeader}>
                    <span style={styles.recentItemName}>{t.name}</span>
                    <span style={t.is_published ? styles.badgePublished : styles.badgeDraft}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={styles.recentItemMeta}>
                    {'★'.repeat(t.rating)} · {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No testimonials yet</p>
          )}
          <Link href="/admin/testimonials" style={styles.viewAllLink}>
            View All Testimonials →
          </Link>
        </div>

        <div style={styles.recentColumn}>
          <h2 style={styles.sectionHeading}>Recent Services</h2>
          {recentServices && recentServices.length > 0 ? (
            <div style={styles.recentList}>
              {recentServices.map((s) => (
                <Link key={s.id} href={`/admin/services/${s.id}/edit`} style={styles.recentItem} className="admin-recent-item">
                  <div style={styles.recentItemHeader}>
                    <span style={styles.recentItemName}>{s.title}</span>
                    <span style={s.is_published ? styles.badgePublished : styles.badgeDraft}>
                      {s.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={styles.recentItemMeta}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No services yet</p>
          )}
          <Link href="/admin/services" style={styles.viewAllLink}>
            View All Services →
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
    marginBottom: '0.5rem',
  },
  welcome: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2.5rem',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.3rem',
    color: '#292828',
    marginBottom: '1.5rem',
    fontWeight: 600,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  statCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center' as const,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
    border: '1px solid #e0e0e0',
  },
  statIcon: {
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: 600,
  },
  statSubtext: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#999',
    marginTop: '0.5rem',
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  actionCard: {
    background: '#fff',
    padding: '28px 24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
    border: '1px solid #e0e0e0',
    display: 'block',
    position: 'relative' as const,
  },
  viewSiteCard: {
    background: 'linear-gradient(135deg, #1B73BA 0%, #1561a0 100%)',
    border: 'none',
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
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
  recentSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginTop: '3rem',
  },
  recentColumn: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '16px',
  },
  recentItem: {
    padding: '16px',
    background: '#f9f9f9',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background 0.2s, transform 0.2s',
    border: '1px solid #e0e0e0',
    display: 'block',
  },
  recentItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '12px',
  },
  recentItemName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#292828',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  recentItemMeta: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#999',
  },
  badgePublished: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: '#e6f4ea',
    color: '#1e7e34',
    whiteSpace: 'nowrap' as const,
  },
  badgeDraft: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: '#fef3e0',
    color: '#bf6c00',
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#999',
    padding: '30px 20px',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  viewAllLink: {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#1B73BA',
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center' as const,
    padding: '10px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
}
