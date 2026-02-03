import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BlogList from '@/components/admin/BlogList'
import type { Blog, Profile } from '@/lib/types'

export default async function BlogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }} className="admin-page-header">
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2rem',
          color: '#292828',
          margin: 0,
        }}>
          Blogs
        </h1>
        <Link
          href="/admin/blogs/new"
          style={{
            padding: '10px 20px',
            background: '#1B73BA',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
          className="admin-add-btn"
        >
          Add Blog
        </Link>
      </div>

      <BlogList
        blogs={(blogs as Blog[]) ?? []}
        userRole={(profile as Pick<Profile, 'role'>)?.role ?? 'editor'}
      />
    </div>
  )
}
