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

              <div style={{ marginTop: '2rem' }}>
                <a
                  href="tel:+917977991130"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  <span className="btn-icon">📞</span> Call: 7977 991 130
                </a>
                <a
                  href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment"
                  className="btn btn-secondary"
                  style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="btn-icon">💬</span> WhatsApp Us
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
                  src="https://maps.google.com/maps?q=Smile+Right+-+Multispecialty+Dental+Clinic+%26+Implant+Centre,+Kandivali+East,+Mumbai&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Smile Right Clinic Location"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/7ysQvfSLowxQpwCB8?g_st=ic"
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                🗺️ Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
