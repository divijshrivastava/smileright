import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'
import { BASE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service | Smile Right Dental Clinic',
  description: 'Terms of Service for Smile Right Multispecialty Dental Clinic & Implant Centre. Read about our website usage terms, appointment policies, and treatment disclaimers.',
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
}

export default function TermsPage() {
  return (
    <>
      <FloatingWhatsApp />
      <Header />
      <main className="blog-page-main">
        <section className="blog-post">
          <div className="container">
            <h1 className="blog-post-title">Terms of Service</h1>
            <div className="blog-post-content">
              <p><strong>Last updated:</strong> February 2025</p>

              <p>
                Welcome to the website of Smile Right – Multispecialty Dental Clinic &amp; Implant Centre. By accessing
                or using this website, you agree to be bound by these Terms of Service. If you do not agree, please do
                not use this website.
              </p>

              <h2>Use of This Website</h2>
              <p>
                This website is provided for informational purposes about our dental services. The content on this
                website does not constitute medical advice. Always consult a qualified dental professional for diagnosis
                and treatment recommendations.
              </p>
              <p>You agree not to:</p>
              <ul>
                <li>Use this website for any unlawful purpose.</li>
                <li>Attempt to gain unauthorised access to any part of the website.</li>
                <li>Reproduce, distribute, or modify website content without our written permission.</li>
              </ul>

              <h2>Appointment Booking</h2>
              <p>
                Appointments can be booked via our website, phone, or WhatsApp. Booking an appointment does not
                guarantee a specific treatment outcome. We request that you provide accurate personal and health
                information when booking.
              </p>
              <p>
                We reserve the right to reschedule or cancel appointments due to unforeseen circumstances. We will make
                reasonable efforts to notify you in advance of any changes.
              </p>

              <h2>Treatment Disclaimers</h2>
              <p>
                Dental treatment outcomes vary by individual. While we strive for the best possible results, we cannot
                guarantee specific outcomes. Treatment plans are discussed and agreed upon with patients before
                procedures begin.
              </p>
              <p>
                Before-and-after images or testimonials on this website represent individual cases and do not guarantee
                similar results for every patient.
              </p>

              <h2>Payment Policies</h2>
              <p>
                Payment terms for dental services are communicated at the clinic. Fees may vary based on the complexity
                of treatment. Please discuss payment options, including any available instalment plans, directly with our
                clinic staff.
              </p>

              <h2>Intellectual Property</h2>
              <p>
                All content on this website — including text, images, logos, and design — is the property of Smile Right
                Dental Clinic or its content providers and is protected by applicable intellectual property laws.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Smile Right Dental Clinic shall not be liable for any indirect,
                incidental, or consequential damages arising from your use of this website. We do not guarantee that the
                website will be available at all times or free from errors.
              </p>

              <h2>Governing Law</h2>
              <p>
                These Terms of Service are governed by the laws of India. Any disputes arising from the use of this
                website shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>

              <h2>Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of the website after changes are
                posted constitutes your acceptance of the revised terms.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact us:
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
