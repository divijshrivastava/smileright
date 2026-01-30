'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteTestimonial, togglePublish } from '@/app/admin/actions'
import type { Testimonial } from '@/lib/types'

interface TestimonialListProps {
  testimonials: Testimonial[]
  userRole: 'admin' | 'editor'
}

export default function TestimonialList({ testimonials, userRole }: TestimonialListProps) {
  const router = useRouter()
  const [actionId, setActionId] = useState<string | null>(null)

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActionId(id)
    try {
      await togglePublish(id, !currentStatus)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
    setActionId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    setActionId(id)
    try {
      await deleteTestimonial(id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
    setActionId(null)
  }

  if (testimonials.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No testimonials yet.</p>
        <Link href="/admin/testimonials/new" style={styles.addLink}>
          Add your first testimonial
        </Link>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Desktop Table View */}
      <div style={styles.table} className="testimonial-table-desktop">
        <div style={styles.header}>
          <span style={{ ...styles.headerCell, flex: 2 }}>Author</span>
          <span style={{ ...styles.headerCell, flex: 4 }}>Testimonial</span>
          <span style={{ ...styles.headerCell, flex: 1 }}>Rating</span>
          <span style={{ ...styles.headerCell, flex: 1 }}>Status</span>
          <span style={{ ...styles.headerCell, flex: 2 }}>Actions</span>
        </div>

        {testimonials.map((t) => (
          <div key={t.id} style={styles.row}>
            <span style={{ ...styles.cell, flex: 2, fontWeight: 600 }}>{t.name}</span>
            <span style={{ ...styles.cell, flex: 4, color: '#666' }}>
              {t.description.length > 100 ? t.description.substring(0, 100) + '...' : t.description}
            </span>
            <span style={{ ...styles.cell, flex: 1 }}>
              {'★'.repeat(t.rating)}
            </span>
            <span style={{ ...styles.cell, flex: 1 }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: t.is_published ? '#e6f4ea' : '#fef3e0',
                color: t.is_published ? '#1e7e34' : '#bf6c00',
              }}>
                {t.is_published ? 'Published' : 'Draft'}
              </span>
            </span>
            <span style={{ ...styles.cell, flex: 2, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleTogglePublish(t.id, t.is_published)}
                disabled={actionId === t.id}
                style={styles.actionBtn}
              >
                {t.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <Link href={`/admin/testimonials/${t.id}/edit`} style={styles.editLink}>
                Edit
              </Link>
              {userRole === 'admin' && (
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={actionId === t.id}
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
      <div style={styles.mobileCards} className="testimonial-cards-mobile">
        {testimonials.map((t) => (
          <div key={t.id} style={styles.mobileCard}>
            <div style={styles.mobileCardHeader}>
              <div>
                <h3 style={styles.mobileAuthor}>{t.name}</h3>
                <div style={styles.mobileRating}>
                  {'★'.repeat(t.rating)}
                </div>
              </div>
              <span style={{
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: t.is_published ? '#e6f4ea' : '#fef3e0',
                color: t.is_published ? '#1e7e34' : '#bf6c00',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
              }}>
                {t.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            
            <p style={styles.mobileText}>
              {t.description.length > 150 ? t.description.substring(0, 150) + '...' : t.description}
            </p>
            
            <div style={styles.mobileActions}>
              <button
                onClick={() => handleTogglePublish(t.id, t.is_published)}
                disabled={actionId === t.id}
                style={styles.mobileActionBtn}
              >
                {t.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <Link href={`/admin/testimonials/${t.id}/edit`} style={styles.mobileEditLink}>
                Edit
              </Link>
              {userRole === 'admin' && (
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={actionId === t.id}
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
        .testimonial-cards-mobile {
          display: none;
        }
        
        @media (max-width: 768px) {
          .testimonial-table-desktop {
            display: none !important;
          }
          
          .testimonial-cards-mobile {
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
  // Mobile Card Styles
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
  mobileAuthor: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#292828',
    margin: '0 0 6px 0',
  },
  mobileRating: {
    color: '#FFA500',
    fontSize: '1rem',
    letterSpacing: '2px',
  },
  mobileText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#666',
    margin: '0 0 16px 0',
  },
  mobileActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  mobileActionBtn: {
    flex: '1 1 auto',
    minWidth: '100px',
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
    minWidth: '100px',
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
    minWidth: '100px',
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
