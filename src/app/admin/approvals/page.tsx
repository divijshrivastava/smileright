import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApprovalList from '@/components/admin/ApprovalList'
import type { PendingChange } from '@/lib/types'

export default async function ApprovalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Only admins can access this page  
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/admin')
    }

    // Fetch pending changes with submitter info
    const { data: pendingChanges } = await supabase
        .from('pending_changes')
        .select(`
      *,
      submitter_profile:profiles!pending_changes_submitted_by_profile_fkey(email, full_name)
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)

    // Also fetch recently reviewed changes
    const { data: recentlyReviewed } = await supabase
        .from('pending_changes')
        .select(`
      *,
      submitter_profile:profiles!pending_changes_submitted_by_profile_fkey(email, full_name)
    `)
        .in('status', ['approved', 'rejected'])
        .order('updated_at', { ascending: false })
        .limit(20)

    return (
        <div>
            <div style={styles.header} className="admin-page-header">
                <h1 style={styles.title}>Content Approvals</h1>
                <div style={styles.stats}>
                    <span style={styles.pendingBadge}>
                        {pendingChanges?.length ?? 0} pending
                    </span>
                </div>
            </div>

            <ApprovalList
                pendingChanges={(pendingChanges as PendingChange[]) ?? []}
                recentlyReviewed={(recentlyReviewed as PendingChange[]) ?? []}
            />
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    title: {
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#292828',
        margin: 0,
    },
    stats: {
        display: 'flex',
        gap: '0.75rem',
    },
    pendingBadge: {
        padding: '8px 16px',
        background: '#fff3cd',
        color: '#856404',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
    },
}
