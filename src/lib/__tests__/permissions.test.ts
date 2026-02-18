import { describe, it, expect } from 'vitest'
import {
  canEditContent,
  canPublishDirectly,
  canDeleteContent,
  canApproveChanges,
  canViewDashboard,
  canManageUsers,
  getRoleLabel,
  getRoleDescription,
} from '@/lib/permissions'

describe('canEditContent', () => {
  it('allows admin to edit', () => {
    expect(canEditContent('admin')).toBe(true)
  })

  it('allows editor to edit', () => {
    expect(canEditContent('editor')).toBe(true)
  })

  it('denies viewer from editing', () => {
    expect(canEditContent('viewer')).toBe(false)
  })
})

describe('canPublishDirectly', () => {
  it('allows admin to publish directly', () => {
    expect(canPublishDirectly('admin')).toBe(true)
  })

  it('denies editor from publishing directly', () => {
    expect(canPublishDirectly('editor')).toBe(false)
  })

  it('denies viewer from publishing directly', () => {
    expect(canPublishDirectly('viewer')).toBe(false)
  })
})

describe('canDeleteContent', () => {
  it('allows admin to delete', () => {
    expect(canDeleteContent('admin')).toBe(true)
  })

  it('denies editor from deleting', () => {
    expect(canDeleteContent('editor')).toBe(false)
  })

  it('denies viewer from deleting', () => {
    expect(canDeleteContent('viewer')).toBe(false)
  })
})

describe('canApproveChanges', () => {
  it('allows admin to approve changes', () => {
    expect(canApproveChanges('admin')).toBe(true)
  })

  it('denies editor from approving changes', () => {
    expect(canApproveChanges('editor')).toBe(false)
  })

  it('denies viewer from approving changes', () => {
    expect(canApproveChanges('viewer')).toBe(false)
  })
})

describe('canViewDashboard', () => {
  it('allows admin to view dashboard', () => {
    expect(canViewDashboard('admin')).toBe(true)
  })

  it('allows editor to view dashboard', () => {
    expect(canViewDashboard('editor')).toBe(true)
  })

  it('allows viewer to view dashboard', () => {
    expect(canViewDashboard('viewer')).toBe(true)
  })
})

describe('canManageUsers', () => {
  it('allows admin to manage users', () => {
    expect(canManageUsers('admin')).toBe(true)
  })

  it('denies editor from managing users', () => {
    expect(canManageUsers('editor')).toBe(false)
  })

  it('denies viewer from managing users', () => {
    expect(canManageUsers('viewer')).toBe(false)
  })
})

describe('getRoleLabel', () => {
  it('returns Admin label for admin role', () => {
    expect(getRoleLabel('admin')).toBe('Admin')
  })

  it('returns Editor label for editor role', () => {
    expect(getRoleLabel('editor')).toBe('Editor')
  })

  it('returns Viewer label for viewer role', () => {
    expect(getRoleLabel('viewer')).toBe('Viewer')
  })
})

describe('getRoleDescription', () => {
  it('mentions full access for admin', () => {
    expect(getRoleDescription('admin')).toContain('Full access')
  })

  it('mentions approval requirement for editor', () => {
    expect(getRoleDescription('editor')).toContain('approval')
  })

  it('mentions read-only for viewer', () => {
    expect(getRoleDescription('viewer')).toContain('Read-only')
  })
})
