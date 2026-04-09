'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { artifacts, artifactUrls } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type AddUrlArtifactResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        title?: string
        description?: string
        targetUrl?: string
      }
      formError?: string
    }

const addUrlArtifactSchema = z.object({
  title: z.string().trim().max(200, `Title can't exceed ${200} characters.`).nullable(),
  description: z.string().trim().nullable(),
  targetUrl: z.url().trim(),
})

export async function addUrlArtifactAction(
  _prevState: AddUrlArtifactResult | null,
  formData: FormData,
) {
  const safeParseResult = addUrlArtifactSchema.safeParse({
    title: getStringField(formData, 'title'),
    description: getStringField(formData, 'description'),
    targetUrl: getStringField(formData, 'sourceUrl'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        title: flattenedErrors.fieldErrors.title?.[0],
        description: flattenedErrors.fieldErrors.description?.[0],
        targetUrl: flattenedErrors.fieldErrors.targetUrl?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const { title, description, targetUrl } = safeParseResult.data

  const user = await getCurrentUser()

  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  try {
    await db.transaction(async (tx) => {
      const [{ artifactId }] = await tx
        .insert(artifacts)
        .values({
          creatorUserId: user.id,
          type: 'url',
          title,
          description,
        })
        .returning({ artifactId: artifacts.id })

      await tx.insert(artifactUrls).values({
        artifactId,
        targetUrl,
      })
    })
  } catch (err) {
    console.error(err)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect('/index')
}
