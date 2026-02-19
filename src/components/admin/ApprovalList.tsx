'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approvePendingChange, rejectPendingChange } from '@/app/admin/actions'
import type { PendingChange } from '@/lib/types'

interface ApprovalListProps {
    pendingChanges: PendingChange[]
    recentlyReviewed: PendingChange[]
}

function getActionBadgeClass(action: string): string {
    switch (action) {
        case 'create': return 'admin-badge--create'
        case 'update': return 'admin-badge--update'
        case 'publish': return 'admin-badge--publish'
        case 'unpublish': return 'admin-badge--unpublish'
        case 'delete': return 'admin-badge--danger'
        case 'set_primary': return 'admin-badge--info'
        default: return 'admin-badge--neutral'
    }
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'approved': return 'admin-badge--approved'
        case 'rejected': return 'admin-badge--rejected'
        case 'pending': return 'admin-badge--pending'
        default: return 'admin-badge--neutral'
    }
}

export default function ApprovalList({ pendingChanges, recentlyReviewed }: ApprovalListProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [rejectionNote, setRejectionNote] = useState<string>('')
    const [showRejectFor, setShowRejectFor] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        setProcessingId(id)
        try {
            await approvePendingChange(id)
            router.refresh()
        } catch {
            alert('Failed to approve change')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (id: string) => {
        setProcessingId(id)
        try {
            await rejectPendingChange(id, rejectionNote || undefined)
            setShowRejectFor(null)
            setRejectionNote('')
            router.refresh()
        } catch {
            alert('Failed to reject change')
        } finally {
            setProcessingId(null)
        }
    }

    const getSubmitterName = (change: PendingChange) => {
        const profile = change.submitter_profile
        if (profile) {
            return profile.full_name || profile.email
        }
        return 'Unknown'
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-10)' }}>
            {/* Pending Changes */}
            <section>
                <h2 className="admin-section-heading">
                    Pending Changes ({pendingChanges.length})
                </h2>
                {pendingChanges.length === 0 ? (
                    <div className="admin-empty-state">
                        <p className="admin-empty-state__title">All caught up! 🎉</p>
                        <p className="admin-empty-state__description">No pending changes require your approval.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-4)' }}>
                        {pendingChanges.map((change) => (
                            <div key={change.id} className="admin-card">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 'var(--admin-space-3)',
                                    gap: 'var(--admin-space-3)',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--admin-space-2)', flexWrap: 'wrap' }}>
                                        <span className={`admin-badge ${getActionBadgeClass(change.action)}`}>{change.action}</span>
                                        <span className="admin-badge admin-badge--neutral">{change.resource_type}</span>
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--admin-font-body)',
                                        fontSize: 'var(--admin-text-xs)',
                                        color: 'var(--admin-gray-400)',
                                    }}>
                                        {new Date(change.created_at).toLocaleDateString()} at{' '}
                                        {new Date(change.created_at).toLocaleTimeString()}
                                    </span>
                                </div>

                                <p style={{
                                    fontFamily: 'var(--admin-font-body)',
                                    fontSize: 'var(--admin-text-sm)',
                                    color: 'var(--admin-gray-500)',
                                    margin: '0 0 var(--admin-space-3)',
                                    lineHeight: 1.6,
                                }}>
                                    Submitted by <strong style={{ color: 'var(--admin-gray-700)' }}>{getSubmitterName(change)}</strong>
                                    {change.resource_id && <> · ID: <code style={{
                                        fontFamily: 'monospace',
                                        background: 'var(--admin-gray-100)',
                                        padding: '2px 6px',
                                        borderRadius: 'var(--admin-radius-sm)',
                                        fontSize: 'var(--admin-text-xs)',
                                    }}>{change.resource_id.slice(0, 8)}</code></>}
                                </p>

                                {/* Action buttons */}
                                {showRejectFor === change.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-3)' }}>
                                        <input
                                            type="text"
                                            placeholder="Optional rejection note..."
                                            value={rejectionNote}
                                            onChange={(e) => setRejectionNote(e.target.value)}
                                            className="admin-input"
                                            style={{ maxWidth: '400px' }}
                                        />
                                        <div style={{ display: 'flex', gap: 'var(--admin-space-2)' }}>
                                            <button
                                                onClick={() => handleReject(change.id)}
                                                disabled={processingId === change.id}
                                                className="admin-btn admin-btn--danger"
                                            >
                                                {processingId === change.id ? 'Rejecting...' : 'Confirm Reject'}
                                            </button>
                                            <button
                                                onClick={() => { setShowRejectFor(null); setRejectionNote('') }}
                                                className="admin-btn admin-btn--secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: 'var(--admin-space-3)' }}>
                                        <button
                                            onClick={() => handleApprove(change.id)}
                                            disabled={processingId === change.id}
                                            className="admin-btn admin-btn--success"
                                        >
                                            {processingId === change.id ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectFor(change.id)}
                                            className="admin-btn admin-btn--danger-outline"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recently Reviewed */}
            {recentlyReviewed.length > 0 && (
                <section>
                    <h2 className="admin-section-heading">
                        Recently Reviewed
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-3)' }}>
                        {recentlyReviewed.map((change) => (
                            <div key={change.id} className="admin-card" style={{ padding: 'var(--admin-space-4)' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 'var(--admin-space-3)',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--admin-space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className={`admin-badge ${getActionBadgeClass(change.action)}`}>{change.action}</span>
                                        <span className="admin-badge admin-badge--neutral">{change.resource_type}</span>
                                        <span className={`admin-badge ${getStatusBadgeClass(change.status)}`}>{change.status}</span>
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--admin-font-body)',
                                        fontSize: 'var(--admin-text-xs)',
                                        color: 'var(--admin-gray-400)',
                                    }}>
                                        {new Date(change.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {change.review_note && (
                                    <p style={{
                                        fontFamily: 'var(--admin-font-body)',
                                        fontSize: 'var(--admin-text-sm)',
                                        color: 'var(--admin-danger-700)',
                                        marginTop: 'var(--admin-space-2)',
                                        marginBottom: 0,
                                        background: 'var(--admin-danger-50)',
                                        padding: 'var(--admin-space-2) var(--admin-space-3)',
                                        borderRadius: 'var(--admin-radius-sm)',
                                    }}>
                                        Note: {change.review_note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
