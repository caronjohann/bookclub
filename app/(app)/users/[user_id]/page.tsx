import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { eq, and } from 'drizzle-orm'
import { collections, users } from '@/src/db/schema'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id: userIdParams } = await params

  const [currentUser, [profileUser]] = await Promise.all([
    getCurrentUser(),
    db.select().from(users).where(eq(users.id, userIdParams)).limit(1),
  ])

  if (!profileUser) notFound()

  const isOwner = currentUser?.id === userIdParams

  const userCollections = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.userId, userIdParams),
        isOwner ? undefined : eq(collections.isPrivate, false),
      ),
    )

  return (
    <div>
      <h1>{profileUser.email}</h1>
      <div>
        <h2>Archives</h2>
        {isOwner && <Link href={`/users/${userIdParams}/archives/new`}>+ Create archive</Link>}
      </div>
      <div>
        {userCollections.map((userCollection) => (
          <Link
            key={userCollection.id}
            href={`/users/${userIdParams}/archives/${userCollection.id}`}
          >
            {userCollection.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
