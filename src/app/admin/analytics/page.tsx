import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAnalyticsDashboard } from '@/lib/analytics/google-analytics'
import type { AppRole } from '@/lib/types'
import { canViewDashboard } from '@/lib/permissions'

export default async function AnalyticsPage() {
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
  if (!canViewDashboard(role)) {
    redirect('/admin')
  }

  const ga = await getGoogleAnalyticsDashboard()

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Google Analytics</h1>
          <p style={styles.subtitle}>Last 30 days performance and event tracking overview.</p>
        </div>
        <div style={styles.badge}>
          <Activity size={14} />
          {ga.configured ? 'Connected' : 'Not Configured'}
        </div>
      </div>

      {!ga.configured ? (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>
            Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, and `GA4_PRIVATE_KEY` in environment variables.
          </p>
        </div>
      ) : ga.error ? (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{ga.error}</p>
        </div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ga.overview.activeUsers.toLocaleString()}</p>
              <p style={styles.statLabel}>Active Users</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ga.overview.newUsers.toLocaleString()}</p>
              <p style={styles.statLabel}>New Users</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ga.overview.sessions.toLocaleString()}</p>
              <p style={styles.statLabel}>Sessions</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ga.overview.pageViews.toLocaleString()}</p>
              <p style={styles.statLabel}>Page Views</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statNumber}>{ga.overview.eventCount.toLocaleString()}</p>
              <p style={styles.statLabel}>Event Count</p>
            </div>
          </div>

          <div style={styles.tablesGrid}>
            <section style={styles.tableCard}>
              <h2 style={styles.tableTitle}>Top Events</h2>
              {ga.events.length === 0 ? (
                <p style={styles.empty}>No events available.</p>
              ) : (
                <div style={styles.list}>
                  {ga.events.map((event) => (
                    <div key={event.eventName} style={styles.row}>
                      <span style={styles.rowLabel}>{event.eventName}</span>
                      <span style={styles.rowValue}>{event.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={styles.tableCard}>
              <h2 style={styles.tableTitle}>Top Pages</h2>
              {ga.pages.length === 0 ? (
                <p style={styles.empty}>No page data available.</p>
              ) : (
                <div style={styles.list}>
                  {ga.pages.map((page) => (
                    <div key={page.path} style={styles.row}>
                      <span style={styles.rowLabel}>{page.path}</span>
                      <span style={styles.rowValue}>{page.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#666',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#e8f1fb',
    color: '#1B73BA',
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap' as const,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '18px',
    textAlign: 'center' as const,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  statNumber: {
    margin: 0,
    color: '#1B73BA',
    fontFamily: 'var(--font-serif)',
    fontSize: '1.7rem',
    fontWeight: 700,
  },
  statLabel: {
    margin: '6px 0 0',
    color: '#666',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  tableTitle: {
    margin: '0 0 12px',
    fontSize: '1rem',
    color: '#292828',
    fontFamily: 'var(--font-serif)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f0f0f0',
    padding: '8px 0',
  },
  rowLabel: {
    color: '#3f3f3f',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowValue: {
    color: '#1B73BA',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.86rem',
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  },
  empty: {
    margin: 0,
    color: '#777',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
  },
  errorCard: {
    background: '#fff5f5',
    border: '1px solid #ffc9c9',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  errorText: {
    margin: 0,
    color: '#9b2c2c',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem',
    lineHeight: 1.5,
  },
}
