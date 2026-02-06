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
    .limit(50)

  const items = (blogs as Pick<Blog, 'id' | 'title' | 'slug' | 'excerpt' | 'main_image_url' | 'main_image_alt_text' | 'published_at' | 'created_at'>[]) ?? []

  // Separate featured post (most recent) from others
  const featuredPost = items.length > 0 ? items[0] : null
  const regularPosts = items.length > 1 ? items.slice(1) : []

  return (
    <>
      <FloatingWhatsApp />
      <Header />

      <main className="blog-page-main">
        {/* Hero Section */}
        <section className="blog-hero">
          <div className="blog-hero-background">
            <div className="blog-hero-gradient"></div>
            <div className="blog-hero-pattern"></div>
          </div>
          <div className="container">
            <div className="blog-hero-content">
              <div className="blog-hero-badge">
                <svg className="blog-hero-badge-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10.163 5.38L15 6.12L11.5 9.54L12.326 14.36L8 12.1L3.674 14.36L4.5 9.54L1 6.12L5.837 5.38L8 1Z" fill="currentColor" />
                </svg>
                Dental Health Insights
              </div>
              <h1 className="blog-hero-title">
                Your Guide to a<br />
                <span className="blog-hero-title-gradient">Healthier Smile</span>
              </h1>
              <p className="blog-hero-subtitle">
                Expert tips, latest treatments, and dental care advice from our experienced team
              </p>

              {/* Stats */}
              <div className="blog-hero-stats">
                <div className="blog-hero-stat">
                  <div className="blog-hero-stat-number">{items.length}+</div>
                  <div className="blog-hero-stat-label">Articles</div>
                </div>
                <div className="blog-hero-stat-divider"></div>
                <div className="blog-hero-stat">
                  <div className="blog-hero-stat-number">Expert</div>
                  <div className="blog-hero-stat-label">Advice</div>
                </div>
                <div className="blog-hero-stat-divider"></div>
                <div className="blog-hero-stat">
                  <div className="blog-hero-stat-number">Weekly</div>
                  <div className="blog-hero-stat-label">Updates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post Section */}
        {featuredPost && (
          <section className="blog-featured-section">
            <div className="container">
              <div className="blog-section-header">
                <h2 className="blog-section-title">Featured Article</h2>
                <div className="blog-section-line"></div>
              </div>

              <Link href={`/blog/${featuredPost.slug}`} className="blog-featured-card">
                {featuredPost.main_image_url && (
                  <div className="blog-featured-image">
                    <Image
                      src={featuredPost.main_image_url}
                      alt={featuredPost.main_image_alt_text || featuredPost.title}
                      width={800}
                      height={500}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      priority
                    />
                    <div className="blog-featured-overlay"></div>
                  </div>
                )}
                <div className="blog-featured-content">
                  <div className="blog-featured-badge">Latest Post</div>
                  <h3 className="blog-featured-title">{featuredPost.title}</h3>
                  {featuredPost.excerpt && (
                    <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
                  )}
                  <div className="blog-featured-cta">
                    Read Article
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* All Posts Section */}
        {regularPosts.length > 0 && (
          <section className="blog-all-posts-section">
            <div className="container">
              <div className="blog-section-header">
                <h2 className="blog-section-title">All Articles</h2>
                <div className="blog-section-line"></div>
              </div>

              <div className="blog-grid">
                {regularPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                    {post.main_image_url && (
                      <div className="blog-card-image">
                        <Image
                          src={post.main_image_url}
                          alt={post.main_image_alt_text || post.title}
                          width={400}
                          height={250}
style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain' }}
                        />
                        <div className="blog-card-overlay"></div>
                      </div>
                    )}
                    <div className="blog-card-content">
                      <h3 className="blog-card-title">{post.title}</h3>
                      {post.excerpt && (
                        <p className="blog-card-excerpt">{post.excerpt}</p>
                      )}
                      <div className="blog-card-footer">
                        <span className="blog-card-read-more">
                          Read More
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <section className="blog-empty-state">
            <div className="container">
              <div className="blog-empty-content">
                <div className="blog-empty-icon">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <path d="M16 8H48C50.2091 8 52 9.79086 52 12V52C52 54.2091 50.2091 56 48 56H16C13.7909 56 12 54.2091 12 52V12C12 9.79086 13.7909 8 16 8Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 20H44M20 32H44M20 44H32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="blog-empty-title">No Articles Yet</h2>
                <p className="blog-empty-text">Check back soon for expert dental health tips and insights!</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
