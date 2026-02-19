import { createClient } from '@/lib/supabase/server'
import BlogForm from '@/components/admin/BlogForm'
import type { Blog } from '@/lib/types'
import { adminPageTitleStyle } from '@/styles/admin'

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">
        Edit Blog
      </h1>
      <BlogForm blog={(blog as Blog) ?? undefined} />
    </div>
  )
}
