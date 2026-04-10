'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { collections } from '@/src/db/schema'
import { getPostgresErrorDetails } from '@/src/lib/db-errors'
import { getStringField } from '@/src/lib/form-data'
import { normalizeName } from '@/src/lib/normalize'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type AddArchiveResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        name?: string
        isPrivate?: string
      }
      formError?: string
    }

const addArchiveSchema = z.object({
  name: z.string().trim().max(200, `Name can't exceed ${200} characters.`),
  isPrivate: z
    .literal('on')
    .optional()
    .transform((val) => val === 'on'),
})

export async function addArchiveAction(
  _prevState: AddArchiveResult | null,
  formData: FormData,
): Promise<AddArchiveResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  const safeParseResult = addArchiveSchema.safeParse({
    name: getStringField(formData, 'name'),
    isPrivate: formData.get('isPrivate') ?? undefined,
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        name: flattenedErrors.fieldErrors.name?.[0],
        isPrivate: flattenedErrors.fieldErrors.isPrivate?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const { name, isPrivate } = safeParseResult.data

  try {
    await db.insert(collections).values({
      userId: user.id,
      name: name,
      normalizedName: normalizeName(name),
      isPrivate,
    })
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
