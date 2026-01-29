import Image from 'next/image'

const services = [
  {
    title: 'Root Canal',
    description: 'Advanced endodontic therapy to save natural teeth and eliminate pain.',
    image: '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG',
    alt: 'Root Canal Treatment',
  },
  {
    title: 'Dental Implants',
    description: 'Permanent solutions for missing teeth with cutting-edge implant technology.',
    image: '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG',
    alt: 'Dental Implants',
  },
  {
    title: 'Braces',
    description: 'Traditional and invisible braces for perfectly aligned smiles.',
    image: '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg',
    alt: 'Braces & Orthodontics',
  },
  {
    title: 'Tooth Whitening',
    description: 'Professional whitening treatments for a radiant, confident smile.',
    image: '/images/PHOTO-2025-12-27-16-54-33.jpg',
    alt: 'Teeth Whitening',
  },
  {
    title: 'Cosmetic Dentistry',
    description: "Transformative aesthetic procedures to enhance your smile's beauty.",
    image: '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG',
    alt: 'Cosmetic Dentistry',
  },
  {
    title: 'Crown & Bridge',
    description: 'Durable restorations to rebuild and replace damaged or missing teeth.',
    image: '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG',
    alt: 'Crown & Bridge',
  },
  {
    title: 'Kids Dentistry',
    description: 'Gentle, specialized care for children in a fun, friendly setting.',
    image: '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg',
    alt: 'Pediatric Dentistry',
  },
  {
    title: 'Fillings',
    description: 'Tooth-colored composite fillings for natural-looking cavity repair.',
    image: '/images/PHOTO-2025-12-27-16-54-33.jpg',
    alt: 'Dental Fillings',
  },
  {
    title: 'Gum Treatment',
    description: 'Periodontal therapy to maintain healthy gums and prevent disease.',
    image: '/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG',
    alt: 'Gum Treatment',
  },
  {
    title: 'Dentures',
    description: 'Custom complete and partial dentures for functional, beautiful smiles.',
    image: '/images/a01cc978-36e0-491b-87ee-9ebcd8d4617d.JPG',
    alt: 'Dentures',
  },
  {
    title: 'Extraction',
    description: 'Safe, painless tooth removal with comprehensive aftercare support.',
    image: '/images/80d2dae8-ec12-41ea-b93f-1e73fcb4ba38.jpg',
    alt: 'Tooth Extraction',
  },
]

export default function FeaturedServices() {
  return (
    <section id="services" className="featured-services">
      <div className="container">
        <h2 className="section-title">Our Featured Services</h2>
        <p className="section-subtitle">
          Comprehensive dental care tailored to your unique needs, delivered with precision and care.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <div className="service-image">
                <Image
                  src={service.image}
                  alt={service.alt}
                  width={400}
                  height={200}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="service-info">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
