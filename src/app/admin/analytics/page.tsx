import { redirect } from 'next/navigation'
import { Activity, Users, UserPlus, Gauge, Eye, MousePointerClick } from 'lucide-react'
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
  const maxEventCount = Math.max(1, ...ga.events.map((item) => item.count))
  const maxPageViews = Math.max(1, ...ga.pages.map((item) => item.views))
  const statCards = [
    { label: 'Active Users', value: ga.overview.activeUsers, icon: <Users size={18} color="#1B73BA" /> },
    { label: 'New Users', value: ga.overview.newUsers, icon: <UserPlus size={18} color="#1B73BA" /> },
    { label: 'Sessions', value: ga.overview.sessions, icon: <Gauge size={18} color="#1B73BA" /> },
    { label: 'Page Views', value: ga.overview.pageViews, icon: <Eye size={18} color="#1B73BA" /> },
    { label: 'Event Count', value: ga.overview.eventCount, icon: <MousePointerClick size={18} color="#1B73BA" /> },
  ]

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
            {statCards.map((stat) => (
              <div key={stat.label} style={styles.statCard}>
                <div style={styles.statIconWrap}>{stat.icon}</div>
                <p style={styles.statNumber}>{stat.value.toLocaleString()}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
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
                      <div style={styles.rowMain}>
                        <span style={styles.rowLabel}>{event.eventName}</span>
                        <div style={styles.rowBarTrack}>
                          <div
                            style={{
                              ...styles.rowBarFill,
                              width: `${Math.max(8, (event.count / maxEventCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
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
                      <div style={styles.rowMain}>
                        <span style={styles.rowLabel}>{page.path}</span>
                        <div style={styles.rowBarTrack}>
                          <div
                            style={{
                              ...styles.rowBarFill,
                              width: `${Math.max(8, (page.views / maxPageViews) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
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
    border: '1px solid #d9e7f6',
    borderRadius: '12px',
    padding: '16px 18px',
    textAlign: 'center' as const,
    boxShadow: '0 3px 10px rgba(27,115,186,0.08)',
  },
  statIconWrap: {
    width: '34px',
    height: '34px',
    margin: '0 auto 8px',
    borderRadius: '50%',
    background: '#edf4fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
    borderBottom: '1px solid #edf0f4',
    padding: '8px 0 10px',
  },
  rowMain: {
    minWidth: 0,
    flex: 1,
  },
  rowLabel: {
    display: 'block',
    color: '#3f3f3f',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowBarTrack: {
    width: '100%',
    height: '7px',
    marginTop: '7px',
    background: '#e8eef6',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  rowBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1B73BA, #4a9fe3)',
    borderRadius: '999px',
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
