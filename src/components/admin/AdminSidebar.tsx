import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { Profile } from '@/lib/types'

interface AdminSidebarProps {
  profile: Profile
}

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <h2 style={styles.brandTitle}>Smile Right</h2>
        <p style={styles.brandSub}>Admin Panel</p>
      </div>

      <nav style={styles.nav}>
        <Link href="/admin" style={styles.link}>
          Dashboard
        </Link>
        <Link href="/admin/testimonials" style={styles.link}>
          Testimonials
        </Link>
        <Link href="/admin/testimonials/new" style={styles.link}>
          Add Testimonial
        </Link>
        <Link href="/admin/trust-images" style={styles.link}>
          Trust Images
        </Link>
        <Link href="/admin/trust-images/new" style={styles.link}>
          Add Trust Image
        </Link>
        <Link href="/" style={styles.link} target="_blank">
          View Site
        </Link>
      </nav>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{profile.full_name || profile.email}</p>
          <p style={styles.userRole}>{profile.role}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: '#292828',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  brand: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  brandTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  brandSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  nav: {
    padding: '20px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    display: 'block',
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'background 0.2s, color 0.2s',
  },
  userSection: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  userInfo: {
    marginBottom: '12px',
  },
  userName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#fff',
    margin: 0,
    fontWeight: 600,
  },
  userRole: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
}
