const DEFAULT_BASE_URL = 'https://www.smilerightdental.org'

export const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.SITE_URL ||
  DEFAULT_BASE_URL
).replace(/\/$/, '')
