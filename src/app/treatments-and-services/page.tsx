import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import ContactSection from '@/components/public/ContactSection'

const BASE_URL = 'https://www.smilerightdental.org'

export const metadata: Metadata = {
  title: 'Dental Treatments & Services | Smile Right Dental Clinic Kandivali',
  description: 'Comprehensive dental treatments in Kandivali East, Mumbai. Dental implants, root canal, teeth whitening, braces, cosmetic dentistry & emergency care by Dr. Sneha Kedia.',
  keywords: 'dental treatments Mumbai, dental services Kandivali, dentist services, dental implants, root canal treatment, teeth whitening, braces orthodontics, cosmetic dentistry, emergency dentist',
  openGraph: {
    title: 'Dental Treatments & Services | Smile Right Dental Clinic',
    description: 'Complete range of dental treatments in Kandivali East. Expert care by Dr. Sneha Kedia.',
    type: 'website',
    url: `${BASE_URL}/treatments-and-services`,
  },
  alternates: {
    canonical: `${BASE_URL}/treatments-and-services`,
  },
}

const treatments = [
  {
    slug: 'dental-implants',
    title: 'Dental Implants',
    description: 'Permanent tooth replacement solution that looks, feels, and functions like natural teeth. Restore your smile with titanium implants.',
    icon: '🦷',
    keywords: ['Missing teeth', 'Tooth replacement', 'Implant surgery'],
  },
  {
    slug: 'root-canal-treatment',
    title: 'Root Canal Treatment',
    description: 'Painless root canal therapy to save infected teeth. Modern techniques ensure comfortable treatment with quick recovery.',
    icon: '💉',
    keywords: ['Tooth pain relief', 'Infected tooth', 'Save natural teeth'],
  },
  {
    slug: 'teeth-whitening',
    title: 'Teeth Whitening',
    description: 'Professional teeth whitening for a brighter, more confident smile. Safe and effective treatments with visible results.',
    icon: '✨',
    keywords: ['Bright smile', 'Stain removal', 'Cosmetic treatment'],
  },
  {
    slug: 'braces-and-orthodontics',
    title: 'Braces & Orthodontics',
    description: 'Straighten your teeth with traditional braces or clear aligners. Customized treatment plans for children and adults.',
    icon: '😁',
    keywords: ['Teeth straightening', 'Invisalign', 'Clear aligners'],
  },
  {
    slug: 'cosmetic-dentistry',
    title: 'Cosmetic Dentistry',
    description: 'Transform your smile with veneers, bonding, and smile makeovers. Achieve the perfect smile you\'ve always wanted.',
    icon: '💎',
    keywords: ['Smile makeover', 'Veneers', 'Dental bonding'],
  },
  {
    slug: 'emergency-dental-care',
    title: 'Emergency Dental Care',
    description: 'Immediate care for dental emergencies including severe pain, broken teeth, and injuries. Same-day appointments available.',
    icon: '🚨',
    keywords: ['Urgent care', 'Tooth pain', 'Dental trauma'],
  },
]

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
  ],
}

export default function TreatmentsAndServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FloatingWhatsApp />
      <Header />

      <main className="treatments-page">
        {/* Hero Section */}
        <section className="treatments-hero">
          <div className="container">
            <h1>Dental Treatments & Services</h1>
            <p>
              Comprehensive dental care tailored to your needs. From routine checkups to advanced procedures,
              Dr. Sneha Kedia and the Smile Right team deliver exceptional results with a gentle touch.
            </p>
          </div>
        </section>

        {/* Treatments Grid */}
        <section className="treatments-grid-section">
          <div className="container">
            <div className="treatments-grid">
              {treatments.map((treatment) => (
                <Link
                  key={treatment.slug}
                  href={`/treatments-and-services/${treatment.slug}`}
                  className="treatment-card"
                >
                  <div className="treatment-icon">{treatment.icon}</div>
                  <h2>{treatment.title}</h2>
                  <p>{treatment.description}</p>
                  <div className="treatment-keywords">
                    {treatment.keywords.map((keyword) => (
                      <span key={keyword} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                  <span className="learn-more">
                    Learn More
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="treatments-cta">
          <div className="container">
            <h2>Ready to Start Your Treatment?</h2>
            <p>Book a consultation with Dr. Sneha Kedia to discuss your dental needs and treatment options.</p>
            <div className="cta-buttons">
              <a href="tel:+917977991130" className="btn btn-primary">
                📞 Call: 7977 991 130
              </a>
              <a
                href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20your%20dental%20treatments"
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
          sourcePage="/treatments-and-services"
          formLocation="treatments_services_page_bottom"
          heading="Contact Me"
          subheading="Tell us what treatment you are looking for and our team will reach out quickly."
        />
      </main>

      <Footer />
    </>
  )
}
