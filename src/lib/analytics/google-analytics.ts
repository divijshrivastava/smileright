import { createSign } from 'crypto'

const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

type GaReportCell = { value: string }
type GaReportRow = {
  dimensionValues?: GaReportCell[]
  metricValues?: GaReportCell[]
}

export type GaOverview = {
  activeUsers: number
  newUsers: number
  sessions: number
  pageViews: number
  eventCount: number
}

export type GaEventMetric = {
  eventName: string
  count: number
}

export type GaPageMetric = {
  path: string
  views: number
}

export type GaDashboardData = {
  configured: boolean
  overview: GaOverview
  events: GaEventMetric[]
  pages: GaPageMetric[]
  error?: string
}

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function getGaConfig() {
  const propertyId = process.env.GA4_PROPERTY_ID
  const clientEmail = process.env.GA4_CLIENT_EMAIL
  const privateKeyRaw = process.env.GA4_PRIVATE_KEY
  const privateKey = privateKeyRaw?.replace(/\\n/g, '\n')

  return {
    propertyId,
    clientEmail,
    privateKey,
    configured: Boolean(propertyId && clientEmail && privateKey),
  }
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: GA_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedJwt)
  signer.end()
  const signature = signer.sign(privateKey)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const jwt = `${unsignedJwt}.${signature}`

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google token request failed: ${body}`)
  }

  const json = await response.json() as { access_token: string }
  return json.access_token
}

async function runReport(
  propertyId: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<GaReportRow[]> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google Analytics report failed: ${body}`)
  }

  const json = await response.json() as { rows?: GaReportRow[] }
  return json.rows || []
}

function toInt(value?: string): number {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function getGoogleAnalyticsDashboard(): Promise<GaDashboardData> {
  const config = getGaConfig()
  const emptyOverview: GaOverview = {
    activeUsers: 0,
    newUsers: 0,
    sessions: 0,
    pageViews: 0,
    eventCount: 0,
  }

  if (!config.configured || !config.propertyId || !config.clientEmail || !config.privateKey) {
    return {
      configured: false,
      overview: emptyOverview,
      events: [],
      pages: [],
      error: 'GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY are required.',
    }
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const dateRanges = [{ startDate: '30daysAgo', endDate: 'today' }]

    const [overviewRows, eventRows, pageRows] = await Promise.all([
      runReport(config.propertyId, accessToken, {
        dateRanges,
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'eventCount' },
        ],
      }),
      runReport(config.propertyId, accessToken, {
        dateRanges,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 12,
      }),
      runReport(config.propertyId, accessToken, {
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'PARTIAL_REGEXP', value: '^/' },
          },
        },
        limit: 12,
      }),
    ])

    const overviewMetricValues = overviewRows[0]?.metricValues || []
    const overview: GaOverview = {
      activeUsers: toInt(overviewMetricValues[0]?.value),
      newUsers: toInt(overviewMetricValues[1]?.value),
      sessions: toInt(overviewMetricValues[2]?.value),
      pageViews: toInt(overviewMetricValues[3]?.value),
      eventCount: toInt(overviewMetricValues[4]?.value),
    }

    const events: GaEventMetric[] = eventRows.map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || 'unknown',
      count: toInt(row.metricValues?.[0]?.value),
    }))

    const pages: GaPageMetric[] = pageRows.map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: toInt(row.metricValues?.[0]?.value),
    }))

    return {
      configured: true,
      overview,
      events,
      pages,
    }
  } catch (error) {
    return {
      configured: true,
      overview: emptyOverview,
      events: [],
      pages: [],
      error: error instanceof Error ? error.message : 'Failed to fetch GA data',
    }
  }
}
