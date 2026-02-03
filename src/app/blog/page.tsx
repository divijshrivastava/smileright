import Link from 'next/link'
import Image from 'next/image'
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
    .select('id, title, slug, excerpt, main_image_url, main_image_alt_text, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  const items = (blogs as Pick<Blog, 'id' | 'title' | 'slug' | 'excerpt' | 'main_image_url' | 'main_image_alt_text' | 'published_at' | 'created_at'>[]) ?? []

  return (
    <>
      <FloatingWhatsApp />
      <Header />

      <main className="blog-page-main">
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
                    {b.main_image_url && (
                      <div className="blog-index-image">
                        <Image
                          src={b.main_image_url}
                          alt={b.main_image_alt_text || b.title}
                          width={400}
                          height={250}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
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
