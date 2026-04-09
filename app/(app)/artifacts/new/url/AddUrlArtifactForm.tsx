'use client'

import { useActionState } from 'react'
import { addUrlArtifactAction } from './actions'

export default function AddUrlArtifactForm() {
  const [formState, formAction, isPending] = useActionState(addUrlArtifactAction, null)
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
        <label htmlFor="target-url">Link</label>
        <input
          id="target-url"
          type="url"
          name="targetUrl"
          placeholder="Add a link"
          aria-invalid={!!fieldErrors?.targetUrl}
          aria-describedby={fieldErrors?.targetUrl ? 'target-url-error' : undefined}
        />
        {fieldErrors?.targetUrl && <p id="target-url-error">{fieldErrors.targetUrl}</p>}
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
