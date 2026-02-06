import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'

export const metadata: Metadata = {
  title: 'Privacy Policy | Smile Right Dental Clinic',
  description: 'Privacy Policy for Smile Right Multispecialty Dental Clinic & Implant Centre. Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://www.smilerightdental.org/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <FloatingWhatsApp />
      <Header />
      <main className="blog-page-main">
        <section className="blog-post">
          <div className="container">
            <h1 className="blog-post-title">Privacy Policy</h1>
            <div className="blog-post-content">
              <p><strong>Last updated:</strong> February 2025</p>

              <p>
                Smile Right – Multispecialty Dental Clinic &amp; Implant Centre (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
                your personal information when you visit our website or use our services.
              </p>

              <h2>Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal details:</strong> Name, phone number, email address, and other contact information provided when you book an appointment or contact us via WhatsApp, phone, or our website.</li>
                <li><strong>Health information:</strong> Dental and medical history, treatment records, X-rays, and other clinical data necessary for providing dental care.</li>
                <li><strong>Usage data:</strong> Information about how you interact with our website, including pages visited, browser type, and device information.</li>
                <li><strong>Cookies:</strong> Small data files stored on your device to improve your browsing experience.</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul>
                <li>Schedule and manage dental appointments.</li>
                <li>Provide dental treatment and maintain patient records.</li>
                <li>Communicate with you about appointments, treatment plans, and follow-ups via phone, SMS, or WhatsApp.</li>
                <li>Improve our website and services.</li>
                <li>Comply with legal and regulatory requirements.</li>
              </ul>

              <h2>Cookies</h2>
              <p>
                Our website may use cookies to enhance your experience. You can control cookie preferences through your
                browser settings. Disabling cookies may affect certain website functionality.
              </p>

              <h2>Third-Party Services</h2>
              <p>
                We may use third-party services for website hosting, analytics, and communication (such as WhatsApp
                Business). These services have their own privacy policies, and we encourage you to review them.
                We do not sell your personal information to third parties.
              </p>

              <h2>Data Security</h2>
              <p>
                We implement reasonable technical and organisational measures to protect your personal information against
                unauthorised access, alteration, disclosure, or destruction. Patient health records are stored securely
                in compliance with applicable regulations.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Request access to the personal information we hold about you.</li>
                <li>Request correction of inaccurate or incomplete information.</li>
                <li>Request deletion of your personal data, subject to legal and medical record-keeping requirements.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
              </ul>

              <h2>Children&apos;s Privacy</h2>
              <p>
                We provide dental services for children with parental or guardian consent. Personal information of minors
                is collected and stored with the same protections as adult patient data.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <ul>
                <li><strong>Phone:</strong> <a href="tel:+917977991130">7977991130</a></li>
                <li><strong>Address:</strong> Shop No. 31, Gokul Nagar 2, CDE Wing, Kandivali (E), Mumbai 400 101</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
