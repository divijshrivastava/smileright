import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAnalyticsDashboard } from '@/lib/analytics/google-analytics'
import { getEventDisplay } from '@/lib/analytics/event-labels'
import { MessageSquareQuote, Stethoscope, ImageIcon, Mail, Plus, ArrowUpRight, Activity } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const ga = await getGoogleAnalyticsDashboard()

  // Fetch all statistics
  const { count: totalTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })

  const { count: publishedTestimonials } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })

  const { count: publishedServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalTrustImages } = await supabase
    .from('trust_images')
    .select('*', { count: 'exact', head: true })

  const { count: publishedTrustImages } = await supabase
    .from('trust_images')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalContactMessages } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })

  const { count: newContactMessages } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  // Fetch recent testimonials
  const { data: recentTestimonials } = await supabase
    .from('testimonials')
    .select('id, name, rating, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent services
  const { data: recentServices } = await supabase
    .from('services')
    .select('id, title, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="admin-page-content">
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle" style={{ marginBottom: 'var(--admin-space-10)' }}>Welcome to the Smile Right Admin Panel</p>

      {/* Google Analytics */}
      <section style={{ marginBottom: 'var(--admin-space-12)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--admin-space-3)',
          marginBottom: 'var(--admin-space-4)',
        }}>
          <h2 className="admin-section-heading" style={{ margin: 0 }}>Google Analytics (Last 30 Days)</h2>
          <span className={`admin-badge ${ga.configured ? 'admin-badge--info' : 'admin-badge--danger'}`} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
            <Activity size={14} />
            {ga.configured ? 'Connected' : 'Not Configured'}
          </span>
        </div>

        {!ga.configured ? (
          <div className="admin-error">
            <p style={{ margin: 0 }}>
              Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, and `GA4_PRIVATE_KEY` in server environment variables.
            </p>
          </div>
        ) : ga.error ? (
          <div className="admin-error">
            <p style={{ margin: 0 }}>{ga.error}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-5)' }}>
            <div className="admin-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 'var(--admin-space-3)',
            }}>
              {[
                { label: 'Active Users', value: ga.overview.activeUsers },
                { label: 'New Users', value: ga.overview.newUsers },
                { label: 'Sessions', value: ga.overview.sessions },
                { label: 'Page Views', value: ga.overview.pageViews },
                { label: 'Event Count', value: ga.overview.eventCount },
              ].map(stat => (
                <div key={stat.label} className="admin-card admin-card--stat">
                  <p className="admin-stat-number">{stat.value.toLocaleString()}</p>
                  <p className="admin-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--admin-space-4)',
            }}>
              <div className="admin-card">
                <h3 style={{
                  margin: '0 0 var(--admin-space-3)',
                  fontSize: 'var(--admin-text-base)',
                  color: 'var(--admin-gray-900)',
                  fontFamily: 'var(--admin-font-heading)',
                }}>
                  Conversion Events
                </h3>
                {ga.conversionEvents.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--admin-gray-400)', fontFamily: 'var(--admin-font-body)', fontSize: 'var(--admin-text-sm)' }}>
                    No conversion events found.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
                    {ga.conversionEvents.map((event) => {
                      const eventDisplay = getEventDisplay(event.eventName)
                      return (
                        <div key={event.eventName} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 'var(--admin-space-3)',
                          padding: 'var(--admin-space-2) 0',
                          borderBottom: '1px solid var(--admin-gray-100)',
                        }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{
                              display: 'block',
                              fontSize: 'var(--admin-text-sm)',
                              fontWeight: 600,
                              color: 'var(--admin-gray-700)',
                              fontFamily: 'var(--admin-font-body)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {eventDisplay.label}
                            </span>
                            <span style={{
                              display: 'block',
                              marginTop: '3px',
                              fontSize: 'var(--admin-text-xs)',
                              color: 'var(--admin-gray-400)',
                              fontFamily: 'var(--admin-font-body)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {eventDisplay.description}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 'var(--admin-text-sm)',
                            color: 'var(--admin-blue-500)',
                            fontWeight: 700,
                            fontFamily: 'var(--admin-font-body)',
                            whiteSpace: 'nowrap',
                          }}>
                            {event.count.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="admin-card">
                <h3 style={{
                  margin: '0 0 var(--admin-space-3)',
                  fontSize: 'var(--admin-text-base)',
                  color: 'var(--admin-gray-900)',
                  fontFamily: 'var(--admin-font-heading)',
                }}>
                  Top Pages
                </h3>
                {ga.pages.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--admin-gray-400)', fontFamily: 'var(--admin-font-body)', fontSize: 'var(--admin-text-sm)' }}>
                    No pages found.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
                    {ga.pages.map((page) => (
                      <div key={page.path} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 'var(--admin-space-3)',
                        padding: 'var(--admin-space-2) 0',
                        borderBottom: '1px solid var(--admin-gray-100)',
                      }}>
                        <span style={{
                          fontSize: 'var(--admin-text-sm)',
                          fontWeight: 600,
                          color: 'var(--admin-gray-700)',
                          fontFamily: 'var(--admin-font-body)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {page.path}
                        </span>
                        <span style={{
                          fontSize: 'var(--admin-text-sm)',
                          color: 'var(--admin-blue-500)',
                          fontWeight: 700,
                          fontFamily: 'var(--admin-font-body)',
                          whiteSpace: 'nowrap',
                        }}>
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Statistics Overview */}
      <section style={{ marginBottom: 'var(--admin-space-12)' }}>
        <h2 className="admin-section-heading">Content Overview</h2>
        <div className="admin-stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--admin-space-5)',
        }}>
          {[
            { icon: <MessageSquareQuote size={24} />, total: totalTestimonials ?? 0, label: 'Total Testimonials', sub: `${publishedTestimonials ?? 0} published` },
            { icon: <Stethoscope size={24} />, total: totalServices ?? 0, label: 'Total Services', sub: `${publishedServices ?? 0} published` },
            { icon: <ImageIcon size={24} />, total: totalTrustImages ?? 0, label: 'Trust Images', sub: `${publishedTrustImages ?? 0} published` },
            { icon: <Mail size={24} />, total: totalContactMessages ?? 0, label: 'Contact Messages', sub: `${newContactMessages ?? 0} new` },
          ].map(stat => (
            <div key={stat.label} className="admin-card admin-card--stat">
              <div style={{ marginBottom: 'var(--admin-space-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-blue-500)' }}>
                {stat.icon}
              </div>
              <p className="admin-stat-number" style={{ fontSize: 'var(--admin-text-3xl)' }}>{stat.total}</p>
              <p className="admin-stat-label">{stat.label}</p>
              <p className="admin-stat-subtext">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ marginBottom: 'var(--admin-space-12)' }}>
        <h2 className="admin-section-heading">Quick Actions</h2>
        <div className="admin-link-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--admin-space-5)',
        }}>
          {[
            { href: '/admin/testimonials/new', icon: <Plus size={24} />, title: 'Add Testimonial', desc: 'Create a new patient testimonial' },
            { href: '/admin/services/new', icon: <Plus size={24} />, title: 'Add Service', desc: 'Create a new dental service' },
            { href: '/admin/trust-images/new', icon: <Plus size={24} />, title: 'Add Trust Image', desc: 'Upload trust section image' },
            { href: '/admin/contact-messages', icon: <Mail size={24} />, title: 'View Messages', desc: 'Check contact form submissions' },
          ].map(action => (
            <Link key={action.href} href={action.href} className="admin-card" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ color: 'var(--admin-blue-500)', marginBottom: 'var(--admin-space-3)' }}>{action.icon}</div>
              <p style={{
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-lg)',
                fontWeight: 600,
                color: 'var(--admin-gray-900)',
                margin: '0 0 var(--admin-space-2)',
              }}>
                {action.title}
              </p>
              <p style={{
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-sm)',
                color: 'var(--admin-gray-500)',
                margin: 0,
              }}>
                {action.desc}
              </p>
            </Link>
          ))}
          <Link href="/" target="_blank" className="admin-card" style={{
            textDecoration: 'none',
            display: 'block',
            background: 'linear-gradient(135deg, var(--admin-blue-500) 0%, var(--admin-blue-600) 100%)',
            border: 'none',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--admin-space-3)' }}><ArrowUpRight size={24} /></div>
            <p style={{
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-lg)',
              fontWeight: 600,
              color: '#fff',
              margin: '0 0 var(--admin-space-2)',
            }}>
              View Live Site
            </p>
            <p style={{
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
            }}>
              See your changes on the website
            </p>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <div className="admin-recent-section" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--admin-space-8)',
        marginTop: 'var(--admin-space-12)',
      }}>
        <div className="admin-card">
          <h2 className="admin-section-heading">Recent Testimonials</h2>
          {recentTestimonials && recentTestimonials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
              {recentTestimonials.map((t) => (
                <Link key={t.id} href={`/admin/testimonials/${t.id}/edit`} className="admin-recent-item" style={{
                  padding: 'var(--admin-space-4)',
                  background: 'var(--admin-gray-50)',
                  borderRadius: 'var(--admin-radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--admin-transition-fast), transform var(--admin-transition-fast)',
                  border: '1px solid var(--admin-gray-200)',
                  display: 'block',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-space-1)', gap: 'var(--admin-space-3)' }}>
                    <span style={{
                      fontFamily: 'var(--admin-font-body)',
                      fontSize: 'var(--admin-text-sm)',
                      fontWeight: 600,
                      color: 'var(--admin-gray-900)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {t.name}
                    </span>
                    <span className={`admin-badge ${t.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--admin-font-body)',
                    fontSize: 'var(--admin-text-xs)',
                    color: 'var(--admin-gray-400)',
                  }}>
                    {'★'.repeat(t.rating)} · {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              color: 'var(--admin-gray-400)',
              padding: 'var(--admin-space-8) var(--admin-space-5)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              No testimonials yet
            </p>
          )}
          <Link href="/admin/testimonials" style={{
            display: 'block',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            color: 'var(--admin-blue-500)',
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            padding: 'var(--admin-space-3)',
            borderRadius: 'var(--admin-radius-sm)',
            transition: 'background var(--admin-transition-fast)',
          }}>
            View All Testimonials →
          </Link>
        </div>

        <div className="admin-card">
          <h2 className="admin-section-heading">Recent Services</h2>
          {recentServices && recentServices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-3)', marginBottom: 'var(--admin-space-4)' }}>
              {recentServices.map((s) => (
                <Link key={s.id} href={`/admin/services/${s.id}/edit`} className="admin-recent-item" style={{
                  padding: 'var(--admin-space-4)',
                  background: 'var(--admin-gray-50)',
                  borderRadius: 'var(--admin-radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--admin-transition-fast), transform var(--admin-transition-fast)',
                  border: '1px solid var(--admin-gray-200)',
                  display: 'block',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-space-1)', gap: 'var(--admin-space-3)' }}>
                    <span style={{
                      fontFamily: 'var(--admin-font-body)',
                      fontSize: 'var(--admin-text-sm)',
                      fontWeight: 600,
                      color: 'var(--admin-gray-900)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.title}
                    </span>
                    <span className={`admin-badge ${s.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                      {s.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--admin-font-body)',
                    fontSize: 'var(--admin-text-xs)',
                    color: 'var(--admin-gray-400)',
                  }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--admin-font-body)',
              fontSize: 'var(--admin-text-sm)',
              color: 'var(--admin-gray-400)',
              padding: 'var(--admin-space-8) var(--admin-space-5)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              No services yet
            </p>
          )}
          <Link href="/admin/services" style={{
            display: 'block',
            fontFamily: 'var(--admin-font-body)',
            fontSize: 'var(--admin-text-sm)',
            color: 'var(--admin-blue-500)',
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            padding: 'var(--admin-space-3)',
            borderRadius: 'var(--admin-radius-sm)',
            transition: 'background var(--admin-transition-fast)',
          }}>
            View All Services →
          </Link>
        </div>
      </div>
    </div>
  )
}
