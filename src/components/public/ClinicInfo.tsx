export default function ClinicInfo() {
  return (
    <section id="contact" className="clinic-info">
      <div className="container">
        <h2 className="section-title">Visit Our Clinic</h2>
        <p className="section-subtitle">
          Conveniently located in Kandivali East - Easy to reach, plenty of parking
        </p>

        <div className="info-grid">
          <div className="timings">
            <div className="info-card">
              <h3>📅 Clinic Hours</h3>
              <div className="timing-row">
                <span className="timing-day">Monday - Saturday</span>
                <span className="timing-hours">9:00 AM - 2:00 PM</span>
              </div>
              <div className="timing-row">
                <span className="timing-day">Monday - Saturday</span>
                <span className="timing-hours">5:00 PM - 9:00 PM</span>
              </div>
              <div className="timing-row timing-special">
                <span className="timing-day">Sunday</span>
                <span className="timing-hours">By Appointment Only</span>
              </div>

              <div className="info-highlight">
                <strong>⚡ Same-Day Emergency Appointments Available</strong>
              </div>

              <div className="clinic-buttons">
                <a
                  href="tel:+917977991130"
                  className="btn btn-primary"
                >
                  <span className="btn-icon">📞</span> Call: 7977 991 130
                </a>
                <a
                  href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment"
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="btn-icon">💬</span> WhatsApp Us
                </a>
                <a
                  href="https://www.instagram.com/smilerightdentalclinic?igsh=MXRnMnZtNWI3eDgzZg=="
                  className="btn btn-instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="btn-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </span> Follow on Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="location">
            <div className="info-card">
              <h3>📍 Our Location</h3>
              <p className="address">
                <strong>Smile Right - Multispecialty Dental Clinic &amp; Implant Centre</strong><br />
                Shop No. 31, Gokul Nagar 2, CDE Wing<br />
                Opp. Gokul Concorde, Thakur Village<br />
                Kandivali East, Mumbai 400 101<br />
                Maharashtra, India
              </p>

              <div className="location-features">
                <span className="location-feature">🚗 Parking Available</span>
                <span className="location-feature">🚇 Near Kandivali Station</span>
                <span className="location-feature">♿ Wheelchair Accessible</span>
              </div>

              <div className="map-container">
                <iframe
                  src="https://maps.google.com/maps?q=Smile+Right+Multispeciality+Dental+Clinic+Kandivali+East+Mumbai&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                  style={{ border: 0 }}
                  allowFullScreen
                  allow="fullscreen"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Smile Right Clinic Location"
                />
              </div>
              <div className="clinic-buttons">
                <a
                  href="https://maps.app.goo.gl/7ysQvfSLowxQpwCB8?g_st=ic"
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🗺️ Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
