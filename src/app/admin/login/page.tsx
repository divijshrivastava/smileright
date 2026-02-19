'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logLoginEvent, logFailedLoginEvent } from '@/app/admin/actions'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      logFailedLoginEvent(email).catch(() => { })
      return
    }

    logLoginEvent(true).catch(() => { })
    // Use hard navigation to ensure server-side auth state is properly loaded
    window.location.href = '/admin'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--admin-gray-50)',
      padding: 'var(--admin-space-5)',
    }}>
      <div className="admin-card admin-card--form" style={{ maxWidth: '400px', width: '100%', padding: 'var(--admin-space-10)' }}>
        <h1 style={{
          fontFamily: 'var(--admin-font-heading)',
          fontSize: 'var(--admin-text-2xl)',
          color: 'var(--admin-gray-900)',
          marginBottom: 'var(--admin-space-2)',
          textAlign: 'center',
        }}>Smile Right Admin</h1>
        <p style={{
          fontFamily: 'var(--admin-font-body)',
          fontSize: 'var(--admin-text-sm)',
          color: 'var(--admin-gray-500)',
          textAlign: 'center',
          marginBottom: 'var(--admin-space-8)',
        }}>Sign in to manage your clinic content</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-5)' }}>
          {error && <div className="admin-error">{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
            <label htmlFor="email" className="admin-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
              placeholder="admin@smileright.in"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
            <label htmlFor="password" className="admin-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn--primary admin-btn--lg"
            style={{
              width: '100%',
              marginTop: 'var(--admin-space-2)',
              opacity: loading ? 0.7 : 1,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
