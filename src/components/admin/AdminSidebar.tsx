'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  pendingApprovalCount: number
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export default function AdminSidebar({
  profile,
  unreadContactCount,
  pendingApprovalCount,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('admin_sidebar_collapsed') === '1' && window.innerWidth > 768
  })
  const [contactCount, setContactCount] = useState(unreadContactCount)
  const [approvalCount, setApprovalCount] = useState(pendingApprovalCount)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showManualInstallHelp, setShowManualInstallHelp] = useState(false)
  const [showInstallHelpModal, setShowInstallHelpModal] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'default'
    return Notification.permission
  })
  const isEditor = canEditContent(profile.role)
  const isAdmin = canApproveChanges(profile.role)

  const syncPushSubscription = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

      const keyRes = await fetch('/api/admin/push/public-key', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      if (!keyRes.ok) return
      const { publicKey } = await keyRes.json() as { publicKey?: string }
      if (!publicKey) return

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      await fetch('/api/admin/push/subscription', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })
    } catch (error) {
      console.error('Failed to sync push subscription:', error)
    }
  }, [])

  useEffect(() => {
    setContactCount(unreadContactCount)
  }, [unreadContactCount])

  useEffect(() => {
    setApprovalCount(pendingApprovalCount)
  }, [pendingApprovalCount])

  useEffect(() => {
    window.localStorage.setItem('admin_sidebar_collapsed', isCollapsed ? '1' : '0')
    document.documentElement.classList.toggle('admin-sidebar-collapsed', isCollapsed)
  }, [isCollapsed])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/admin' }).catch((error: unknown) => {
      console.error('Failed to register service worker:', error)
    })
  }, [])

  useEffect(() => {
    void syncPushSubscription()
  }, [syncPushSubscription])

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setCanInstall(false)
      setShowManualInstallHelp(false)
      setShowInstallHelpModal(false)
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafariBrowser =
      /safari/.test(userAgent)
      && !/crios|fxios|edgios|opios/.test(userAgent)

    if (isIOSDevice && isSafariBrowser) {
      setShowManualInstallHelp(true)
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent)
      setCanInstall(true)
      setShowManualInstallHelp(false)
    }

    const onInstalled = () => {
      setDeferredInstallPrompt(null)
      setCanInstall(false)
      setShowManualInstallHelp(false)
      setShowInstallHelpModal(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const navWithBadge = navigator as NavigatorWithBadge

    const applyAppBadge = async (nextContactCount: number, nextApprovalCount: number) => {
      const total = nextContactCount + (isAdmin ? nextApprovalCount : 0)
      if (typeof navWithBadge.setAppBadge !== 'function') return

      try {
        if (total > 0) {
          await navWithBadge.setAppBadge(total)
        } else if (typeof navWithBadge.clearAppBadge === 'function') {
          await navWithBadge.clearAppBadge()
        } else {
          await navWithBadge.setAppBadge(0)
        }
      } catch {
        // ignore badge API errors on unsupported browsers
      }
    }

    const refreshCounts = async () => {
      const { count: newContacts } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      const nextContactCount = newContacts ?? 0
      setContactCount(nextContactCount)

      let nextApprovalCount = 0
      if (isAdmin) {
        const { count: pendingApprovals } = await supabase
          .from('pending_changes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        nextApprovalCount = pendingApprovals ?? 0
        setApprovalCount(nextApprovalCount)
      }

      await applyAppBadge(nextContactCount, nextApprovalCount)
    }

    void refreshCounts()

    const contactChannel = supabase
      .channel('admin-contact-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contact_messages',
      }, (payload) => {
        void payload
        void refreshCounts()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contact_messages',
      }, () => {
        void refreshCounts()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'contact_messages',
      }, () => {
        void refreshCounts()
      })
      .subscribe()

    let approvalsChannel: ReturnType<typeof supabase.channel> | null = null
    if (isAdmin) {
      approvalsChannel = supabase
        .channel('admin-pending-approvals')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_changes',
          filter: 'status=eq.pending',
        }, (payload) => {
          void payload
          void refreshCounts()
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_changes',
        }, () => {
          void refreshCounts()
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'pending_changes',
        }, () => {
          void refreshCounts()
        })
        .subscribe()
    }

    return () => {
      void supabase.removeChannel(contactChannel)
      if (approvalsChannel) {
        void supabase.removeChannel(approvalsChannel)
      }
    }
  }, [isAdmin])

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      await syncPushSubscription()
    }
  }

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt()
      await deferredInstallPrompt.userChoice
      setDeferredInstallPrompt(null)
      setCanInstall(false)
      return
    }

    if (showManualInstallHelp) {
      setShowInstallHelpModal(true)
    }
  }

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
      {showInstallHelpModal && (
        <div
          onClick={() => setShowInstallHelpModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.6)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Install app instructions"
            style={{
              width: '100%',
              maxWidth: '320px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(2, 6, 23, 0.25)',
              padding: '16px',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Add Admin App</p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.4 }}>
              In Safari, tap Share, then choose Add to Home Screen to install the admin app.
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowInstallHelpModal(false)}
                className="admin-btn"
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
          {!isCollapsed && (
            <div style={{ marginTop: 'var(--admin-space-3)', display: 'flex', gap: 'var(--admin-space-2)', flexWrap: 'wrap' }}>
              {(canInstall || showManualInstallHelp) && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="admin-btn admin-btn--ghost"
                  style={{
                    fontSize: 'var(--admin-text-xs)',
                    padding: '6px 10px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                  }}
                >
                  {canInstall ? 'Install App' : 'Add to Home Screen'}
                </button>
              )}
              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={enableNotifications}
                  className="admin-btn admin-btn--ghost"
                  style={{
                    fontSize: 'var(--admin-text-xs)',
                    padding: '6px 10px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                  }}
                >
                  Enable Alerts
                </button>
              )}
            </div>
          )}
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
              <ClipboardCheck size={18} />
              <span className="sidebar-label">Approvals</span>
              {approvalCount > 0 && (
                <span className="admin-unread-badge" style={{
                  marginLeft: 'auto',
                  minWidth: '22px',
                  height: '22px',
                  borderRadius: 'var(--admin-radius-full)',
                  background: 'var(--admin-warning-500)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 7px',
                  fontSize: 'var(--admin-text-xs)',
                  fontWeight: 700,
                  lineHeight: 1,
                  fontFamily: 'var(--admin-font-body)',
                }}>{approvalCount > 99 ? '99+' : approvalCount}</span>
              )}
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
            {contactCount > 0 && (
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
              }}>{contactCount > 99 ? '99+' : contactCount}</span>
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
