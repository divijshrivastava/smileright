import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import BlogRouteScrollReset from '@/components/interactive/BlogRouteScrollReset'
import ContactSection from '@/components/public/ContactSection'
import { BASE_URL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Blog } from '@/lib/types'
import { sanitizeRichHtml } from '@/lib/security/input-validation'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('title, slug, excerpt, main_image_url, main_image_alt_text, published_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!blog) {
    return {
      title: 'Blog Post Not Found | Smile Right Dental',
    }
  }

  const title = `${blog.title} | Smile Right Dental Blog`
  const description = blog.excerpt || `Read about ${blog.title} - Expert dental insights from Dr. Sneha Kedia at Smile Right Dental Clinic, Kandivali East, serving Malad and Borivali.`

  return {
    title,
    description,
    keywords: `${blog.title}, dental blog, dental tips, oral health, Smile Right, Dr. Sneha Kedia, dentist Kandivali, dentist Malad, dentist Borivali, dentist near me`,
    authors: [{ name: 'Dr. Sneha Kedia' }],
    openGraph: {
      title: blog.title,
      description,
      type: 'article',
      url: `${BASE_URL}/blog/${blog.slug}`,
      images: blog.main_image_url
        ? [
            {
              url: blog.main_image_url,
              width: 1200,
              height: 630,
              alt: blog.main_image_alt_text || blog.title,
            },
          ]
        : [],
      siteName: 'Smile Right Dental Clinic',
      publishedTime: blog.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.main_image_url ? [blog.main_image_url] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${blog.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, content_html, main_image_url, main_image_alt_text, published_at, updated_at, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!blog) notFound()

  const typedBlog = blog as Blog
  const safeHtml = sanitizeRichHtml(typedBlog.content_html)

  // Article structured data for SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: typedBlog.title,
    description: typedBlog.excerpt || `Read about ${typedBlog.title}`,
    image: typedBlog.main_image_url || undefined,
    author: {
      '@type': 'Person',
      name: 'Dr. Sneha Kedia',
      jobTitle: 'Dental Surgeon and Implantologist',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Smile Right Dental Clinic',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    datePublished: typedBlog.published_at || typedBlog.created_at,
    dateModified: typedBlog.updated_at || typedBlog.published_at || typedBlog.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${typedBlog.slug}`,
    },
  }

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: typedBlog.title,
        item: `${BASE_URL}/blog/${typedBlog.slug}`,
      },
    ],
  }

  return (
    <>
      <BlogRouteScrollReset />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FloatingWhatsApp />
      <Header />

      <main className="blog-page-main">
        <article className="blog-post">
          <div className="container">
            <h1 className="blog-post-title">{typedBlog.title}</h1>
            {typedBlog.main_image_url && (
              <div className="blog-post-image">
                <Image
                  src={typedBlog.main_image_url}
                  alt={typedBlog.main_image_alt_text || typedBlog.title}
                  width={1200}
                  height={600}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                  priority
                />
              </div>
            )}
            <div
              className="blog-post-content"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </article>

        <ContactSection
          sourcePage={`/blog/${typedBlog.slug}`}
          formLocation="blog_post_bottom"
          heading="Contact Me"
          subheading="Have a question about this topic or your treatment options? Share it with us."
        />
      </main>

      <Footer />
    </>
  )
}
