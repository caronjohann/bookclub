import { createHash, randomBytes } from 'node:crypto'
import { addDays } from '../lib/date'
import { SESSION_TTL_DAYS } from './constants'

export const hashSessionToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex')
}

export const generateSessionTokenAndExpiry = () => {
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashSessionToken(rawToken)
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS)

  return { rawToken, tokenHash, expiresAt }
}
