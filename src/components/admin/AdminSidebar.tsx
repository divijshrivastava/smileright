'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { Profile } from '@/lib/types'
import { canEditContent, canApproveChanges, getRoleLabel } from '@/lib/permissions'
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquareQuote,
  Stethoscope,
  ImageIcon,
  FileText,
  ExternalLink,
  Menu,
} from 'lucide-react'

interface AdminSidebarProps {
  profile: Profile
}

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditor = canEditContent(profile.role)
  const isAdmin = canApproveChanges(profile.role)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.menuButton,
          display: 'none',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={22} color="#fff" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={styles.overlay}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">
        <div style={styles.brand}>
          <h2 style={styles.brandTitle}>Smile Right</h2>
          <p style={styles.brandSub}>Admin Panel</p>
        </div>

        <nav style={styles.nav}>
          <Link href="/admin" style={styles.navLink} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          {/* Approval queue - Admin only */}
          {isAdmin && (
            <Link href="/admin/approvals" style={{ ...styles.navLink, ...styles.approvalLink }} onClick={() => setIsOpen(false)}>
              <ClipboardCheck size={18} /> Approvals
            </Link>
          )}

          <div style={styles.divider} />

          {/* Content management - visible to all, but create/edit links only for editors+ */}
          <Link href="/admin/testimonials" style={styles.navLink} onClick={() => setIsOpen(false)}>
            <MessageSquareQuote size={18} /> Testimonials
          </Link>
          {isEditor && (
            <Link href="/admin/testimonials/new" style={styles.subLink} onClick={() => setIsOpen(false)}>
              + Add Testimonial
            </Link>
          )}

          <Link href="/admin/services" style={styles.navLink} onClick={() => setIsOpen(false)}>
            <Stethoscope size={18} /> Services
          </Link>
          {isEditor && (
            <Link href="/admin/services/new" style={styles.subLink} onClick={() => setIsOpen(false)}>
              + Add Service
            </Link>
          )}

          <Link href="/admin/trust-images" style={styles.navLink} onClick={() => setIsOpen(false)}>
            <ImageIcon size={18} /> Trust Images
          </Link>
          {isEditor && (
            <Link href="/admin/trust-images/new" style={styles.subLink} onClick={() => setIsOpen(false)}>
              + Add Trust Image
            </Link>
          )}

          <Link href="/admin/blogs" style={styles.navLink} onClick={() => setIsOpen(false)}>
            <FileText size={18} /> Blogs
          </Link>
          {isEditor && (
            <Link href="/admin/blogs/new" style={styles.subLink} onClick={() => setIsOpen(false)}>
              + Add Blog
            </Link>
          )}

          <div style={styles.divider} />

          <Link href="/" style={styles.navLink} target="_blank" onClick={() => setIsOpen(false)}>
            <ExternalLink size={18} /> View Site
          </Link>
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{profile.full_name || profile.email}</p>
            <p style={styles.userRoleLabel}>
              <span style={{
                ...styles.roleBadge,
                background: profile.role === 'admin' ? '#1B73BA' :
                  profile.role === 'editor' ? '#28a745' : '#6c757d',
              }}>
                {getRoleLabel(profile.role)}
              </span>
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  menuButton: {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 1001,
    background: '#292828',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    display: 'none',
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: '#292828',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  brand: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  brandTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  brandSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  nav: {
    padding: '20px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'background 0.2s, color 0.2s',
  },
  subLink: {
    display: 'block',
    padding: '8px 20px 8px 48px',
    color: 'rgba(255,255,255,0.45)',
    textDecoration: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    fontWeight: 400,
    transition: 'background 0.2s, color 0.2s',
  },
  approvalLink: {
    color: '#ffc107',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '8px 20px',
  },
  userSection: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  userInfo: {
    marginBottom: '12px',
  },
  userName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#fff',
    margin: 0,
    fontWeight: 600,
  },
  userRoleLabel: {
    margin: '6px 0 0',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
}
