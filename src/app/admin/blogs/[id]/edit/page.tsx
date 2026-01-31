import { createClient } from '@/lib/supabase/server'
import BlogForm from '@/components/admin/BlogForm'
import type { Blog } from '@/lib/types'

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
    <div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#292828',
        marginBottom: '1.5rem',
      }}>
        Edit Blog
      </h1>
      <BlogForm blog={(blog as Blog) ?? undefined} />
    </div>
  )
}
