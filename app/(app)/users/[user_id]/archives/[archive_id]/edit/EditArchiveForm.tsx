'use client'

import { useActionState } from 'react'
import { editArchiveAction } from './actions'
import type { Archive } from '@/src/db/schema'

export default function EditArchiveForm({ archive }: { archive: Archive }) {
  const [formState, formAction, isPending] = useActionState(editArchiveAction, null)
  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  return (
    <form action={formAction}>
      <input type="hidden" name="archiveId" value={archive.id} />
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Name"
          defaultValue={archive.name}
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
          defaultChecked={archive.isPrivate}
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
        {isPending ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
