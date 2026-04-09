'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { artifacts, artifactTexts } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { redirect } from 'next/navigation'
import { z } from 'zod'

type AddTextArtifactResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        title?: string
        description?: string
        sourceUrl?: string
        content?: string
      }
      formError?: string
    }

const addTextArtifactSchema = z.object({
  title: z.string().trim().max(200, `Title can't exceed ${200} characters.`).nullable(),
  description: z.string().trim().nullable(),
  sourceUrl: z.url().trim().nullable(),
  content: z.string().trim().min(1, 'Content is required.'),
})

export async function addTextArtifactAction(
  _prevState: AddTextArtifactResult | null,
  formData: FormData,
) {
  const safeParseResult = addTextArtifactSchema.safeParse({
    title: getStringField(formData, 'title'),
    description: getStringField(formData, 'description'),
    sourceUrl: getStringField(formData, 'sourceUrl'),
    content: getStringField(formData, 'content'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        title: flattenedErrors.fieldErrors.title?.[0],
        description: flattenedErrors.fieldErrors.description?.[0],
        sourceUrl: flattenedErrors.fieldErrors.sourceUrl?.[0],
        content: flattenedErrors.fieldErrors.content?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const { title, description, sourceUrl, content } = safeParseResult.data

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
          type: 'text',
          title,
          description,
          sourceUrl,
        })
        .returning({ artifactId: artifacts.id })

      await tx.insert(artifactTexts).values({
        artifactId,
        content,
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
