'use client'

import { useActionState, useRef, useState } from 'react'
import { addImageArtifactAction } from './actions'

export default function AddImageArtifactForm() {
  const [formState, formAction, isPending] = useActionState(addImageArtifactAction, null)
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file')

  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageUrlInputRef = useRef<HTMLInputElement>(null)

  const handleModeChange = (mode: 'file' | 'url') => {
    setImageInputMode(mode)

    if (mode === 'url' && fileInputRef.current) {
      fileInputRef.current.value = ''
    } else if (mode === 'file' && imageUrlInputRef.current) {
      imageUrlInputRef.current.value = ''
    }
  }

  return (
    <form action={formAction} encType="multipart/form-data">
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
        <legend>Add image via</legend>
        <label>
          <input
            type="radio"
            name="imageInputMode"
            value="file"
            checked={imageInputMode === 'file'}
            onChange={() => handleModeChange('file')}
          />
          File upload
        </label>
        <label>
          <input
            type="radio"
            name="imageInputMode"
            value="url"
            checked={imageInputMode === 'url'}
            onChange={() => handleModeChange('url')}
          />
          Image URL
        </label>
      </fieldset>
      {imageInputMode === 'file' ? (
        <fieldset>
          <label htmlFor="image-file">Upload file</label>
          <input
            ref={fileInputRef}
            id="image-file"
            type="file"
            name="imageFile"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            required
            aria-invalid={!!fieldErrors?.imageFile}
            aria-describedby={fieldErrors?.imageFile ? 'image-file-error' : undefined}
          />
          {fieldErrors?.imageFile && <p id="image-file-error">{fieldErrors.imageFile}</p>}
        </fieldset>
      ) : (
        <fieldset>
          <label htmlFor="image-url">Image URL</label>
          <input
            ref={imageUrlInputRef}
            id="image-url"
            type="url"
            name="imageUrl"
            placeholder="Image URL"
            required
            aria-invalid={!!fieldErrors?.imageUrl}
            aria-describedby={fieldErrors?.imageUrl ? 'image-url-error' : undefined}
          />
          {fieldErrors?.imageUrl && <p id="image-url-error">{fieldErrors.imageUrl}</p>}
        </fieldset>
      )}
      {formError && (
        <p role="status" aria-live="polite">
          {formError}
        </p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding artifact...' : 'Add artifact'}
      </button>
    </form>
  )
}
