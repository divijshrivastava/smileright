'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function parseHashParams(hash: string) {
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
}

export default function SetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const initializeSession = async () => {
      const supabase = createClient()
      const hashParams = parseHashParams(window.location.hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (sessionErr) {
          setError('This password setup link is invalid or expired. Please ask admin to re-invite you.')
          setLoading(false)
          return
        }
      }

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setError('This password setup link is invalid or expired. Please ask admin to re-invite you.')
      }
      setLoading(false)
    }

    initializeSession().catch(() => {
      setError('Unable to verify this invitation link.')
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })

    if (updateErr) {
      setError(updateErr.message)
      setSubmitting(false)
      return
    }

    setSuccess('Password set successfully. Redirecting to login...')
    setSubmitting(false)
    setTimeout(() => {
      router.push('/admin/login')
    }, 1200)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Set Your Password</h1>
        <p style={styles.subtitle}>Create your password to activate your Smile Right account.</p>

        {loading ? (
          <p style={styles.infoText}>Verifying invitation link...</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={styles.input}
                placeholder="At least 8 characters"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={styles.input}
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !!success}
              style={{
                ...styles.button,
                opacity: submitting || !!success ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving...' : 'Set Password'}
            </button>
          </form>
        )}
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
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    maxWidth: '440px',
    width: '100%',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: '#292828',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '1.8rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.45rem',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#292828',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'var(--font-sans)',
  },
  button: {
    padding: '14px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginTop: '0.3rem',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
    textAlign: 'center' as const,
  },
  success: {
    background: '#e8f7ec',
    color: '#1e7e34',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
    textAlign: 'center' as const,
  },
  infoText: {
    margin: 0,
    color: '#666',
    textAlign: 'center' as const,
    fontFamily: 'var(--font-sans)',
  },
}
