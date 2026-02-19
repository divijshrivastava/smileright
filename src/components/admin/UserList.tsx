'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inviteUser, updateUserRole } from '@/app/admin/actions'
import type { Profile, AppRole } from '@/lib/types'

interface UserListProps {
  users: Profile[]
  currentUserRole: AppRole
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'admin': return 'admin-badge--admin'
    case 'editor': return 'admin-badge--editor'
    case 'viewer': return 'admin-badge--viewer'
    default: return 'admin-badge--neutral'
  }
}

export default function UserList({ users, currentUserRole }: UserListProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AppRole>('viewer')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setInviting(true)

    try {
      await inviteUser(email, role)
      setSuccess(`Invitation sent to ${email}`)
      setEmail('')
      setRole('viewer')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateUserRole(userId, newRole)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change role')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-8)' }}>
      {/* Invite User Card */}
      <div className="admin-card admin-card--form">
        <h3 style={{
          fontFamily: 'var(--admin-font-heading)',
          fontSize: 'var(--admin-text-lg)',
          color: 'var(--admin-gray-900)',
          margin: '0 0 var(--admin-space-4)',
        }}>
          Invite New User
        </h3>

        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
          {error && <div className="admin-error">{error}</div>}
          {success && (
            <div style={{
              background: 'var(--admin-success-50)',
              color: 'var(--admin-success-700)',
              padding: 'var(--admin-space-3) var(--admin-space-4)',
              borderRadius: 'var(--admin-radius-md)',
              border: '1px solid var(--admin-success-100)',
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
            }}>
              {success}
            </div>
          )}

          <div className="user-invite-fields" style={{ display: 'flex', gap: 'var(--admin-space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)' }}>
              <label className="admin-label" htmlFor="invite-email">Email Address</label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="admin-input"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-1)', minWidth: '140px' }}>
              <label className="admin-label" htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="admin-input"
                style={{ maxWidth: '180px' }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting}
              className="admin-btn admin-btn--primary admin-btn--lg"
              style={{ alignSelf: 'flex-end' }}
            >
              {inviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div>
        <h3 className="admin-section-heading">Team Members ({users.length})</h3>

        {/* Role Legend */}
        <div style={{
          display: 'flex',
          gap: 'var(--admin-space-4)',
          marginBottom: 'var(--admin-space-5)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
            <span className="admin-badge admin-badge--admin">Admin</span>
            <span style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-gray-400)' }}>Full access</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
            <span className="admin-badge admin-badge--editor">Editor</span>
            <span style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-gray-400)' }}>Create & edit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-2)' }}>
            <span className="admin-badge admin-badge--viewer">Viewer</span>
            <span style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-gray-400)' }}>Read only</span>
          </div>
        </div>

        <div className="admin-card admin-card--table user-desktop-view">
          <div className="admin-table-header">
            <span className="admin-table-header-cell" style={{ flex: 2 }}>User</span>
            <span className="admin-table-header-cell" style={{ flex: 2 }}>Email</span>
            <span className="admin-table-header-cell" style={{ flex: 1, textAlign: 'center' }}>Role</span>
            {currentUserRole === 'admin' && (
              <span className="admin-table-header-cell" style={{ flex: 1.5, textAlign: 'right' }}>Change Role</span>
            )}
          </div>

          {users.map((user) => (
            <div key={user.id} className="admin-table-row">
              <span className="admin-table-cell" style={{ flex: 2, fontWeight: 600 }}>
                {user.full_name || '—'}
              </span>
              <span className="admin-table-cell" style={{ flex: 2, color: 'var(--admin-gray-500)' }}>
                {user.email}
              </span>
              <span style={{ flex: 1, textAlign: 'center' }}>
                <span className={`admin-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </span>
              {currentUserRole === 'admin' && (
                <span style={{ flex: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as AppRole)}
                    className="admin-input"
                    style={{ maxWidth: '140px', padding: '6px 10px', fontSize: 'var(--admin-text-xs)' }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile User Cards */}
        <div className="user-mobile-view" style={{ display: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
            {users.map((user) => (
              <div key={user.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h3 className="admin-mobile-card__title">{user.full_name || '—'}</h3>
                    <p style={{
                      fontFamily: 'var(--admin-font-body)',
                      fontSize: 'var(--admin-text-xs)',
                      color: 'var(--admin-gray-400)',
                      margin: 0,
                    }}>
                      {user.email}
                    </p>
                  </div>
                  <span className={`admin-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                {currentUserRole === 'admin' && (
                  <div style={{ marginTop: 'var(--admin-space-3)' }}>
                    <label className="admin-label" style={{ marginBottom: 'var(--admin-space-1)' }}>Change Role</label>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as AppRole)}
                      className="admin-input"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @media (max-width: 768px) {
            .user-desktop-view { display: none !important; }
            .user-mobile-view { display: block !important; }
            .user-invite-fields {
              flex-direction: column !important;
            }
            .user-invite-fields > div {
              min-width: 100% !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
