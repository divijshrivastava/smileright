import { redirect } from 'next/navigation'
import { Activity, Users, UserPlus, Gauge, Eye, MousePointerClick } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAnalyticsDashboard } from '@/lib/analytics/google-analytics'
import { getEventDisplay } from '@/lib/analytics/event-labels'
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

  let gaData
  try {
    gaData = await getGoogleAnalyticsDashboard()
  } catch (error) {
    console.error('Failed to fetch GA data:', error)
    gaData = {
      configured: false,
      error: 'Failed to load analytics data',
      overview: { activeUsers: 0, newUsers: 0, sessions: 0, pageViews: 0, eventCount: 0 },
      pages: [],
      events: [],
      conversionEvents: [],
    }
  }

  const { configured, error, overview, pages, events, conversionEvents } = gaData

  const maxEventCount = Math.max(1, ...events.map((item) => item.count))
  const maxConversionEventCount = Math.max(1, ...conversionEvents.map((item) => item.count))
  const maxPageViews = Math.max(1, ...pages.map((item) => item.views))

  const statCards = [
    { label: 'Active Users', value: overview.activeUsers, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'New Users', value: overview.newUsers, icon: UserPlus, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Sessions', value: overview.sessions, icon: Gauge, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Page Views', value: overview.pageViews, icon: Eye, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Events', value: overview.eventCount, icon: MousePointerClick, color: '#ec4899', bg: '#fdf2f8' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Analytics Dashboard</h1>
          <p style={styles.subtitle}>Overview of your website's performance for the last 30 days.</p>
        </div>
        <div style={{ ...styles.badge, backgroundColor: configured ? '#ecfdf5' : '#fef2f2', color: configured ? '#059669' : '#dc2626' }}>
          <Activity size={14} />
          {configured ? 'Live Data' : 'Not Configured'}
        </div>
      </div>

      {!configured ? (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>
            Analytics is not configured. Please add `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, and `GA4_PRIVATE_KEY` to your environment variables.
          </p>
        </div>
      ) : error ? (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            {statCards.map((stat) => (
              <div key={stat.label} style={styles.statCard}>
                <div style={{ ...styles.statIconWrap, backgroundColor: stat.bg, color: stat.color }}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p style={styles.statNumber}>{stat.value.toLocaleString()}</p>
                  <p style={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.grid}>
            {/* Top Pages Section */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Top Viewed Pages</h2>
                <span style={styles.cardBadge}>Most Popular</span>
              </div>

              {pages.length === 0 ? (
                <p style={styles.empty}>No page views recorded yet.</p>
              ) : (
                <div style={styles.list}>
                  {pages.map((page, idx) => (
                    <div key={page.path} style={styles.row}>
                      <div style={styles.rank}>{idx + 1}</div>
                      <div style={styles.rowContent}>
                        <div style={styles.rowHeader}>
                          <span style={styles.rowLabel} title={page.path}>{page.path}</span>
                          <span style={styles.rowValue}>{page.views.toLocaleString()}</span>
                        </div>
                        <div style={styles.progressBarBg}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${(page.views / maxPageViews) * 100}%`,
                              backgroundColor: '#f59e0b'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Conversion Events Section */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Key Conversions</h2>
                <span style={styles.cardBadge}>Actions</span>
              </div>

              {conversionEvents.length === 0 ? (
                <p style={styles.empty}>No conversion events recorded yet.</p>
              ) : (
                <div style={styles.list}>
                  {conversionEvents.map((event, idx) => {
                    const eventDisplay = getEventDisplay(event.eventName)
                    return (
                      <div key={event.eventName} style={styles.row}>
                        <div style={styles.rank}>{idx + 1}</div>
                        <div style={styles.rowContent}>
                          <div style={styles.rowHeader}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={styles.rowLabel}>{eventDisplay.label}</span>
                              <span style={styles.rowHint}>{eventDisplay.description}</span>
                            </div>
                            <span style={styles.rowValue}>{event.count.toLocaleString()}</span>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div
                              style={{
                                ...styles.progressBarFill,
                                width: `${(event.count / maxConversionEventCount) * 100}%`,
                                backgroundColor: '#10b981'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* All Events Section */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>All Events</h2>
                <span style={styles.cardBadge}>Interactions</span>
              </div>

              {events.length === 0 ? (
                <p style={styles.empty}>No events recorded yet.</p>
              ) : (
                <div style={styles.list}>
                  {events.map((event, idx) => {
                    const eventDisplay = getEventDisplay(event.eventName)
                    return (
                      <div key={event.eventName} style={styles.row}>
                        <div style={styles.rank}>{idx + 1}</div>
                        <div style={styles.rowContent}>
                          <div style={styles.rowHeader}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={styles.rowLabel}>{eventDisplay.label}</span>
                              <span style={styles.rowHint}>{eventDisplay.description}</span>
                            </div>
                            <span style={styles.rowValue}>{event.count.toLocaleString()}</span>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div
                              style={{
                                ...styles.progressBarFill,
                                width: `${(event.count / maxEventCount) * 100}%`,
                                backgroundColor: '#3b82f6'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
  container: {
    // AdminLayout already adds 40px padding
    maxWidth: '1600px', // Keep max-width for readability on large screens
    fontFamily: 'var(--font-sans)',
    color: '#1e293b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', // Center vertically
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.025em',
    marginBottom: '0.5rem',
    marginTop: 0,
    fontFamily: 'var(--font-serif)',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    flexShrink: 0, // Prevent shrinking
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  statIconWrap: {
    padding: '0.75rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: '0.25rem',
    marginTop: 0,
    fontFamily: 'var(--font-serif)',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
    fontFamily: 'var(--font-serif)',
  },
  cardBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  rank: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    borderRadius: '50%',
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '0.375rem',
  },
  rowLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#334155',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },
  rowHint: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.125rem',
  },
  rowValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 1s ease-in-out',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    color: '#b91c1c',
  },
  errorText: {
    margin: 0,
    fontSize: '0.875rem',
  },
}
