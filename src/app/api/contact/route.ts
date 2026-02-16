import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { validateContactInput } from '@/lib/security/input-validation'

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) {
    return fwd.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function checkSubmissionLimit(identifier: string, maxRequests: number, windowMs: number): NextResponse | null {
  const result = checkRateLimit(identifier, { maxRequests, windowMs })
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again shortly.' },
      { status: 429 }
    )
  }
  return null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type.' }, { status: 415 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 25_000) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
  }

  // Layered IP throttles: burst + sustained.
  const ipBurst = checkSubmissionLimit(`api:contact:ip:burst:${ip}`, 5, 60 * 1000)
  if (ipBurst) {
    return ipBurst
  }

  const ipHourly = checkSubmissionLimit(`api:contact:ip:hour:${ip}`, 40, 60 * 60 * 1000)
  if (ipHourly) {
    return ipHourly
  }

  try {
    const rawBody = await request.json() as Record<string, unknown>

    // Honeypot field for bots.
    if (String(rawBody.website || '').trim()) {
      return NextResponse.json({ success: true })
    }

    const validated = validateContactInput(rawBody)
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const normalizedEmail = validated.email.toLowerCase()

    // Per-email throttles to limit abuse with rotating IPs.
    const emailBurst = checkSubmissionLimit(`api:contact:email:burst:${normalizedEmail}`, 3, 10 * 60 * 1000)
    if (emailBurst) {
      return emailBurst
    }

    const emailHourly = checkSubmissionLimit(`api:contact:email:hour:${normalizedEmail}`, 8, 60 * 60 * 1000)
    if (emailHourly) {
      return emailHourly
    }

    // Duplicate payload throttle for repeated bot retries.
    const messageSignature = validated.message
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
    const duplicateBlock = checkSubmissionLimit(
      `api:contact:dupe:${ip}:${normalizedEmail}:${messageSignature}`,
      1,
      5 * 60 * 1000
    )
    if (duplicateBlock) {
      return duplicateBlock
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const userAgent = request.headers.get('user-agent') || validated.user_agent || null

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        ...validated,
        ip_address: ip,
        user_agent: userAgent,
      })

    if (error) {
      console.error('Failed to insert contact message:', error)
      return NextResponse.json(
        { error: 'Failed to submit message. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request. Please try again.' },
      { status: 400 }
    )
  }
}
