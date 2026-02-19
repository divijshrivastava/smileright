import type { CSSProperties } from 'react'

export const adminPageHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
}

export const adminPageTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '2rem',
  color: '#292828',
  marginBottom: '2rem',
}

export const adminPageTitleInHeaderStyle: CSSProperties = {
  ...adminPageTitleStyle,
  margin: 0,
}

export const adminPrimaryActionLinkStyle: CSSProperties = {
  display: 'inline-block',
  padding: '12px 24px',
  background: '#1B73BA',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '4px',
  fontSize: '0.95rem',
  fontWeight: 600,
  fontFamily: 'var(--font-sans)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
