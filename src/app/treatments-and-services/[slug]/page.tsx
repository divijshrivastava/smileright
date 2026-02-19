import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import ContactSection from '@/components/public/ContactSection'
import { BASE_URL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import type { Service, ServiceImage } from '@/lib/types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const supabase = createStaticClient()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!service) {
    return { title: 'Treatment Not Found | Smile Right Dental' }
  }

  return {
    title: `${service.title} in Kandivali East, Mumbai | Smile Right Dental`,
    description: service.description,
    openGraph: {
      title: service.title,
      description: service.description,
      type: 'website',
      url: `${BASE_URL}/treatments-and-services/${slug}`,
      images: service.image_url ? [{ url: service.image_url, alt: service.alt_text }] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/treatments-and-services/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()

  const { data: services } = await supabase
    .from('services')
    .select('slug')
    .eq('is_published', true)

  return (services || []).map((service) => ({ slug: service.slug }))
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select(`
      *,
      service_images (
        id,
        image_url,
        alt_text,
        caption,
        display_order
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!service) {
    notFound()
  }

  // Sort service images by display_order
  const sortedImages = (service.service_images || [])
    .slice()
    .sort((a: ServiceImage, b: ServiceImage) => a.display_order - b.display_order)

  // Service schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: service.title,
    description: service.description,
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    provider: {
      '@type': 'Dentist',
      name: 'Smile Right - Multispecialty Dental Clinic & Implant Centre',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 31, Gokul Nagar 2, CDE Wing, Opp. Gokul Concorde, Thakur Village',
        addressLocality: 'Kandivali East',
        addressRegion: 'Mumbai',
        postalCode: '400101',
        addressCountry: 'IN',
      },
      telephone: '+91-7977991130',
    },
  }

  // Breadcrumb schema
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
        name: 'Treatments & Services',
        item: `${BASE_URL}/treatments-and-services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.title,
        item: `${BASE_URL}/treatments-and-services/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FloatingWhatsApp />
      <Header />

      <main className="treatment-detail-page">
        {/* Hero Section */}
        <section className="treatment-hero">
          <div className="container">
            <nav className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/treatments-and-services">Treatments & Services</Link>
              <span>/</span>
              <span>{service.title}</span>
            </nav>
            <h1>{service.title}</h1>
            <p>{service.description}</p>
          </div>
        </section>

        {/* Main Image Section */}
        {service.image_url && (
          <section className="treatment-image-section">
            <div className="container">
              <div className="main-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Image
                  src={service.image_url}
                  alt={service.alt_text}
                  width={800}
                  height={500}
                  style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </section>
        )}

        {/* Additional Images Gallery */}
        {sortedImages.length > 0 && (
          <section className="treatment-gallery">
            <div className="container">
              <h2>Gallery</h2>
              <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {sortedImages.map((img: ServiceImage) => (
                  <div key={img.id} className="gallery-item">
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || service.title}
                      width={300}
                      height={225}
                      style={{ width: '100%', height: '225px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    {img.caption && <p className="image-caption" style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="treatment-cta">
          <div className="container">
            <h2>Ready to Get Started?</h2>
            <p>Book a consultation with Dr. Sneha Kedia to discuss your {service.title.toLowerCase()} options.</p>
            <div className="cta-buttons">
              <a href="tel:+917977991130" className="btn btn-primary">
                📞 Call: 7977 991 130
              </a>
              <a
                href={`https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20${encodeURIComponent(service.title)}`}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </section>

        <ContactSection
          sourcePage={`/treatments-and-services/${slug}`}
          formLocation="treatment_detail_page_bottom"
          serviceInterest={service.title}
          heading="Contact Me"
          subheading={`Have questions about ${service.title}? Send a message and we will contact you soon.`}
        />
      </main>

      <Footer />
    </>
  )
}
