'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approvePendingChange, rejectPendingChange } from '@/app/admin/actions'
import type { PendingChange } from '@/lib/types'
import { CheckCircle, XCircle, Clock, History } from 'lucide-react'

interface ApprovalListProps {
    pendingChanges: PendingChange[]
    recentlyReviewed: PendingChange[]
}

export default function ApprovalList({ pendingChanges, recentlyReviewed }: ApprovalListProps) {
    const router = useRouter()
    const [processing, setProcessing] = useState<string | null>(null)
    const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
    const [showRejectInput, setShowRejectInput] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this change? It will be applied immediately.')) return
        setProcessing(id)
        try {
            await approvePendingChange(id)
            router.refresh()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to approve')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (id: string) => {
        setProcessing(id)
        try {
            await rejectPendingChange(id, rejectNote[id] || undefined)
            setShowRejectInput(null)
            router.refresh()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to reject')
        } finally {
            setProcessing(null)
        }
    }

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'create': return 'Create'
            case 'update': return 'Update'
            case 'publish': return 'Publish'
            case 'unpublish': return 'Unpublish'
            default: return action
        }
    }

    const getResourceLabel = (type: string) => {
        switch (type) {
            case 'testimonial': return 'Testimonial'
            case 'service': return 'Service'
            case 'trust_image': return 'Trust Image'
            case 'blog': return 'Blog'
            default: return type
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return { bg: '#d4edda', color: '#155724' }
            case 'update': return { bg: '#d1ecf1', color: '#0c5460' }
            case 'publish': return { bg: '#cce5ff', color: '#004085' }
            case 'unpublish': return { bg: '#f8d7da', color: '#721c24' }
            default: return { bg: '#e2e3e5', color: '#383d41' }
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return { bg: '#d4edda', color: '#155724' }
            case 'rejected': return { bg: '#f8d7da', color: '#721c24' }
            default: return { bg: '#fff3cd', color: '#856404' }
        }
    }

    const getSubmitterName = (change: PendingChange) => {
        const profile = change.submitter_profile
        if (profile) {
            return profile.full_name || profile.email
        }
        return 'Unknown user'
    }

    const formatDateTime = (isoDate: string) => {
        const parsed = new Date(isoDate)
        if (Number.isNaN(parsed.getTime())) return 'Unknown date'
        // Keep SSR/client output identical to avoid hydration mismatch.
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC',
        }).format(parsed)
    }

    return (
        <div>
            {/* Pending Changes */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    <Clock size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Pending Approval ({pendingChanges.length})
                </h2>

                {pendingChanges.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}><CheckCircle size={32} color="#28a745" /></div>
                        <p style={styles.emptyText}>No pending changes. All caught up!</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {pendingChanges.map((change) => {
                            const actionColor = getActionColor(change.action)
                            return (
                                <div key={change.id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardInfo}>
                                            <div style={styles.badges}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: actionColor.bg,
                                                    color: actionColor.color,
                                                }}>
                                                    {getActionLabel(change.action)}
                                                </span>
                                                <span style={styles.resourceBadge}>
                                                    {getResourceLabel(change.resource_type)}
                                                </span>
                                            </div>
                                            <p style={styles.submitter}>
                                                Submitted by <strong>{getSubmitterName(change)}</strong>
                                            </p>
                                            <p style={styles.date}>
                                                {formatDateTime(change.created_at)}
                                            </p>
                                        </div>

                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={() => handleApprove(change.id)}
                                                disabled={processing === change.id}
                                                style={{
                                                    ...styles.approveBtn,
                                                    opacity: processing === change.id ? 0.6 : 1,
                                                }}
                                            >
                                                {processing === change.id ? '...' : 'Approve'}
                                            </button>

                                            {showRejectInput === change.id ? (
                                                <div style={styles.rejectInputGroup}>
                                                    <input
                                                        type="text"
                                                        placeholder="Reason (optional)"
                                                        value={rejectNote[change.id] || ''}
                                                        onChange={(e) => setRejectNote({ ...rejectNote, [change.id]: e.target.value })}
                                                        style={styles.rejectInput}
                                                    />
                                                    <button
                                                        onClick={() => handleReject(change.id)}
                                                        disabled={processing === change.id}
                                                        style={styles.confirmRejectBtn}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRejectInput(null)}
                                                        style={styles.cancelBtn}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowRejectInput(change.id)}
                                                    disabled={processing === change.id}
                                                    style={styles.rejectBtn}
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payload preview */}
                                    {change.payload && Object.keys(change.payload).length > 0 && (
                                        <div style={styles.payloadPreview}>
                                            <p style={styles.payloadLabel}>Change details:</p>
                                            <div style={styles.payloadContent}>
                                                {Object.entries(change.payload).map(([key, value]) => (
                                                    <span key={key} style={styles.payloadItem}>
                                                        <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Recently Reviewed */}
            {recentlyReviewed.length > 0 && (
                <section style={{ ...styles.section, marginTop: '3rem' }}>
                    <h2 style={styles.sectionTitle}>
                        <History size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Recently Reviewed
                    </h2>
                    <div style={styles.list}>
                        {recentlyReviewed.map((change) => {
                            const statusStyle = getStatusStyle(change.status)
                            return (
                                <div key={change.id} style={{ ...styles.card, opacity: 0.85 }}>
                                    <div style={styles.cardHeader}>
                                        <div style={styles.cardInfo}>
                                            <div style={styles.badges}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,
                                                }}>
                                                    {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                                                </span>
                                                <span style={styles.resourceBadge}>
                                                    {getActionLabel(change.action)} {getResourceLabel(change.resource_type)}
                                                </span>
                                            </div>
                                            <p style={styles.submitter}>
                                                By <strong>{getSubmitterName(change)}</strong>
                                            </p>
                                            <p style={styles.date}>
                                                {formatDateTime(change.updated_at)}
                                            </p>
                                            {change.review_note && (
                                                <p style={styles.reviewNote}>
                                                    Note: {change.review_note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    section: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontFamily: 'var(--font-serif)',
        fontSize: '1.3rem',
        color: '#292828',
        marginBottom: '1.5rem',
        fontWeight: 600,
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    card: {
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        flexWrap: 'wrap' as const,
    },
    cardInfo: {
        flex: 1,
        minWidth: '200px',
    },
    badges: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
        flexWrap: 'wrap' as const,
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    resourceBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        background: '#e9ecef',
        color: '#495057',
    },
    submitter: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem',
        color: '#333',
        margin: '4px 0',
    },
    date: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.8rem',
        color: '#999',
        margin: 0,
    },
    reviewNote: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        color: '#856404',
        margin: '4px 0 0',
        fontStyle: 'italic',
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    approveBtn: {
        padding: '8px 20px',
        background: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    rejectBtn: {
        padding: '8px 20px',
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
    },
    rejectInputGroup: {
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    rejectInput: {
        padding: '6px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-sans)',
        width: '180px',
    },
    confirmRejectBtn: {
        padding: '6px 14px',
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '6px 14px',
        background: '#f5f5f5',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
    },
    payloadPreview: {
        marginTop: '12px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '6px',
        borderLeft: '3px solid #1B73BA',
    },
    payloadLabel: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.75rem',
        color: '#999',
        margin: '0 0 6px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
    },
    payloadContent: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap' as const,
    },
    payloadItem: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        color: '#333',
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '3rem 2rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px dashed #dee2e6',
    },
    emptyIcon: {
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontFamily: 'var(--font-sans)',
        fontSize: '1rem',
        color: '#666',
        margin: 0,
    },
}
