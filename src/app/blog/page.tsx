import Link from 'next/link'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import { createClient } from '@/lib/supabase/server'
import type { Blog } from '@/lib/types'

export const revalidate = 3600

export default async function BlogIndexPage() {
  const supabase = await createClient()

  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  const items = (blogs as Pick<Blog, 'id' | 'title' | 'slug' | 'excerpt' | 'published_at' | 'created_at'>[]) ?? []

  return (
    <>
      <FloatingWhatsApp />
      <Header />

      <main style={{ paddingTop: '170px' }}>
        <section className="blog-index">
          <div className="container">
            <h1 className="section-title">Blog</h1>
            <p className="section-subtitle">Articles and updates from Smile Right.</p>

            {items.length === 0 ? (
              <p className="section-subtitle">No posts yet.</p>
            ) : (
              <div className="blog-index-list">
                {items.map((b) => (
                  <Link key={b.id} href={`/blog/${b.slug}`} className="blog-index-item">
                    <h3 className="blog-index-title">{b.title}</h3>
                    {b.excerpt ? <p className="blog-index-excerpt">{b.excerpt}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
