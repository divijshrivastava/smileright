'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'What are your clinic timings?',
    answer: 'We are open Monday to Saturday from 9:00 AM - 2:00 PM and 5:00 PM - 9:00 PM. Sunday appointments are available by prior booking.'
  },
  {
    question: 'Do you accept insurance?',
    answer: 'Yes, we work with most major insurance providers. Please bring your insurance card for verification, and we\'ll help you maximize your benefits.'
  },
  {
    question: 'Is the treatment painful?',
    answer: 'We use advanced painless dentistry techniques and modern anesthesia to ensure maximum comfort. Most patients report minimal to no discomfort during procedures.'
  },
  {
    question: 'How do I book an appointment?',
    answer: 'You can book an appointment by calling us at 7977991130, sending a WhatsApp message, or visiting our clinic directly. We offer same-day appointments for emergencies.'
  },
  {
    question: 'What services do you provide?',
    answer: 'We offer comprehensive dental care including dental implants, root canal treatment, braces, teeth whitening, cosmetic dentistry, pediatric dentistry, and preventive care.'
  },
  {
    question: 'Do you handle dental emergencies?',
    answer: 'Yes, we provide emergency dental care. Please call us immediately at 7977991130, and we\'ll arrange to see you as soon as possible.'
  },
  {
    question: 'How much do treatments cost?',
    answer: 'Treatment costs vary based on individual needs. We provide transparent pricing and detailed treatment plans before starting any procedure. Call us for a free consultation.'
  },
  {
    question: 'Is parking available at the clinic?',
    answer: 'Yes, convenient parking facilities are available near our clinic at Thakur Village, Kandivali East.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Find answers to common questions about our dental services and clinic.
        </p>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p>Still have questions?</p>
          <div className="faq-buttons">
            <a href="tel:+917977991130" className="btn btn-primary">
              <span className="btn-icon">📞</span> Call Us
            </a>
            <a 
              href="https://wa.me/917977991130?text=Hi,%20I%20have%20a%20question" 
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
