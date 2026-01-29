import Image from 'next/image'

export default function DoctorBio() {
  return (
    <section id="gallery" className="doctor-bio">
      <div className="container">
        <h2 className="section-title">Meet Dr. Sneha Kedia</h2>

        <div className="bio-grid">
          <div className="bio-image">
            <Image
              src="/images/6572DD12-6B71-45CD-BB10-2A62D2F6FA98.JPG"
              alt="Dr. Sneha Kedia - Dental Surgeon and Implantologist"
              width={800}
              height={500}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="bio-content">
            <h3>Your Partner in Dental Health</h3>
            <p>
              Dr. Sneha Kedia brings extensive expertise and a patient-centered philosophy to every treatment.
              With a Bachelor of Dental Surgery degree from Mumbai and specialized training in implantology,
              she is committed to staying at the forefront of dental innovation.
            </p>
            <p>
              Her approach emphasizes thorough diagnosis, conservative treatment planning, and open communication,
              ensuring each patient feels informed, comfortable, and confident in their care.
            </p>

            <div className="bio-credentials">
              <div className="credential-row">
                <div className="credential-label">Education</div>
                <div className="credential-value">B.D.S (Mumbai)</div>
              </div>
              <div className="credential-row">
                <div className="credential-label">Specialization</div>
                <div className="credential-value">Dental Surgery &amp; Implantology</div>
              </div>
              <div className="credential-row">
                <div className="credential-label">Experience</div>
                <div className="credential-value">Multispecialty Dental Care</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
