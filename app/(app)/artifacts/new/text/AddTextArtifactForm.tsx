'use client'

import { useActionState } from 'react'
import { addTextArtifactAction } from './actions'

export default function AddTextArtifactForm() {
  const [formState, formAction, isPending] = useActionState(addTextArtifactAction, null)
  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  return (
    <form action={formAction}>
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
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          placeholder="Write anything"
          aria-invalid={!!fieldErrors?.content}
          aria-describedby={fieldErrors?.content ? 'content-error' : undefined}
        />
        {fieldErrors?.content && <p id="content-error">{fieldErrors.content}</p>}
      </fieldset>
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
