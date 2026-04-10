'use client'

import { useActionState } from 'react'
import { addArchiveAction } from './actions'

export default function AddArchiveForm() {
  const [formState, formAction, isPending] = useActionState(addArchiveAction, null)
  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Name"
          aria-invalid={!!fieldErrors?.name}
          aria-describedby={fieldErrors?.name ? 'name-error' : undefined}
        />
        {fieldErrors?.name && <p id="name-error">{fieldErrors.name}</p>}
      </div>
      <div>
        <input
          id="is-private"
          type="checkbox"
          name="isPrivate"
          defaultChecked
          aria-describedby={fieldErrors?.isPrivate ? 'is-private-error' : undefined}
        />
        <label htmlFor="is-private">Private</label>
        {fieldErrors?.isPrivate && <p id="is-private-error">{fieldErrors.isPrivate}</p>}
      </div>
      {formError && (
        <p role="status" aria-live="polite">
          {formError}
        </p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating archive...' : '+ Create archive'}
      </button>
    </form>
  )
}
