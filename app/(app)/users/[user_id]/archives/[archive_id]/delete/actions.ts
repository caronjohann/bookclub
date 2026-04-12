'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { collections } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type DeleteArchiveResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        archiveId?: string
      }
      formError?: string
    }

const deleteArchiveSchema = z.object({
  archiveId: z.uuid(),
})

export async function deleteArchiveAction(
  _prevState: DeleteArchiveResult | null,
  formData: FormData,
): Promise<DeleteArchiveResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  const safeParseResult = deleteArchiveSchema.safeParse({
    archiveId: getStringField(formData, 'archiveId'),
  })

  if (!safeParseResult.success) {
    return {
      success: false,
      fieldErrors: {},
      formError: 'Invalid or missing archive ID.',
    }
  }

  const { archiveId } = safeParseResult.data

  try {
    await db
      .delete(collections)
      .where(and(eq(collections.id, archiveId), eq(collections.userId, user.id)))
  } catch (err) {
    console.error(err)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect(`/users/${user.id}`)
}
