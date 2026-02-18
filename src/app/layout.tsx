import type { Metadata } from 'next'
import { Merriweather, Open_Sans } from 'next/font/google'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import TrackCtaClicks from '@/components/analytics/TrackCtaClicks'
import './globals.css'

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const BASE_URL = 'https://www.smilerightdental.org'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Smile Right - Dr. Sneha Kedia | Best Dentist in Kandivali, Malad & Borivali',
  description:
    'Smile Right - Dr. Sneha Kedia, Dental Surgeon & Implantologist in Kandivali East, Mumbai, serving nearby Malad and Borivali. Expert dental care including implants, root canal, braces, cosmetic dentistry & more. Book appointment: 7977991130',
  keywords:
    'dentist kandivali, dentist malad, dentist borivali, dentist near me, dental clinic mumbai, dental implants, root canal treatment, braces, cosmetic dentistry, dr sneha kedia, smile right dental clinic, kandivali east dentist, teeth whitening mumbai, emergency dentist mumbai, best dentist kandivali, best dentist malad, best dentist borivali, painless root canal, dental clinic thakur village',
  authors: [{ name: 'Dr. Sneha Kedia' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Smile Right - Dr. Sneha Kedia | Dental Surgeon & Implantologist',
    description:
      'Expert dental care in Kandivali East, Mumbai, serving patients from Malad and Borivali. Specializing in dental implants, root canal, braces, and cosmetic dentistry.',
    type: 'website',
    url: BASE_URL,
    siteName: 'Smile Right Dental Clinic',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smile Right - Dr. Sneha Kedia | Dentist in Kandivali, Malad & Borivali',
    description: 'Expert dental care in Kandivali East, Mumbai, serving Malad and Borivali. Dental implants, root canal, braces, and cosmetic dentistry.',
  },
  alternates: {
    canonical: BASE_URL,
  },
  formatDetection: {
    telephone: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  '@id': `${BASE_URL}/#dentist`,
  name: 'Smile Right - Multispecialty Dental Clinic & Implant Centre',
  description: 'Multispecialty Dental Clinic & Implant Centre in Kandivali East, Mumbai, serving nearby Malad and Borivali with dental implants, root canal, braces, teeth whitening, and emergency dental care.',
  url: BASE_URL,
  image: `${BASE_URL}/images/PHOTO-2025-12-27-16-54-33.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Shop No. 31, Gokul Nagar 2, CDE Wing, Opp. Gokul Concorde, Thakur Village',
    addressLocality: 'Kandivali East',
    addressRegion: 'Mumbai',
    postalCode: '400101',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '19.214462',
    longitude: '72.868988',
  },
  telephone: '+91-7977991130',
  email: 'smilerightdentalclinic@gmail.com',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '14:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '17:00',
      closes: '21:00',
    },
  ],
  priceRange: '$$',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, Debit Card, UPI',
  medicalSpecialty: ['Dentistry', 'Oral Surgery', 'Implantology', 'Orthodontics', 'Cosmetic Dentistry'],
  areaServed: [
    { '@type': 'City', name: 'Kandivali East' },
    { '@type': 'City', name: 'Malad' },
    { '@type': 'City', name: 'Borivali' },
    { '@type': 'City', name: 'Mumbai' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dental Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dental Implants' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Root Canal Treatment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Teeth Whitening' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Braces & Orthodontics' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cosmetic Dentistry' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Emergency Dental Care' } },
    ],
  },
  physician: {
    '@type': 'Physician',
    name: 'Dr. Sneha Kedia',
    jobTitle: 'Dental Surgeon and Implantologist',
    medicalSpecialty: 'Dentistry',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop No. 31, Gokul Nagar 2, CDE Wing, Opp. Gokul Concorde, Thakur Village',
      addressLocality: 'Kandivali East',
      addressRegion: 'Mumbai',
      postalCode: '400101',
      addressCountry: 'IN',
    },
    telephone: '+91-7977991130',
    worksFor: {
      '@id': `${BASE_URL}/#dentist`,
    },
  },
  sameAs: [
    'https://www.instagram.com/smilerightdentalclinic',
  ],
}

// FAQ Schema for rich results
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are your clinic timings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are open Monday to Saturday from 9:00 AM - 2:00 PM and 5:00 PM - 9:00 PM. Sunday appointments are available by prior booking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you accept insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, we work with most major insurance providers. Please bring your insurance card for verification, and we'll help you maximize your benefits.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is the dental treatment painful?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use advanced painless dentistry techniques and modern anesthesia to ensure maximum comfort. Most patients report minimal to no discomfort during procedures.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I book an appointment at Smile Right Dental Clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can book an appointment by calling us at 7977991130, sending a WhatsApp message, or visiting our clinic directly. We offer same-day appointments for emergencies.',
      },
    },
    {
      '@type': 'Question',
      name: 'What dental services do you provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer comprehensive dental care including dental implants, root canal treatment, braces, teeth whitening, cosmetic dentistry, pediatric dentistry, and preventive care.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you handle dental emergencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, we provide emergency dental care. Please call us immediately at 7977991130, and we'll arrange to see you as soon as possible.",
      },
    },
    {
      '@type': 'Question',
      name: 'How much do dental treatments cost at Smile Right?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Treatment costs vary based on individual needs. We provide transparent pricing and detailed treatment plans before starting any procedure. Call us for a free consultation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is parking available at the clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, convenient parking facilities are available near our clinic at Thakur Village, Kandivali East.',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${merriweather.variable} ${openSans.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        {GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
            <TrackCtaClicks />
          </>
        )}
        {children}
      </body>
    </html>
  )
}
