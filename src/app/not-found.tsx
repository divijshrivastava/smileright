import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.message}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={styles.homeLink}>
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    padding: '20px',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
  },
  card: {
    background: '#fff',
    padding: '48px',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center' as const,
  },
  code: {
    fontFamily: 'var(--font-serif, Georgia, serif)',
    fontSize: '4rem',
    color: '#1B73BA',
    marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'var(--font-serif, Georgia, serif)',
    fontSize: '1.5rem',
    color: '#292828',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  homeLink: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
