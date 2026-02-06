import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import FloatingWhatsApp from '@/components/interactive/FloatingWhatsApp'

export const metadata: Metadata = {
  title: 'Accessibility | Smile Right Dental Clinic',
  description: 'Accessibility statement for Smile Right Multispecialty Dental Clinic & Implant Centre. Learn about our commitment to making our website accessible to everyone.',
  alternates: {
    canonical: 'https://www.smilerightdental.org/accessibility',
  },
}

export default function AccessibilityPage() {
  return (
    <>
      <FloatingWhatsApp />
      <Header />
      <main className="blog-page-main">
        <section className="blog-post">
          <div className="container">
            <h1 className="blog-post-title">Accessibility</h1>
            <div className="blog-post-content">
              <p>
                Smile Right – Multispecialty Dental Clinic &amp; Implant Centre is committed to ensuring that our website
                is accessible to all visitors, including people with disabilities. We strive to provide an inclusive
                digital experience for everyone.
              </p>

              <h2>Our Commitment</h2>
              <p>
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These
                guidelines help make web content more accessible to people with a wide range of disabilities, including
                visual, auditory, physical, speech, cognitive, and neurological disabilities.
              </p>

              <h2>Accessibility Features</h2>
              <p>Our website includes the following accessibility features:</p>
              <ul>
                <li><strong>Keyboard navigation:</strong> All interactive elements can be accessed and operated using a keyboard.</li>
                <li><strong>Screen reader support:</strong> We use semantic HTML, ARIA labels, and meaningful alt text for images to ensure compatibility with assistive technologies.</li>
                <li><strong>Colour contrast:</strong> Text and interactive elements are designed with sufficient colour contrast ratios for readability.</li>
                <li><strong>Responsive design:</strong> Our website adapts to different screen sizes, devices, and orientations.</li>
                <li><strong>Clear typography:</strong> We use legible fonts and appropriate text sizing for comfortable reading.</li>
                <li><strong>Focus indicators:</strong> Visible focus outlines are provided for keyboard users navigating the site.</li>
              </ul>

              <h2>Ongoing Efforts</h2>
              <p>
                Accessibility is an ongoing effort. We regularly review and improve our website to address any barriers
                and stay current with best practices and standards.
              </p>

              <h2>Known Limitations</h2>
              <p>
                While we strive for full accessibility, some third-party content or legacy elements may not yet fully
                meet all accessibility standards. We are actively working to address these areas.
              </p>

              <h2>Feedback &amp; Contact</h2>
              <p>
                If you experience any difficulty accessing our website or have suggestions for improvement, we would like
                to hear from you. Please contact us:
              </p>
              <ul>
                <li><strong>Phone:</strong> <a href="tel:+917977991130">7977991130</a></li>
                <li><strong>Address:</strong> Shop No. 31, Gokul Nagar 2, CDE Wing, Kandivali (E), Mumbai 400 101</li>
              </ul>
              <p>
                We will make reasonable efforts to respond to your feedback and address accessibility concerns promptly.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
