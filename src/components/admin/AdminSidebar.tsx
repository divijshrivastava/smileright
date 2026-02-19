'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Mail,
  ChartColumn,
  ExternalLink,
  Menu,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

interface AdminSidebarProps {
  profile: Profile
  unreadContactCount: number
}

export default function AdminSidebar({ profile, unreadContactCount }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('admin_sidebar_collapsed') === '1' && window.innerWidth > 768
  })
  const isEditor = canEditContent(profile.role)
  const isAdmin = canApproveChanges(profile.role)

  useEffect(() => {
    window.localStorage.setItem('admin_sidebar_collapsed', isCollapsed ? '1' : '0')
    document.documentElement.classList.toggle('admin-sidebar-collapsed', isCollapsed)
  }, [isCollapsed])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const linkClass = (active: boolean) => `admin-nav-link${active ? ' is-active' : ''}`

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: 'var(--admin-space-4)',
          left: 'var(--admin-space-4)',
          zIndex: 1001,
          background: 'var(--admin-gray-900)',
          border: 'none',
          padding: 'var(--admin-space-3) var(--admin-space-4)',
          borderRadius: 'var(--admin-radius-md)',
          cursor: 'pointer',
          boxShadow: 'var(--admin-shadow-lg)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Menu size={22} color="#fff" />
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="mobile-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none',
          }}
        />
      )}

      <aside
        style={{
          minHeight: '100vh',
          background: 'var(--admin-gray-900)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : undefined,
          width: isCollapsed ? '88px' : '236px',
        }}
        className={`admin-sidebar${isCollapsed ? ' admin-sidebar--collapsed' : ''}`}
      >
        <div style={{
          padding: 'var(--admin-space-5) var(--admin-space-4)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--admin-space-3)',
          }}>
            <div className="sidebar-brand-copy">
              <h2 style={{
                fontFamily: 'var(--admin-font-heading)',
                fontSize: 'var(--admin-text-xl)',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
              }}>Smile Right</h2>
              <p style={{
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-xs)',
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>Admin Panel</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="sidebar-collapse-btn"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.92)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </div>

        <nav style={{
          padding: 'var(--admin-space-4) 0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <Link href="/admin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--admin-space-3)',
            padding: '11px var(--admin-space-4)',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            fontWeight: 500,
            transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
            position: 'relative',
          }} className={linkClass(isActive('/admin'))} onClick={() => setIsOpen(false)} title="Dashboard">
            <LayoutDashboard size={18} /> <span className="sidebar-label">Dashboard</span>
          </Link>

          {isAdmin && (
            <Link href="/admin/approvals" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--admin-space-3)',
              padding: '11px var(--admin-space-4)',
              color: 'var(--admin-warning-500)',
              textDecoration: 'none',
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              fontWeight: 600,
              transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
              position: 'relative',
            }} className={linkClass(isActive('/admin/approvals'))} onClick={() => setIsOpen(false)} title="Approvals">
              <ClipboardCheck size={18} /> <span className="sidebar-label">Approvals</span>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin/users" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--admin-space-3)',
              padding: '11px var(--admin-space-4)',
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              fontWeight: 500,
              transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
              position: 'relative',
            }} className={linkClass(isActive('/admin/users'))} onClick={() => setIsOpen(false)} title="Users">
              <Users size={18} /> <span className="sidebar-label">Users</span>
            </Link>
          )}

          <div className="sidebar-divider" style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: 'var(--admin-space-2) var(--admin-space-4)',
          }} />

          {[
            { href: '/admin/testimonials', icon: <MessageSquareQuote size={18} />, label: 'Testimonials', addHref: '/admin/testimonials/new', addLabel: '+ Add Testimonial' },
            { href: '/admin/services', icon: <Stethoscope size={18} />, label: 'Treatments & Services', addHref: '/admin/services/new', addLabel: '+ Add Treatment/Service' },
            { href: '/admin/trust-images', icon: <ImageIcon size={18} />, label: 'Trust Images', addHref: '/admin/trust-images/new', addLabel: '+ Add Trust Image' },
            { href: '/admin/blogs', icon: <FileText size={18} />, label: 'Blogs', addHref: '/admin/blogs/new', addLabel: '+ Add Blog' },
          ].map(item => (
            <div key={item.href}>
              <Link href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--admin-space-3)',
                padding: '11px var(--admin-space-4)',
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-sm)',
                fontWeight: 500,
                transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
                position: 'relative',
              }} className={linkClass(isActive(item.href))} onClick={() => setIsOpen(false)} title={item.label}>
                {item.icon} <span className="sidebar-label">{item.label}</span>
              </Link>
              {isEditor && (
                <Link href={item.addHref} className="sidebar-sub-link" style={{
                  display: 'block',
                  padding: 'var(--admin-space-2) var(--admin-space-4) var(--admin-space-2) 44px',
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  fontFamily: 'var(--admin-font-body)',
                  fontSize: 'var(--admin-text-xs)',
                  fontWeight: 400,
                  transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
                }} onClick={() => setIsOpen(false)}>
                  {item.addLabel}
                </Link>
              )}
            </div>
          ))}

          <Link href="/admin/contact-messages" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--admin-space-3)',
            padding: '11px var(--admin-space-4)',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            fontWeight: 500,
            transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
            position: 'relative',
          }} className={linkClass(isActive('/admin/contact-messages'))} onClick={() => setIsOpen(false)} title="Contact Messages">
            <Mail size={18} />
            <span className="sidebar-label">Contact Messages</span>
            {unreadContactCount > 0 && (
              <span className="admin-unread-badge" style={{
                marginLeft: 'auto',
                minWidth: '22px',
                height: '22px',
                borderRadius: 'var(--admin-radius-full)',
                background: 'var(--admin-danger-500)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 7px',
                fontSize: 'var(--admin-text-xs)',
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: 'var(--admin-font-body)',
              }}>{unreadContactCount > 99 ? '99+' : unreadContactCount}</span>
            )}
          </Link>

          <Link href="/admin/analytics" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--admin-space-3)',
            padding: '11px var(--admin-space-4)',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            fontWeight: 500,
            transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
            position: 'relative',
          }} className={linkClass(isActive('/admin/analytics'))} onClick={() => setIsOpen(false)} title="Analytics">
            <ChartColumn size={18} /> <span className="sidebar-label">Analytics</span>
          </Link>

          <div className="sidebar-divider" style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: 'var(--admin-space-2) var(--admin-space-4)',
          }} />

          <Link href="/" className="admin-nav-link" target="_blank" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--admin-space-3)',
            padding: '11px var(--admin-space-4)',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            fontWeight: 500,
            transition: 'background var(--admin-transition-fast), color var(--admin-transition-fast)',
            position: 'relative',
          }} onClick={() => setIsOpen(false)} title="View Site">
            <ExternalLink size={18} /> <span className="sidebar-label">View Site</span>
          </Link>
        </nav>

        <div className="sidebar-user-info" style={{
          padding: 'var(--admin-space-4)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ marginBottom: 'var(--admin-space-3)' }}>
            <p style={{
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              color: '#fff',
              margin: 0,
              fontWeight: 600,
            }}>{profile.full_name || profile.email}</p>
            <p style={{ margin: 'var(--admin-space-1) 0 0' }}>
              <span className={`admin-badge admin-badge--${profile.role}`} style={{
                padding: '2px 10px',
                fontSize: 'var(--admin-text-xs)',
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
