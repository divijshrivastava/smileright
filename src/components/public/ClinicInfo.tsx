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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.0847254389!2d72.86681!3d19.20559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEyJzIwLjEiTiA3MsKwNTInMDAuNSJF!5e0!3m2!1sen!2sin!4v1234567890"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Smile Right Clinic Location"
                />
              </div>
              <a
                href="https://www.google.com/maps?q=19.20559,72.86681"
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
