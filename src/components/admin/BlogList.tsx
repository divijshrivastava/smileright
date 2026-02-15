'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteBlog, toggleBlogPublish } from '@/app/admin/actions'
import type { Blog, AppRole } from '@/lib/types'
import { canEditContent, canDeleteContent, canPublishDirectly } from '@/lib/permissions'

interface BlogListProps {
  blogs: Blog[]
  userRole: AppRole
}

export default function BlogList({ blogs, userRole }: BlogListProps) {
  const isEditor = canEditContent(userRole)
  const isAdmin = canDeleteContent(userRole)
  const canPublish = canPublishDirectly(userRole)
  const router = useRouter()
  const [actionId, setActionId] = useState<string | null>(null)

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActionId(id)
    try {
      const result = await toggleBlogPublish(id, !currentStatus)
      if (result && 'pending' in result) {
        alert('Your publish request has been submitted for admin approval.')
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
    setActionId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    setActionId(id)
    try {
      await deleteBlog(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
    setActionId(null)
  }

  if (blogs.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No blog posts yet.</p>
        <Link href="/admin/blogs/new" style={styles.addLink}>
          Create your first blog post
        </Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.table} className="blogs-table-desktop">
        <div style={styles.header}>
          <span style={{ ...styles.headerCell, flex: 3 }}>Title</span>
          <span style={{ ...styles.headerCell, flex: 2 }}>Slug</span>
          <span style={{ ...styles.headerCell, flex: 1 }}>Status</span>
          <span style={{ ...styles.headerCell, flex: 2 }}>Actions</span>
        </div>

        {blogs.map((b) => (
          <div key={b.id} style={styles.row}>
            <span style={{ ...styles.cell, flex: 3, fontWeight: 700 }}>{b.title}</span>
            <span style={{ ...styles.cell, flex: 2, color: '#666' }}>{b.slug}</span>
            <span style={{ ...styles.cell, flex: 1 }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: b.is_published ? '#e6f4ea' : '#fef3e0',
                color: b.is_published ? '#1e7e34' : '#bf6c00',
              }}>
                {b.is_published ? 'Published' : 'Draft'}
              </span>
            </span>
            <span style={{ ...styles.cell, flex: 2, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isEditor && (
                <button
                  onClick={() => handleTogglePublish(b.id, b.is_published)}
                  disabled={actionId === b.id}
                  style={styles.actionBtn}
                >
                  {canPublish
                    ? (b.is_published ? 'Unpublish' : 'Publish')
                    : (b.is_published ? 'Request Unpublish' : 'Request Publish')}
                </button>
              )}
              {isEditor && (
                <Link href={`/admin/blogs/${b.id}/edit`} style={styles.editLink}>
                  Edit
                </Link>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={actionId === b.id}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div style={styles.mobileCards} className="blogs-cards-mobile">
        {blogs.map((b) => (
          <div key={b.id} style={styles.mobileCard}>
            <div style={styles.mobileCardHeader}>
              <div>
                <h3 style={styles.mobileTitle}>{b.title}</h3>
                <div style={styles.mobileSlug}>/blog/{b.slug}</div>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: b.is_published ? '#e6f4ea' : '#fef3e0',
                color: b.is_published ? '#1e7e34' : '#bf6c00',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
              }}>
                {b.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div style={styles.mobileActions}>
              {isEditor && (
                <button
                  onClick={() => handleTogglePublish(b.id, b.is_published)}
                  disabled={actionId === b.id}
                  style={styles.mobileActionBtn}
                >
                  {canPublish
                    ? (b.is_published ? 'Unpublish' : 'Publish')
                    : (b.is_published ? 'Request Unpublish' : 'Request Publish')}
                </button>
              )}
              {isEditor && (
                <Link href={`/admin/blogs/${b.id}/edit`} style={styles.mobileEditLink}>
                  Edit
                </Link>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={actionId === b.id}
                  style={styles.mobileDeleteBtn}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .blogs-cards-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .blogs-table-desktop {
            display: none !important;
          }
          .blogs-cards-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  table: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    padding: '16px 20px',
    background: '#f9f9f9',
    borderBottom: '1px solid #e0e0e0',
  },
  headerCell: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  row: {
    display: 'flex',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
  },
  cell: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#292828',
  },
  actionBtn: {
    padding: '6px 12px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  editLink: {
    padding: '6px 12px',
    background: '#1B73BA',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.8rem',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#fff',
    border: '1px solid #c00',
    color: '#c00',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  mobileCards: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  mobileCard: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    padding: '20px',
    border: '1px solid #e0e0e0',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  mobileTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#292828',
    margin: '0 0 6px 0',
  },
  mobileSlug: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#666',
  },
  mobileActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  mobileActionBtn: {
    flex: '1 1 auto',
    minWidth: '110px',
    padding: '12px 16px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    textAlign: 'center' as const,
  },
  mobileEditLink: {
    flex: '1 1 auto',
    minWidth: '110px',
    padding: '12px 16px',
    background: '#1B73BA',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  },
  mobileDeleteBtn: {
    flex: '1 1 auto',
    minWidth: '110px',
    padding: '12px 16px',
    background: '#fff',
    border: '2px solid #c00',
    color: '#c00',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    textAlign: 'center' as const,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: 'var(--font-sans)',
    color: '#666',
  },
  addLink: {
    display: 'inline-block',
    marginTop: '12px',
    color: '#1B73BA',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
