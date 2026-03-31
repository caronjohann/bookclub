import 'server-only'

import { cookies } from 'next/headers'

export const setSessionCookie = async (rawToken: string, expiresAt: Date): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set('session', rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}
