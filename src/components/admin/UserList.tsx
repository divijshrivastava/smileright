'use client'

import { useState } from 'react'
import { inviteUser, updateUserRole } from '@/app/admin/actions'
import type { Profile, AppRole } from '@/lib/types'
import { getRoleLabel, getRoleDescription } from '@/lib/permissions'

interface UserListProps {
  users: Profile[]
  currentUserId: string
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<AppRole>('viewer')

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === currentUserId) {
      alert('You cannot change your own role')
      return
    }

    setUpdating(userId)
    try {
      await updateUserRole(userId, newRole)
      // Use hard refresh to avoid hydration mismatch
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update role')
      setUpdating(null)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()

    setInviting(true)
    try {
      const result = await inviteUser(inviteEmail, inviteRole, inviteName)
      if (!result.success) {
        alert(result.error || 'Failed to invite user')
        setInviting(false)
        return
      }
      alert('Invitation sent. The user will receive an email to set their password.')
      setInviteEmail('')
      setInviteName('')
      setInviteRole('viewer')
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to invite user')
      setInviting(false)
    }
  }

  const formatJoinedDate = (isoDate: string) => {
    const parsed = new Date(isoDate)
    if (Number.isNaN(parsed.getTime())) return 'Unknown'
    // Use an explicit locale + UTC so SSR and client render identical text.
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed)
  }

  if (users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No users found.</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.inviteCard}>
        <h3 style={styles.inviteTitle}>Add User</h3>
        <p style={styles.inviteSubtitle}>
          Send an invitation email from Supabase. The user can then set their password and sign in.
        </p>
        <p style={styles.inviteHint}>
          If invite links do not open the password setup screen, add `/auth/set-password` to Supabase Auth Redirect URLs.
        </p>

        <form onSubmit={handleInviteUser} style={styles.inviteForm}>
          <div style={styles.inviteFields}>
            <input
              type="email"
              placeholder="Email address"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Full name (optional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              style={styles.input}
              maxLength={150}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AppRole)}
              style={styles.select}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={inviting}
            style={{
              ...styles.inviteButton,
              opacity: inviting ? 0.7 : 1,
            }}
          >
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={{ ...styles.cell, flex: 2 }}>User</div>
          <div style={{ ...styles.cell, flex: 1 }}>Current Role</div>
          <div style={{ ...styles.cell, flex: 1.5 }}>Change Role</div>
        </div>
        {users.map((user) => (
          <div key={user.id} style={styles.tableRow}>
            <div style={{ ...styles.cell, flex: 2 }}>
              <div style={styles.userInfo}>
                <p style={styles.userName}>{user.full_name || 'No name'}</p>
                <p style={styles.userEmail}>{user.email}</p>
                <p style={styles.userDate}>
                  Joined: {formatJoinedDate(user.created_at)}
                </p>
              </div>
            </div>
            <div style={{ ...styles.cell, flex: 1 }}>
              <span
                style={{
                  ...styles.roleBadge,
                  background:
                    user.role === 'admin'
                      ? '#1B73BA'
                      : user.role === 'editor'
                      ? '#28a745'
                      : '#6c757d',
                }}
              >
                {getRoleLabel(user.role)}
              </span>
              <p style={styles.roleDescription}>{getRoleDescription(user.role)}</p>
            </div>
            <div style={{ ...styles.cell, flex: 1.5 }}>
              {user.id === currentUserId ? (
                <span style={styles.selfLabel}>This is you</span>
              ) : (
                <div style={styles.selectWrapper}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as AppRole)}
                    disabled={updating === user.id}
                    style={{
                      ...styles.select,
                      opacity: updating === user.id ? 0.5 : 1,
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {updating === user.id && (
                    <span style={styles.updating}>Updating...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>Role Descriptions</h4>
        <div style={styles.legendItem}>
          <span style={{ ...styles.roleBadge, background: '#1B73BA' }}>Admin</span>
          <span style={styles.legendText}>Full access. Can manage users, approve changes, and publish instantly.</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.roleBadge, background: '#28a745' }}>Editor</span>
          <span style={styles.legendText}>Can create and edit content. Requires admin approval to publish.</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.roleBadge, background: '#6c757d' }}>Viewer</span>
          <span style={styles.legendText}>Read-only access to the admin dashboard.</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  inviteCard: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '20px',
  },
  inviteTitle: {
    margin: 0,
    fontFamily: 'var(--font-serif)',
    fontSize: '1.2rem',
    color: '#292828',
  },
  inviteSubtitle: {
    margin: '8px 0 14px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#666',
  },
  inviteHint: {
    margin: '0 0 14px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    color: '#7a7a7a',
  },
  inviteForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  inviteFields: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d5d7db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    minWidth: '220px',
    flex: 1,
  },
  table: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #ddd',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    background: '#f8f9fa',
    borderBottom: '2px solid #ddd',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#292828',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #eee',
  },
  cell: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#292828',
    margin: 0,
  },
  userEmail: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  userDate: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#999',
    margin: 0,
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    width: 'fit-content',
  },
  roleDescription: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#666',
    margin: '8px 0 0',
    lineHeight: 1.4,
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    maxWidth: '180px',
  },
  inviteButton: {
    padding: '10px 16px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    minHeight: '42px',
  },
  updating: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#1B73BA',
  },
  selfLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999',
    fontFamily: 'var(--font-sans)',
  },
  legend: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  legendTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    color: '#292828',
    margin: '0 0 1rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  legendText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#666',
  },
}
