'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { artifactImages, artifacts } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { processAndUploadImage } from '@/src/lib/image'
import { del } from '@vercel/blob'

type AddImageArtifactResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        title?: string
        description?: string
        sourceUrl?: string
        imageUrl?: string
        imageFile?: string
      }
      formError?: string
    }

const addImageArtifactSchema = z.object({
  title: z.string().trim().max(200, `Title can't exceed ${200} characters.`).nullable(),
  description: z.string().trim().nullable(),
  sourceUrl: z.url().trim().nullable(),
  imageUrl: z.url().trim().nullable(),
  imageFile: z
    .file()
    .mime(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'])
    .max(5 * 1024 * 1024, `Image can't exceed ${5}MB.`)
    .nullable(),
})

export async function addImageArtifactAction(
  _prevState: AddImageArtifactResult | null,
  formData: FormData,
): Promise<AddImageArtifactResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  const safeParseResult = addImageArtifactSchema.safeParse({
    title: getStringField(formData, 'title'),
    description: getStringField(formData, 'description'),
    sourceUrl: getStringField(formData, 'sourceUrl'),
    imageUrl: getStringField(formData, 'imageUrl'),
    imageFile: formData.get('imageFile'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        title: flattenedErrors.fieldErrors.title?.[0],
        description: flattenedErrors.fieldErrors.description?.[0],
        sourceUrl: flattenedErrors.fieldErrors.sourceUrl?.[0],
        imageUrl: flattenedErrors.fieldErrors.imageUrl?.[0],
        imageFile: flattenedErrors.fieldErrors.imageFile?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const {
    title,
    description,
    sourceUrl,
    imageFile: rawImageFile,
    imageUrl: rawImageUrl,
  } = safeParseResult.data

  if (!rawImageFile && !rawImageUrl) {
    return { success: false, fieldErrors: {}, formError: 'Provide an image file or URL.' }
  }

  const artifactId = crypto.randomUUID()

  let uploadedUrls: { imageUrl: string; thumbnailUrl: string } | undefined

  try {
    let imageFile: File

    if (rawImageFile) {
      imageFile = rawImageFile
    } else {
      const res = await fetch(rawImageUrl as string)
      if (!res.ok) throw new Error('Failed to fetch image')
      const blob = await res.blob()
      imageFile = new File([blob], 'remote-image', { type: blob.type })
    }

    uploadedUrls = await processAndUploadImage(imageFile, artifactId)

    const { imageUrl, thumbnailUrl } = uploadedUrls

    await db.transaction(async (tx) => {
      await tx.insert(artifacts).values({
        id: artifactId,
        creatorUserId: user.id,
        type: 'image',
        title,
        description,
        sourceUrl,
      })

      await tx.insert(artifactImages).values({
        artifactId,
        imageUrl,
        thumbnailUrl,
      })
    })
  } catch (err) {
    if (uploadedUrls) {
      await del([uploadedUrls.imageUrl, uploadedUrls.thumbnailUrl]).catch(console.error)
    }

    console.error(err)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect('/index')
}
