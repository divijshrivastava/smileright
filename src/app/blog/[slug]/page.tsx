import { notFound } from 'next/navigation'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import { createClient } from '@/lib/supabase/server'
import type { Blog } from '@/lib/types'
import { sanitizeRichHtml } from '@/lib/security/input-validation'

export const revalidate = 3600

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('id, title, slug, content_html, published_at, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!blog) notFound()

  const safeHtml = sanitizeRichHtml((blog as Blog).content_html)

  return (
    <>
      <FloatingWhatsApp />
      <Header />

      <main style={{ paddingTop: '170px' }}>
        <article className="blog-post">
          <div className="container">
            <h1 className="blog-post-title">{(blog as Blog).title}</h1>
            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </article>
      </main>

      <Footer />
    </>
  )
}
