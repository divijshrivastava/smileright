import Image from 'next/image'
import MobileMenu from '@/components/interactive/MobileMenu'
import HeaderScroll from '@/components/interactive/HeaderScroll'

export default function Header() {
  return (
    <>
      <HeaderScroll />
      <header id="header">
        <nav>
          <div className="logo">
            <Image
              src="/images/smile-right.png"
              alt="Smile Right - Multispecialty Dental Clinic"
              width={400}
              height={120}
              priority
              style={{ height: '120px', width: 'auto', maxWidth: '400px', objectFit: 'contain' }}
            />
          </div>

          <ul className="nav-links nav-links-desktop">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          <MobileMenu />

          <div className="nav-cta">
            <a href="tel:+917977991130" className="btn btn-primary">
              <span className="btn-icon">📞</span> Book Now
            </a>
            <a 
              href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment" 
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon">💬</span> WhatsApp
            </a>
          </div>
        </nav>
      </header>
    </>
  )
}
