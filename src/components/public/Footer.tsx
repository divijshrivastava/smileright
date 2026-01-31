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
            <p style={{ marginTop: '1.5rem' }}>
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
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
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
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              Created by <a 
                href="https://divij.tech" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#fff', 
                  textDecoration: 'underline',
                  fontWeight: '600'
                }}
              >
                divij.tech
              </a>
            </p>
          </div>
          <ul className="footer-legal">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#accessibility">Accessibility</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
