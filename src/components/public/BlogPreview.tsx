import Link from 'next/link'
import type { Blog } from '@/lib/types'

export default function BlogPreview({ blogs }: { blogs: Pick<Blog, 'id' | 'title' | 'slug'>[] }) {
  if (!blogs || blogs.length === 0) return null

  return (
    <section className="blog-preview" id="blog">
      <div className="container">
        <h2 className="section-title">Blog</h2>
        <p className="section-subtitle">
          Latest updates and helpful dental tips.
        </p>

        <div className="blog-preview-list">
          {blogs.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="blog-preview-item">
              {b.title}
            </Link>
          ))}
        </div>

        <div className="blog-preview-cta">
          <Link href="/blog" className="btn btn-outline">
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  )
}
