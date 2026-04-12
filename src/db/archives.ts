import 'server-only'

import { db } from '.'
import { collections } from './schema'
import { eq, and } from 'drizzle-orm'

export async function getArchiveById(archiveId: string, userId?: string) {
  const whereClause = userId
    ? and(eq(collections.id, archiveId), eq(collections.userId, userId))
    : eq(collections.id, archiveId)

  const [archive] = await db.select().from(collections).where(whereClause).limit(1)

  return archive || null
}
