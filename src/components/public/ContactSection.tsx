'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'

type ContactSectionProps = {
  sourcePage: string
  formLocation: string
  serviceInterest?: string
  heading?: string
  subheading?: string
  embedded?: boolean
}

type ContactFormState = {
  name: string
  email: string
  phone: string
  preferred_contact: 'email' | 'phone' | 'whatsapp'
  service_interest: string
  appointment_preference: string
  message: string
  consent: boolean
  website: string
}

type AnalyticsState = {
  source_page: string
  form_location: string
  landing_page: string
  page_title: string
  referrer: string
  user_agent: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  gclid: string
  fbclid: string
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const defaultFormState: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  preferred_contact: 'email',
  service_interest: '',
  appointment_preference: '',
  message: '',
  consent: false,
  website: '',
}

export default function ContactSection({
  sourcePage,
  formLocation,
  serviceInterest,
  heading = 'Contact Me',
  subheading = 'Share your details and we will get back to you to plan your visit.',
  embedded = false,
}: ContactSectionProps) {
  const [form, setForm] = useState<ContactFormState>({
    ...defaultFormState,
    service_interest: serviceInterest || '',
  })
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    source_page: sourcePage,
    form_location: formLocation,
    landing_page: '',
    page_title: '',
    referrer: '',
    user_agent: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    gclid: '',
    fbclid: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAnalytics({
      source_page: sourcePage,
      form_location: formLocation,
      landing_page: window.location.href,
      page_title: document.title || '',
      referrer: document.referrer || '',
      user_agent: navigator.userAgent || '',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      gclid: params.get('gclid') || '',
      fbclid: params.get('fbclid') || '',
    })
  }, [sourcePage, formLocation])

  const formId = useMemo(() => `contact-form-${formLocation.replace(/[^a-z0-9]+/gi, '-')}`, [formLocation])

  const onInputChange = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const payload = { ...form, ...analytics }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json() as { error?: string }
      if (!response.ok) {
        throw new Error(result.error || 'Could not submit your message')
      }

      window.dataLayer?.push({
        event: 'contact_form_submit',
        form_id: formId,
        form_location: formLocation,
        source_page: sourcePage,
        preferred_contact: form.preferred_contact,
        service_interest: form.service_interest || 'not_selected',
      })

      setStatus({
        type: 'success',
        message: 'Thank you. Your message was sent successfully.',
      })
      setForm({
        ...defaultFormState,
        service_interest: serviceInterest || '',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`contact-form-section${embedded ? ' contact-form-section--embedded' : ''}`}>
      <div className={embedded ? undefined : 'container'}>
        <div className="contact-form-shell">
          <div className="contact-form-intro">
            <h2>{heading}</h2>
            <p>{subheading}</p>
          </div>

          <form
            id={formId}
            className="contact-form"
            onSubmit={onSubmit}
            data-form-name="contact_me"
            data-form-location={formLocation}
            data-source-page={sourcePage}
          >
            <div className="contact-grid">
              <label className="contact-field">
                <span>Name *</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  required
                  minLength={2}
                  maxLength={150}
                  data-field="name"
                />
              </label>

              <label className="contact-field">
                <span>Email *</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  required
                  maxLength={320}
                  data-field="email"
                />
              </label>

              <label className="contact-field">
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => onInputChange('phone', e.target.value)}
                  maxLength={30}
                  data-field="phone"
                />
              </label>

              <label className="contact-field">
                <span>Preferred Contact</span>
                <select
                  name="preferred_contact"
                  value={form.preferred_contact}
                  onChange={(e) => onInputChange('preferred_contact', e.target.value as ContactFormState['preferred_contact'])}
                  data-field="preferred_contact"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>

              <label className="contact-field">
                <span>Interested In</span>
                <input
                  type="text"
                  name="service_interest"
                  value={form.service_interest}
                  onChange={(e) => onInputChange('service_interest', e.target.value)}
                  maxLength={200}
                  placeholder="Dental implants, checkup, braces, etc."
                  data-field="service_interest"
                />
              </label>

              <label className="contact-field">
                <span>Best Time To Contact</span>
                <input
                  type="text"
                  name="appointment_preference"
                  value={form.appointment_preference}
                  onChange={(e) => onInputChange('appointment_preference', e.target.value)}
                  maxLength={200}
                  placeholder="Morning / Evening / Any specific day"
                  data-field="appointment_preference"
                />
              </label>
            </div>

            <label className="contact-field">
              <span>Message *</span>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={(e) => onInputChange('message', e.target.value)}
                required
                minLength={10}
                maxLength={5000}
                data-field="message"
              />
            </label>

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              className="contact-honeypot"
            />

            <label className="contact-consent">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={(e) => onInputChange('consent', e.target.checked)}
                required
              />
              <span>I agree to be contacted by Smile Right about my inquiry.</span>
            </label>

            <div className="contact-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                data-field="submit"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>

            {status && (
              <p className={status.type === 'success' ? 'contact-status success' : 'contact-status error'}>
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
