'use server'

import { revalidatePath } from 'next/cache'
import { enforceRateLimit, getAuthenticatedUser } from './_helpers'

export async function revalidateHomePage() {
  const { user } = await getAuthenticatedUser()
  await enforceRateLimit(user.id, 'revalidate')
  revalidatePath('/', 'page')
}
