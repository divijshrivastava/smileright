'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole } from '@/app/admin/actions'
import type { Profile, AppRole } from '@/lib/types'
import { getRoleLabel, getRoleDescription } from '@/lib/permissions'

interface UserListProps {
  users: Profile[]
  currentUserId: string
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === currentUserId) {
      alert('You cannot change your own role')
      return
    }

    setUpdating(userId)
    try {
      await updateUserRole(userId, newRole)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setUpdating(null)
    }
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
                  Joined: {new Date(user.created_at).toLocaleDateString()}
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
