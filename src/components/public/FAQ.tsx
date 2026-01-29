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
              <span className="btn-icon">💬</span> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
