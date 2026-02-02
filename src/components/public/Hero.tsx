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
          </p>
        </div>
      </div>
    </section>
  )
}
