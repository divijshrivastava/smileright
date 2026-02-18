type ContactEmailPayload = {
  name: string
  email: string
  phone: string | null
  preferred_contact: 'email' | 'phone' | 'whatsapp'
  service_interest: string | null
  appointment_preference: string | null
  message: string
  source_page: string | null
  form_location: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendContactNotificationEmail(payload: ContactEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_NOTIFICATION_TO || 'smilerightdentalclinic@gmail.com'
  const fromEmail = process.env.CONTACT_NOTIFICATION_FROM || 'Smile Right <onboarding@resend.dev>'

  if (!apiKey) {
    console.warn('[contact-email] RESEND_API_KEY is not set. Skipping email notification.')
    return { sent: false, reason: 'missing_api_key' as const }
  }

  const subject = `New Contact Form: ${payload.name} (${payload.preferred_contact})`

  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || '-'}`,
    `Preferred Contact: ${payload.preferred_contact}`,
    `Service Interest: ${payload.service_interest || '-'}`,
    `Appointment Preference: ${payload.appointment_preference || '-'}`,
    `Source Page: ${payload.source_page || '-'}`,
    `Form Location: ${payload.form_location || '-'}`,
    `UTM Source: ${payload.utm_source || '-'}`,
    `UTM Medium: ${payload.utm_medium || '-'}`,
    `UTM Campaign: ${payload.utm_campaign || '-'}`,
    '',
    'Message:',
    payload.message,
  ]

  const text = lines.join('\n')
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
      <h2 style="margin:0 0 14px">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(payload.phone || '-')}</p>
      <p><strong>Preferred Contact:</strong> ${escapeHtml(payload.preferred_contact)}</p>
      <p><strong>Service Interest:</strong> ${escapeHtml(payload.service_interest || '-')}</p>
      <p><strong>Appointment Preference:</strong> ${escapeHtml(payload.appointment_preference || '-')}</p>
      <p><strong>Source Page:</strong> ${escapeHtml(payload.source_page || '-')}</p>
      <p><strong>Form Location:</strong> ${escapeHtml(payload.form_location || '-')}</p>
      <p><strong>UTM:</strong> ${escapeHtml([payload.utm_source, payload.utm_medium, payload.utm_campaign].filter(Boolean).join(' / ') || '-')}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:14px 0" />
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;border:1px solid #eee">${escapeHtml(payload.message)}</pre>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text,
      reply_to: payload.email,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend email failed (${response.status}): ${body}`)
  }

  return { sent: true as const }
}
