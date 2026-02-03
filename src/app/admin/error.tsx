'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Something went wrong</h1>
        <p style={styles.message}>
          An error occurred in the admin panel. Please try again.
        </p>
        {error.digest && (
          <p style={styles.digest}>Error reference: {error.digest}</p>
        )}
        <div style={styles.actions}>
          <button onClick={reset} style={styles.retryBtn}>
            Try Again
          </button>
          <a href="/admin" style={styles.homeLink}>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
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
    marginBottom: '1.5rem',
  },
  digest: {
    fontSize: '0.8rem',
    color: '#999',
    marginBottom: '1.5rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  retryBtn: {
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  homeLink: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#1B73BA',
    border: '1px solid #1B73BA',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
