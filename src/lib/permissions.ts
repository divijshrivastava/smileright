import type { AppRole } from '@/lib/types'

/**
 * Role-based permission checks.
 *
 * Admin:  full access, instant publishing
 * Editor: can create/edit content, needs admin approval to publish
 * Viewer: read-only access to the admin dashboard
 */

export function canEditContent(role: AppRole): boolean {
    return role === 'admin' || role === 'editor'
}

export function canPublishDirectly(role: AppRole): boolean {
    return role === 'admin'
}

export function canDeleteContent(role: AppRole): boolean {
    return role === 'admin'
}

export function canApproveChanges(role: AppRole): boolean {
    return role === 'admin'
}

export function canViewDashboard(role: AppRole): boolean {
    return role === 'admin' || role === 'editor' || role === 'viewer'
}

export function canManageUsers(role: AppRole): boolean {
    return role === 'admin'
}

export function getRoleLabel(role: AppRole): string {
    switch (role) {
        case 'admin': return 'Admin'
        case 'editor': return 'Editor'
        case 'viewer': return 'Viewer'
        default: return role
    }
}

export function getRoleDescription(role: AppRole): string {
    switch (role) {
        case 'admin': return 'Full access. Changes are published instantly.'
        case 'editor': return 'Can create and edit content. Requires admin approval to publish.'
        case 'viewer': return 'Read-only access to the dashboard.'
        default: return ''
    }
}
