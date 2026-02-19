import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BlogList from '@/components/admin/BlogList'
import type { Blog, Profile } from '@/lib/types'
import { canEditContent } from '@/lib/permissions'
import {
  adminPageHeaderWrapStyle,
  adminPageTitleInHeaderStyle,
  adminPrimaryActionLinkCompactStyle,
} from '@/styles/admin'

export default async function BlogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const role = (profile as Pick<Profile, 'role'>)?.role ?? 'viewer'

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="admin-page-content">
      <div style={adminPageHeaderWrapStyle} className="admin-page-header">
        <h1 style={adminPageTitleInHeaderStyle} className="admin-page-title">
          Blogs
        </h1>
        {canEditContent(role) && (
          <Link
            href="/admin/blogs/new"
            style={adminPrimaryActionLinkCompactStyle}
            className="admin-add-btn admin-primary-btn"
          >
            Add Blog
          </Link>
        )}
      </div>

      <BlogList
        blogs={(blogs as Blog[]) ?? []}
        userRole={role}
      />
    </div>
  )
}
