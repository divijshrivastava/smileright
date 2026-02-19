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
        <div className="admin-page-content">
            <div className="admin-page-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--admin-space-4)',
            }}>
                <h1 className="admin-page-title">Content Approvals</h1>
                <span className="admin-chip" style={{
                    padding: 'var(--admin-space-2) var(--admin-space-4)',
                    borderRadius: 'var(--admin-radius-full)',
                    fontSize: 'var(--admin-text-sm)',
                    fontWeight: 600,
                    fontFamily: 'var(--admin-font-body)',
                }}>
                    {pendingChanges?.length ?? 0} pending
                </span>
            </div>

            <ApprovalList
                pendingChanges={(pendingChanges as PendingChange[]) ?? []}
                recentlyReviewed={(recentlyReviewed as PendingChange[]) ?? []}
            />
        </div>
    )
}
