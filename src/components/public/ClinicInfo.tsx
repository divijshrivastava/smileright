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
                  <span className="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span> WhatsApp Us
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
                  src="https://maps.google.com/maps?q=19.214462,72.868988&t=&z=16&ie=UTF8&iwloc=&output=embed"
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
                href="https://www.google.com/maps?q=19.214462,72.868988"
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
