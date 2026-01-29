import type { Metadata } from 'next'
import { Merriweather, Open_Sans } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Smile Right - Dr. Sneha Kedia | Best Dentist in Kandivali East, Mumbai',
  description:
    'Smile Right - Dr. Sneha Kedia, Dental Surgeon & Implantologist in Kandivali East, Mumbai. Expert dental care including implants, root canal, braces, cosmetic dentistry & more. Book appointment: 7977991130',
  keywords:
    'dentist kandivali, dental clinic mumbai, dental implants, root canal treatment, braces, cosmetic dentistry, dr sneha kedia, smile right dental clinic, kandivali east dentist, teeth whitening mumbai',
  authors: [{ name: 'Dr. Sneha Kedia' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Smile Right - Dr. Sneha Kedia | Dental Surgeon & Implantologist',
    description:
      'Expert dental care in Kandivali East, Mumbai. Specializing in dental implants, root canal, braces, and cosmetic dentistry.',
    type: 'website',
  },
  formatDetection: {
    telephone: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: 'Smile Right - Multispecialty Dental Clinic & Implant Centre',
  description: 'Multispecialty Dental Clinic & Implant Centre in Kandivali East, Mumbai',
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
    latitude: '19.2056',
    longitude: '72.8690',
  },
  telephone: '+91-7977991130',
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
  medicalSpecialty: ['Dentistry', 'Oral Surgery', 'Implantology'],
  physician: {
    '@type': 'Physician',
    name: 'Dr. Sneha Kedia',
    jobTitle: 'Dental Surgeon and Implantologist',
    medicalSpecialty: 'Dentistry',
  },
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
      </head>
      <body>{children}</body>
    </html>
  )
}
