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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    setDeletingId(id)
    try {
      await deleteBlog(id)
      router.refresh()
    } catch {
      alert('Failed to delete blog post')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const result = await toggleBlogPublish(id, !isPublished)
      if (result && 'pending' in result) {
        alert('Your publish request has been submitted for admin approval.')
      }
      router.refresh()
    } catch {
      alert('Failed to update blog')
    }
  }

  if (blogs.length === 0) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-state__title">No blog posts yet</p>
        <p className="admin-empty-state__description">Start writing your first blog post to engage your audience.</p>
        <button
          onClick={() => router.push('/admin/blogs/new')}
          className="admin-btn admin-btn--primary admin-btn--lg"
        >
          Create Your First Blog
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="admin-card admin-card--table blog-desktop-view">
        <div className="admin-table-header">
          <span className="admin-table-header-cell" style={{ flex: 3 }}>Title</span>
          <span className="admin-table-header-cell" style={{ flex: 2 }}>Slug</span>
          <span className="admin-table-header-cell" style={{ flex: 1, textAlign: 'center' }}>Status</span>
          <span className="admin-table-header-cell" style={{ flex: 1, textAlign: 'center' }}>Date</span>
          {isEditor && <span className="admin-table-header-cell" style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>}
        </div>

        {blogs.map((blog) => (
          <div key={blog.id} className="admin-table-row">
            <span className="admin-table-cell" style={{ flex: 3, fontWeight: 600 }}>{blog.title}</span>
            <span className="admin-table-cell" style={{
              flex: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--admin-gray-400)',
              fontSize: 'var(--admin-text-xs)',
              fontFamily: 'monospace',
            }}>
              /blog/{blog.slug}
            </span>
            <span style={{ flex: 1, textAlign: 'center' }}>
              <span className={`admin-badge ${blog.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                {blog.is_published ? 'Published' : 'Draft'}
              </span>
            </span>
            <span className="admin-table-cell" style={{
              flex: 1,
              textAlign: 'center',
              color: 'var(--admin-gray-400)',
              fontSize: 'var(--admin-text-xs)',
            }}>
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
            {isEditor && (
              <span style={{ flex: 1.5, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleTogglePublish(blog.id, blog.is_published)}
                  className="admin-btn admin-btn--secondary"
                >
                  {canPublish
                    ? (blog.is_published ? 'Unpublish' : 'Publish')
                    : (blog.is_published ? 'Request Unpublish' : 'Request Publish')}
                </button>
                <Link href={`/admin/blogs/${blog.id}/edit`} className="admin-btn admin-btn--primary">
                  Edit
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deletingId === blog.id}
                    className="admin-btn admin-btn--danger-outline"
                  >
                    {deletingId === blog.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="blog-mobile-view" style={{ display: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
          {blogs.map((blog) => (
            <div key={blog.id} className="admin-mobile-card">
              <div className="admin-mobile-card__header">
                <h3 className="admin-mobile-card__title">{blog.title}</h3>
                <span className={`admin-badge ${blog.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                  {blog.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="admin-mobile-card__text" style={{ fontSize: 'var(--admin-text-xs)', color: 'var(--admin-gray-400)' }}>
                /blog/{blog.slug} · {new Date(blog.created_at).toLocaleDateString()}
              </p>
              {isEditor && (
                <div className="admin-mobile-card__actions">
                  <button
                    onClick={() => handleTogglePublish(blog.id, blog.is_published)}
                    className="admin-btn admin-btn--secondary"
                  >
                    {canPublish
                      ? (blog.is_published ? 'Unpublish' : 'Publish')
                      : (blog.is_published ? 'Request Unpublish' : 'Request Publish')}
                  </button>
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="admin-btn admin-btn--primary">
                    Edit
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(blog.id)}
                      disabled={deletingId === blog.id}
                      className="admin-btn admin-btn--danger-outline"
                    >
                      {deletingId === blog.id ? 'Deleting...' : 'Delete'}
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
          .blog-desktop-view { display: none !important; }
          .blog-mobile-view { display: block !important; }
        }
      `}</style>
    </>
  )
}
