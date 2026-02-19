'use server'

import { revalidatePath } from 'next/cache'
import { BASE_URL } from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/security/audit-log'
import { sanitizeString, validateEmail } from '@/lib/security/input-validation'
import type { AppRole } from '@/lib/types'
import { assertAdmin, enforceRateLimit, getAuthenticatedUser } from './_helpers'

export async function inviteUser(emailInput: string, roleInput: AppRole, fullNameInput?: string) {
  try {
    const { supabase, user, role } = await getAuthenticatedUser()
    assertAdmin(role)
    await enforceRateLimit(user.id, 'user_invite')

    const email = sanitizeString(emailInput || '', 320).toLowerCase()
    const fullName = sanitizeString(fullNameInput || '', 150)

    if (!validateEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    if (!['admin', 'editor', 'viewer'].includes(roleInput)) {
      return { success: false, error: 'Invalid role selected.' }
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (existingProfile) {
      return { success: false, error: 'A user with this email already exists.' }
    }

    const adminClient = createAdminClient()
    const redirectTo = `${BASE_URL}/auth/set-password`

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        full_name: fullName || undefined,
      },
    })

    if (inviteError) {
      const message = inviteError.message || 'Failed to send invite email.'
      const redirectConfigIssue = /redirect|invalid.*url|not allowed/i.test(message)
      if (redirectConfigIssue) {
        return {
          success: false,
          error: `Supabase blocked the invite redirect URL. Add ${redirectTo} in Supabase Auth -> URL Configuration -> Redirect URLs.`,
        }
      }
      return { success: false, error: message }
    }

    const invitedUserId = inviteData.user?.id
    if (!invitedUserId) {
      return { success: false, error: 'Invitation was created but user record is missing.' }
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: invitedUserId,
        email,
        full_name: fullName || null,
        role: roleInput,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    await logAuditEvent({
      action: 'user.invite',
      user_id: user.id,
      resource_type: 'user',
      resource_id: invitedUserId,
      details: {
        invited_email: email,
        invited_role: roleInput,
      },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation.',
    }
  }
}

export async function getUsers() {
  const { supabase, role } = await getAuthenticatedUser()
  assertAdmin(role)

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return profiles || []
}

export async function updateUserRole(userId: string, newRole: AppRole) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'user_role')

  if (userId === user.id) {
    throw new Error('You cannot change your own role')
  }

  if (!['admin', 'editor', 'viewer'].includes(newRole)) {
    throw new Error('Invalid role')
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', userId)
    .single()

  if (!currentProfile) {
    throw new Error('User not found')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'user.role_change',
    user_id: user.id,
    resource_type: 'user',
    resource_id: userId,
    details: {
      target_email: currentProfile.email,
      old_role: currentProfile.role,
      new_role: newRole,
    },
  })

  revalidatePath('/admin/users')
}
