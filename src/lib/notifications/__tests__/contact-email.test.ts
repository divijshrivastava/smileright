import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendContactNotificationEmail } from '../contact-email'

const basePayload = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+61 400 000 000',
  preferred_contact: 'email' as const,
  service_interest: 'Teeth Whitening',
  appointment_preference: 'Morning',
  message: 'I would like to make an appointment.',
  source_page: '/contact',
  form_location: 'footer',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'dental-2024',
}

describe('sendContactNotificationEmail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.RESEND_API_KEY
  })

  it('returns { sent: false, reason: "missing_api_key" } when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY

    const result = await sendContactNotificationEmail(basePayload)

    expect(result).toEqual({ sent: false, reason: 'missing_api_key' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls the Resend API when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail(basePayload)

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('sends the request with the Bearer token', async () => {
    process.env.RESEND_API_KEY = 'my-secret-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail(basePayload)

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = (options as RequestInit).headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-secret-key')
  })

  it('sets reply_to to the contact email address', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail(basePayload)

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((options as RequestInit).body as string)
    expect(body.reply_to).toBe('john@example.com')
  })

  it('includes the contact name in the email subject', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail(basePayload)

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((options as RequestInit).body as string)
    expect(body.subject).toContain('John Doe')
  })

  it('includes both html and text in the request body', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail(basePayload)

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((options as RequestInit).body as string)
    expect(typeof body.html).toBe('string')
    expect(body.html.length).toBeGreaterThan(0)
    expect(typeof body.text).toBe('string')
    expect(body.text.length).toBeGreaterThan(0)
  })

  it('returns { sent: true } on a successful API response', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    const result = await sendContactNotificationEmail(basePayload)
    expect(result).toEqual({ sent: true })
  })

  it('throws an error when the Resend API returns a non-OK response', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => 'Unprocessable Entity',
    } as Response)

    await expect(sendContactNotificationEmail(basePayload)).rejects.toThrow(
      'Resend email failed (422)'
    )
  })

  it('handles null optional fields without error', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    const payloadWithNulls = {
      ...basePayload,
      phone: null,
      service_interest: null,
      appointment_preference: null,
      source_page: null,
      form_location: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
    }

    const result = await sendContactNotificationEmail(payloadWithNulls)
    expect(result).toEqual({ sent: true })
  })

  it('HTML-escapes user-provided name to prevent XSS in email body', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    await sendContactNotificationEmail({
      ...basePayload,
      name: '<script>alert("xss")</script>',
    })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((options as RequestInit).body as string)
    expect(body.html).not.toContain('<script>')
    expect(body.html).toContain('&lt;script&gt;')
  })
})
