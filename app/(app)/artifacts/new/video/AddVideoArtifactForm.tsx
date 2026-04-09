'use client'

import { useActionState, useRef, useState, startTransition } from 'react'
import { addVideoArtifactAction } from './actions'

async function extractThumbnailAndDuration(
  file: File,
): Promise<{ blob: Blob | null; duration: number | null }> {
  return new Promise((resolve) => {
    const videoEl = document.createElement('video')
    videoEl.preload = 'metadata'
    videoEl.muted = true
    const objectUrl = URL.createObjectURL(file)
    videoEl.src = objectUrl

    videoEl.addEventListener('loadedmetadata', () => {
      videoEl.currentTime = Math.min(1, videoEl.duration * 0.1)
    })

    videoEl.addEventListener('seeked', () => {
      const MAX_WIDTH = 1920
      const scale = Math.min(1, MAX_WIDTH / videoEl.videoWidth)

      const canvas = document.createElement('canvas')
      canvas.width = Math.round(videoEl.videoWidth * scale)
      canvas.height = Math.round(videoEl.videoHeight * scale)
      canvas.getContext('2d')!.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      const duration = videoEl.duration

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl)
        resolve({ blob, duration })
      }, 'image/png')
    })

    videoEl.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ blob: null, duration: null })
    })
  })
}

export default function AddVideoArtifactForm() {
  const [formState, formAction, isPending] = useActionState(addVideoArtifactAction, null)
  const [videoInputMode, setVideoInputMode] = useState<'file' | 'url'>('file')
  const [isExtracting, setIsExtracting] = useState<boolean>(false)

  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoUrlInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = (mode: 'file' | 'url'): void => {
    setVideoInputMode(mode)

    if (mode === 'url' && fileInputRef.current) {
      fileInputRef.current.value = ''
    } else if (mode === 'file' && videoUrlInputRef.current) {
      videoUrlInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    if (videoInputMode === 'file' && fileInputRef.current?.files?.[0]) {
      setIsExtracting(true)
      const videoFile = fileInputRef.current.files[0]
      const { blob, duration } = await extractThumbnailAndDuration(videoFile)
      setIsExtracting(false)
      if (blob) formData.append('thumbnailFile', blob, 'thumbnail.png')
      if (duration) formData.append('durationSeconds', String(Math.round(duration)))
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <fieldset>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="Title"
          aria-invalid={!!fieldErrors?.title}
          aria-describedby={fieldErrors?.title ? 'title-error' : undefined}
        />
        {fieldErrors?.title && <p id="title-error">{fieldErrors.title}</p>}
      </fieldset>
      <fieldset>
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          placeholder="Description"
          aria-invalid={!!fieldErrors?.description}
          aria-describedby={fieldErrors?.description ? 'description-error' : undefined}
        />
        {fieldErrors?.description && <p id="description-error">{fieldErrors.description}</p>}
      </fieldset>
      <fieldset>
        <label htmlFor="source-url">Source URL</label>
        <input
          id="source-url"
          type="url"
          name="sourceUrl"
          placeholder="Source URL"
          aria-invalid={!!fieldErrors?.sourceUrl}
          aria-describedby={fieldErrors?.sourceUrl ? 'source-url-error' : undefined}
        />
        {fieldErrors?.sourceUrl && <p id="source-url-error">{fieldErrors.sourceUrl}</p>}
      </fieldset>
      <fieldset>
        <legend>Add video via</legend>
        <label>
          <input
            type="radio"
            name="videoInputMode"
            value="file"
            checked={videoInputMode === 'file'}
            onChange={() => handleModeChange('file')}
          />
          File upload
        </label>
        <label>
          <input
            type="radio"
            name="videoInputMode"
            value="url"
            checked={videoInputMode === 'url'}
            onChange={() => handleModeChange('url')}
          />
          Video URL
        </label>
      </fieldset>
      {videoInputMode === 'file' ? (
        <fieldset>
          <label htmlFor="video-file">Upload file</label>
          <input
            ref={fileInputRef}
            id="video-file"
            type="file"
            name="videoFile"
            accept="video/mp4,video/webm,video/ogg"
            required
            aria-invalid={!!fieldErrors?.videoFile}
            aria-describedby={fieldErrors?.videoFile ? 'video-file-error' : undefined}
          />
          {fieldErrors?.videoFile && <p id="video-file-error">{fieldErrors.videoFile}</p>}
        </fieldset>
      ) : (
        <fieldset>
          <label htmlFor="video-url">Video URL</label>
          <input
            ref={videoUrlInputRef}
            id="video-url"
            type="url"
            name="videoUrl"
            placeholder="Video URL"
            required
            aria-invalid={!!fieldErrors?.videoUrl}
            aria-describedby={fieldErrors?.videoUrl ? 'video-url-error' : undefined}
          />
          {fieldErrors?.videoUrl && <p id="video-url-error">{fieldErrors.videoUrl}</p>}
        </fieldset>
      )}
      {formError && (
        <p role="status" aria-live="polite">
          {formError}
        </p>
      )}
      <button type="submit" disabled={isExtracting || isPending}>
        {isPending ? 'Adding artifact...' : 'Add artifact'}
      </button>
    </form>
  )
}
