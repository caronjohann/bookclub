'use server'

import { getCurrentUser } from '@/src/auth/session'
import { db } from '@/src/db'
import { artifacts, artifactVideos } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { del, put } from '@vercel/blob'
import { getVideoUrlMeta, processAndUploadVideoThumbnail } from '@/src/lib/video'

type AddVideoArtifactResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        title?: string
        description?: string
        sourceUrl?: string
        videoUrl?: string
        videoFile?: string
      }
      formError?: string
    }

const addVideoArtifactSchema = z.object({
  title: z.string().trim().max(200, `Title can't exceed ${200} characters.`).nullable(),
  description: z.string().trim().nullable(),
  sourceUrl: z.url().trim().nullable(),
  videoUrl: z.url().trim().nullable(),
  videoFile: z
    .file()
    .mime(['video/mp4', 'video/webm', 'video/ogg'])
    .max(50 * 1024 * 1024, `Video can't exceed ${50}MB.`)
    .nullable(),
  thumbnailFile: z
    .file()
    .mime(['image/png'])
    .max(10 * 1024 * 1024)
    .nullable(),
  durationSeconds: z.coerce.number().int().positive().nullable(),
})

export async function addVideoArtifactAction(
  _prevState: AddVideoArtifactResult | null,
  formData: FormData,
): Promise<AddVideoArtifactResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, fieldErrors: {}, formError: 'You must be signed in.' }
  }

  const safeParseResult = addVideoArtifactSchema.safeParse({
    title: getStringField(formData, 'title'),
    description: getStringField(formData, 'description'),
    sourceUrl: getStringField(formData, 'sourceUrl'),
    videoUrl: getStringField(formData, 'videoUrl'),
    videoFile: formData.get('videoFile'),
    thumbnailFile: formData.get('thumbnailFile'),
    durationSeconds: getStringField(formData, 'durationSeconds'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        title: flattenedErrors.fieldErrors.title?.[0],
        description: flattenedErrors.fieldErrors.description?.[0],
        sourceUrl: flattenedErrors.fieldErrors.sourceUrl?.[0],
        videoUrl: flattenedErrors.fieldErrors.videoUrl?.[0],
        videoFile: flattenedErrors.fieldErrors.videoFile?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const {
    title,
    description,
    sourceUrl,
    videoFile: rawVideoFile,
    videoUrl: rawVideoUrl,
    thumbnailFile,
    durationSeconds,
  } = safeParseResult.data

  if (!rawVideoFile && !rawVideoUrl) {
    return { success: false, fieldErrors: {}, formError: 'Provide a video file or URL.' }
  }

  const artifactId = crypto.randomUUID()

  let thumbnailUrl: string | null = null
  let videoUrl: string
  let uploadedVideoUrl: string | undefined
  let provider: 'youtube' | 'vimeo' | 'upload' | null = null

  try {
    if (rawVideoFile) {
      const { url } = await put(`videos/${artifactId}`, rawVideoFile, {
        access: 'public',
        contentType: rawVideoFile.type,
      })

      videoUrl = url
      uploadedVideoUrl = url
      provider = 'upload'

      if (thumbnailFile) {
        thumbnailUrl = await processAndUploadVideoThumbnail(thumbnailFile, artifactId)
      }
    } else if (rawVideoUrl) {
      const videoMeta = await getVideoUrlMeta(rawVideoUrl)

      videoUrl = videoMeta.canonicalUrl
      provider = videoMeta.provider
      thumbnailUrl = videoMeta.thumbnailUrl
    } else {
      throw new Error('Unexpected state: no video file or URL')
    }

    await db.transaction(async (tx) => {
      await tx.insert(artifacts).values({
        id: artifactId,
        creatorUserId: user.id,
        type: 'video',
        title,
        description,
        sourceUrl,
      })

      await tx.insert(artifactVideos).values({
        artifactId,
        videoUrl,
        thumbnailUrl,
        provider,
        durationSeconds,
      })
    })
  } catch (err) {
    if (uploadedVideoUrl) await del(uploadedVideoUrl).catch(console.error)
    if (thumbnailUrl) await del(thumbnailUrl).catch(console.error)

    console.error(err)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect('/index')
}
