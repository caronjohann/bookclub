import 'server-only'
import { cookies } from 'next/headers'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../db'
import { sessions, users } from '../db/schema'
import { hashSessionToken } from './token'

export const getCurrentUser = async () => {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get('session')?.value

  if (!rawToken) {
    return null
  }

  const tokenHash = hashSessionToken(rawToken)

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1)

  if (!row) {
    return null
  }

  return {
    id: row.id,
    email: row.email,
  }
}
