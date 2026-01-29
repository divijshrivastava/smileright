export default function ClinicInfo() {
  return (
    <section id="contact" className="clinic-info">
      <div className="container">
        <h2 className="section-title">Visit Our Clinic</h2>

        <div className="info-grid">
          <div className="timings">
            <h3>Clinic Hours</h3>
            <div className="timing-row">
              <span className="timing-day">Monday - Saturday</span>
              <span className="timing-hours">9:00 AM - 2:00 PM</span>
            </div>
            <div className="timing-row">
              <span className="timing-day">Monday - Saturday</span>
              <span className="timing-hours">5:00 PM - 9:00 PM</span>
            </div>
            <div className="timing-row">
              <span className="timing-day">Sunday</span>
              <span className="timing-hours">By Appointment Only</span>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <a
                href="tel:+917977991130"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Call to Book: 7977991130
              </a>
            </div>
          </div>

          <div className="location">
            <h3>Our Location</h3>
            <p className="address">
              <strong>Smile Right - Multispecialty Dental Clinic &amp; Implant Centre</strong><br />
              Shop No. 31, Gokul Nagar 2, CDE Wing<br />
              Opp. Gokul Concorde, Thakur Village<br />
              Kandivali (E), Mumbai 400 101<br />
              Maharashtra, India
            </p>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.0847254389!2d72.86681!3d19.20559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEyJzIwLjEiTiA3MsKwNTInMDAuNSJF!5e0!3m2!1sen!2sin!4v1234567890"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Smile Right Clinic Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
