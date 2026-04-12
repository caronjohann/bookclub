'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { collections } from '@/src/db/schema'
import { getPostgresErrorDetails } from '@/src/lib/db-errors'
import { getStringField } from '@/src/lib/form-data'
import { normalizeName } from '@/src/lib/normalize'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type EditArchiveResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        name?: string
        isPrivate?: string
      }
      formError?: string
    }

const editArchiveSchema = z.object({
  archiveId: z.uuid(),
  name: z.string().trim().max(200, `Name can't exceed ${200} characters.`),
  isPrivate: z
    .literal('on')
    .optional()
    .transform((val) => val === 'on'),
})

export async function editArchiveAction(
  _prevState: EditArchiveResult | null,
  formData: FormData,
): Promise<EditArchiveResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  const safeParseResult = editArchiveSchema.safeParse({
    archiveId: getStringField(formData, 'archiveId'),
    name: getStringField(formData, 'name'),
    isPrivate: formData.get('isPrivate') ?? undefined,
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)
    const hasArchiveIdError = !!flattenedErrors.fieldErrors.archiveId?.[0]

    return {
      success: false,
      fieldErrors: {
        name: flattenedErrors.fieldErrors.name?.[0],
        isPrivate: flattenedErrors.fieldErrors.isPrivate?.[0],
      },
      formError: hasArchiveIdError
        ? 'Something went wrong. Please try again.'
        : flattenedErrors.formErrors[0],
    }
  }

  const { archiveId, name, isPrivate } = safeParseResult.data

  try {
    await db
      .update(collections)
      .set({
        name: name,
        normalizedName: normalizeName(name),
        isPrivate,
      })
      .where(and(eq(collections.id, archiveId), eq(collections.userId, user.id)))
  } catch (err) {
    const postgresErrorDetails = getPostgresErrorDetails(err)

    if (
      postgresErrorDetails?.code === '23505' &&
      postgresErrorDetails.constraint === 'collections_user_id_name_unique_idx'
    ) {
      return {
        success: false,
        fieldErrors: {
          name: 'You already have an archive with this name.',
        },
      }
    }
    console.error(err)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect(`/users/${user.id}`)
}
