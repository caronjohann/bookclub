import { createHash } from 'node:crypto'

export const hashSessionToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex')
}
