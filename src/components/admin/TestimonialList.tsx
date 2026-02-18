'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteTestimonial, togglePublish } from '@/app/admin/actions'
import type { Testimonial, AppRole } from '@/lib/types'
import { canEditContent, canDeleteContent, canPublishDirectly } from '@/lib/permissions'

interface TestimonialListProps {
  testimonials: Testimonial[]
  userRole: AppRole
}

export default function TestimonialList({ testimonials, userRole }: TestimonialListProps) {
  const isEditor = canEditContent(userRole)
  const isAdmin = canDeleteContent(userRole)
  const canPublish = canPublishDirectly(userRole)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    setDeletingId(id)
    try {
      await deleteTestimonial(id)
      router.refresh()
    } catch {
      alert('Failed to delete testimonial')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const result = await togglePublish(id, !isPublished)
      if (result && 'pending' in result) {
        alert('Your publish request has been submitted for admin approval.')
      }
      router.refresh()
    } catch {
      alert('Failed to update testimonial')
    }
  }

  if (testimonials.length === 0) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-state__title">No testimonials yet</p>
        <p className="admin-empty-state__description">Create your first patient testimonial to get started.</p>
        <button
          onClick={() => router.push('/admin/testimonials/new')}
          className="admin-btn admin-btn--primary admin-btn--lg"
        >
          Create Your First Testimonial
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="admin-card admin-card--table testimonial-desktop-view">
        <div className="admin-table-header">
          <span className="admin-table-header-cell" style={{ flex: 2 }}>Author</span>
          <span className="admin-table-header-cell" style={{ flex: 3 }}>Testimonial</span>
          <span className="admin-table-header-cell" style={{ flex: 0.7, textAlign: 'center' }}>Rating</span>
          <span className="admin-table-header-cell" style={{ flex: 1, textAlign: 'center' }}>Status</span>
          {isEditor && <span className="admin-table-header-cell" style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>}
        </div>

        {testimonials.map((t) => (
          <div key={t.id} className="admin-table-row">
            <span className="admin-table-cell" style={{ flex: 2, fontWeight: 600 }}>{t.name}</span>
            <span className="admin-table-cell" style={{
              flex: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--admin-gray-500)',
            }}>
              {t.description}
            </span>
            <span className="admin-table-cell" style={{ flex: 0.7, textAlign: 'center', color: 'var(--admin-warning-500)' }}>
              {'★'.repeat(t.rating)}
            </span>
            <span style={{ flex: 1, textAlign: 'center' }}>
              <span className={`admin-badge ${t.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                {t.is_published ? 'Published' : 'Draft'}
              </span>
            </span>
            {isEditor && (
              <span style={{ flex: 1.5, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleTogglePublish(t.id, t.is_published)}
                  className="admin-btn admin-btn--secondary"
                >
                  {canPublish
                    ? (t.is_published ? 'Unpublish' : 'Publish')
                    : (t.is_published ? 'Request Unpublish' : 'Request Publish')}
                </button>
                <Link href={`/admin/testimonials/${t.id}/edit`} className="admin-btn admin-btn--primary">
                  Edit
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="admin-btn admin-btn--danger-outline"
                  >
                    {deletingId === t.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="testimonial-mobile-view" style={{ display: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
          {testimonials.map((t) => (
            <div key={t.id} className="admin-mobile-card">
              <div className="admin-mobile-card__header">
                <div>
                  <h3 className="admin-mobile-card__title">{t.name}</h3>
                  <span style={{ color: 'var(--admin-warning-500)', fontSize: 'var(--admin-text-sm)' }}>
                    {'★'.repeat(t.rating)}
                  </span>
                </div>
                <span className={`admin-badge ${t.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                  {t.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="admin-mobile-card__text">{t.description}</p>
              {isEditor && (
                <div className="admin-mobile-card__actions">
                  <button
                    onClick={() => handleTogglePublish(t.id, t.is_published)}
                    className="admin-btn admin-btn--secondary"
                  >
                    {canPublish
                      ? (t.is_published ? 'Unpublish' : 'Publish')
                      : (t.is_published ? 'Request Unpublish' : 'Request Publish')}
                  </button>
                  <Link href={`/admin/testimonials/${t.id}/edit`} className="admin-btn admin-btn--primary">
                    Edit
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      className="admin-btn admin-btn--danger-outline"
                    >
                      {deletingId === t.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .testimonial-desktop-view { display: none !important; }
          .testimonial-mobile-view { display: block !important; }
        }
      `}</style>
    </>
  )
}
