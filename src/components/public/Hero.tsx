import Image from 'next/image'

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Full-bleed background image */}
      <div className="hero-image-container">
        <Image
          src="/images/hero-image.jpg"
          alt="Smile Right Dental Clinic - Modern dental care in Mumbai"
          fill
          priority
          quality={85}
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="hero-overlay" />
      </div>
      
      {/* Content positioned over the image */}
      <div className="hero-content-wrapper">
        <div className="hero-content">
          <div className="hero-badge">✨ Trusted by 1000+ Families</div>
          <h1>Smile Right</h1>
          <p className="hero-subtitle">Multi-Speciality Dental Clinic and Implant Center</p>
          <p className="hero-doctor">Dr. Sneha Kedia, B.D.S</p>
          <p className="hero-specialty">Dental Surgeon & Implantologist</p>
          <div className="hero-features">
            <span className="hero-feature">✓ Same-Day Appointments</span>
            <span className="hero-feature">✓ Cost Effective Dentistry</span>
            <span className="hero-feature">✓ Minimally Invasive Treatments</span>
          </div>
          <div className="hero-buttons">
            <a href="tel:+917977991130" className="btn btn-primary btn-large">
              <span className="btn-icon">📞</span> Book Appointment
            </a>
            <a 
              href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment" 
              className="btn btn-secondary btn-large"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon">💬</span> WhatsApp
            </a>
          </div>
          <p className="hero-phone">
            <span className="phone-icon">📞</span> Call: <a href="tel:+917977991130">7977 991 130</a>
            <span className="hero-phone-separator">|</span>
            <a
              href="https://www.instagram.com/smilerightdentalclinic?igsh=MXRnMnZtNWI3eDgzZg=="
              target="_blank"
              rel="noopener noreferrer"
              className="hero-instagram-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {' '}Instagram
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
