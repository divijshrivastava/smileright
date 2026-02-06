import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              Shop No. 31, Gokul Nagar 2, CDE Wing<br />
              Kandivali (E), Mumbai 400 101
            </p>
            <p>Phone: <a href="tel:+917977991130">7977991130</a></p>
            <p style={{ marginTop: '0.75rem' }}>
              <a
                href="https://www.instagram.com/smilerightdentalclinic?igsh=MXRnMnZtNWI3eDgzZg=="
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Follow us on Instagram
              </a>
            </p>
            <p className="footer-hours">
              <strong>Hours:</strong><br />
              Mon-Sat: 9AM-2PM, 5PM-9PM<br />
              Sun: By Appointment
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Dr. Kedia</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Treatment and Services</h4>
            <ul className="footer-links">
              <li><a href="#services">Dental Implants</a></li>
              <li><a href="#services">Root Canal</a></li>
              <li><a href="#services">Braces &amp; Orthodontics</a></li>
              <li><a href="#services">Cosmetic Dentistry</a></li>
              <li><a href="#services">Kids Dentistry</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <p>&copy; {new Date().getFullYear()} Smile Right - Multispecialty Dental Clinic &amp; Implant Centre. All rights reserved.</p>
            <p className="footer-credit">
              Created by <a
                href="https://divij.tech"
                target="_blank"
                rel="noopener noreferrer"
              >
                divij.tech
              </a>
            </p>
          </div>
          <ul className="footer-legal">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/accessibility">Accessibility</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
