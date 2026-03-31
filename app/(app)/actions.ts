'use server'

import { deleteSession } from '@/src/auth/session'
import { setSessionCookie } from '@/src/auth/session-cookie'
import { redirect } from 'next/navigation'

export const logoutAction = async (): Promise<never> => {
  await deleteSession()
  await setSessionCookie('', new Date(0))
  redirect('/sign-in')
}
