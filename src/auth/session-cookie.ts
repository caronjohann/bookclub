import 'server-only'
import { cookies } from 'next/headers'

export const setSessionCookie = async (token: string, expiresAt: Date): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}
