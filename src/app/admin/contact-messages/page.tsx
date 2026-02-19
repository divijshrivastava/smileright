import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markContactMessageViewed } from '@/app/admin/actions'
import { canApproveChanges } from '@/lib/permissions'
import type { AppRole, ContactMessage, Profile } from '@/lib/types'

export default async function ContactMessagesPage() {
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

  const role = (profile as Pick<Profile, 'role'> | null)?.role ?? 'viewer'
  const canMarkViewed = canApproveChanges(role as AppRole)

  const { data: messages } = await supabase
    .from('contact_messages')
    .select(`
      id,
      name,
      email,
      phone,
      preferred_contact,
      service_interest,
      appointment_preference,
      message,
      status,
      source_page,
      form_location,
      utm_source,
      utm_medium,
      utm_campaign,
      created_at,
      viewed_at
    `)
    .order('created_at', { ascending: false })
    .limit(300)

  const rows = (messages as Pick<ContactMessage,
    'id' | 'name' | 'email' | 'phone' | 'preferred_contact' |
    'service_interest' | 'appointment_preference' | 'message' |
    'status' | 'source_page' | 'form_location' |
    'utm_source' | 'utm_medium' | 'utm_campaign' | 'created_at' | 'viewed_at'
  >[]) || []

  return (
    <div className="admin-page-content">
      <div style={styles.header} className="admin-page-header">
        <div>
          <h1 style={styles.title} className="admin-page-title">Contact Messages</h1>
          <p style={styles.subtitle} className="admin-page-subtitle">Leads received from contact forms across blog and treatment pages.</p>
        </div>
        <span style={styles.countBadge} className="admin-chip">{rows.length} shown</span>
      </div>

      {rows.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>No messages received yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {rows.map((message) => (
            <article key={message.id} style={styles.card}>
              <div style={styles.topRow}>
                <div>
                  <h2 style={styles.name}>{message.name}</h2>
                  <p style={styles.metaLine}>
                    {new Date(message.created_at).toLocaleString()} • {message.preferred_contact.toUpperCase()}
                  </p>
                </div>
                <span style={message.status === 'new' ? styles.statusNew : styles.statusOther}>
                  {message.status}
                </span>
              </div>

              <div style={styles.controlsRow}>
                {message.status === 'new' && canMarkViewed && (
                  <form action={markContactMessageViewed.bind(null, message.id)}>
                    <button type="submit" style={styles.markViewedBtn}>
                      Mark as Viewed
                    </button>
                  </form>
                )}
                {message.status !== 'new' && message.viewed_at && (
                  <p style={styles.viewedMeta}>
                    Viewed on {new Date(message.viewed_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div style={styles.contactRow}>
                <a href={`mailto:${message.email}`} style={styles.link}>{message.email}</a>
                {message.phone && (
                  <a href={`tel:${message.phone}`} style={styles.link}>{message.phone}</a>
                )}
              </div>

              <p style={styles.message}>{message.message}</p>

              <div style={styles.tags}>
                {message.service_interest && <span style={styles.tag}>Service: {message.service_interest}</span>}
                {message.appointment_preference && <span style={styles.tag}>Time: {message.appointment_preference}</span>}
                {message.source_page && <span style={styles.tag}>Page: {message.source_page}</span>}
                {message.form_location && <span style={styles.tag}>Location: {message.form_location}</span>}
                {(message.utm_source || message.utm_medium || message.utm_campaign) && (
                  <span style={styles.tag}>
                    UTM: {[message.utm_source, message.utm_medium, message.utm_campaign].filter(Boolean).join(' / ')}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    margin: 0,
  },
  subtitle: {
    margin: '0.5rem 0 0',
    color: '#666',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
  },
  countBadge: {
    display: 'inline-block',
    background: '#e8f1fb',
    color: '#1B73BA',
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap' as const,
  },
  emptyCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '2rem',
  },
  emptyText: {
    margin: 0,
    color: '#666',
    fontFamily: 'var(--font-sans)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '10px',
  },
  name: {
    margin: 0,
    color: '#292828',
    fontSize: '1.25rem',
    fontFamily: 'var(--font-serif)',
  },
  metaLine: {
    margin: '6px 0 0',
    color: '#777',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
  },
  statusNew: {
    background: '#e6f4ea',
    color: '#1e7e34',
    padding: '4px 10px',
    borderRadius: '999px',
    textTransform: 'uppercase' as const,
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
  },
  statusOther: {
    background: '#eef2f6',
    color: '#44546a',
    padding: '4px 10px',
    borderRadius: '999px',
    textTransform: 'uppercase' as const,
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
  },
  contactRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '14px',
    marginBottom: '10px',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '10px',
  },
  markViewedBtn: {
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  viewedMeta: {
    margin: 0,
    color: '#6b7280',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans)',
  },
  link: {
    color: '#1B73BA',
    textDecoration: 'none',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
  },
  message: {
    margin: '0 0 12px',
    color: '#3f3f3f',
    lineHeight: 1.65,
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'pre-wrap' as const,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  tag: {
    background: '#f4f6f9',
    color: '#49566a',
    border: '1px solid #dde2e8',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '0.77rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
  },
}
