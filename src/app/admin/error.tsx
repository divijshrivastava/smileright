'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: 'var(--admin-space-5)',
      fontFamily: 'var(--admin-font-body)',
    }}>
      <div className="admin-card admin-card--form" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--admin-font-heading)',
          fontSize: 'var(--admin-text-2xl)',
          color: 'var(--admin-gray-900)',
          marginBottom: 'var(--admin-space-4)',
        }}>Something went wrong</h1>
        <p style={{
          fontSize: 'var(--admin-text-base)',
          color: 'var(--admin-gray-500)',
          lineHeight: 1.6,
          marginBottom: 'var(--admin-space-6)',
        }}>
          An error occurred in the admin panel. Please try again.
        </p>
        {error.digest && (
          <p style={{
            fontSize: 'var(--admin-text-xs)',
            color: 'var(--admin-gray-400)',
            marginBottom: 'var(--admin-space-6)',
          }}>Error reference: {error.digest}</p>
        )}
        <div style={{ display: 'flex', gap: 'var(--admin-space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="admin-btn admin-btn--primary admin-btn--lg">
            Try Again
          </button>
          <a href="/admin" className="admin-btn admin-btn--secondary admin-btn--lg">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
