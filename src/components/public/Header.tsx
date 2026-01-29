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

          <MobileMenu />

          <div className="nav-cta">
            <a href="tel:+917977991130" className="btn btn-primary">Book Online</a>
            <a href="tel:+917977991130" className="btn btn-secondary">7977991130</a>
          </div>
        </nav>
      </header>
    </>
  )
}
