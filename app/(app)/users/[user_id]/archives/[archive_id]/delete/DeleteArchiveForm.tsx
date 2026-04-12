'use client'

import { deleteArchiveAction } from './actions'
import { useParams, useRouter } from 'next/navigation'
import { useActionState } from 'react'

export default function DeleteArchiveForm() {
  const { user_id, archive_id } = useParams()
  const [formState, formAction, isPending] = useActionState(deleteArchiveAction, null)
  const router = useRouter()

  const formError = formState?.success === false ? formState.formError : undefined

  return (
    <form action={formAction}>
      <h2 id="delete-warning">Are you sure you want to delete this archive?</h2>
      <input type="hidden" name="archiveId" value={archive_id} />
      {formError && (
        <p role="status" aria-live="polite">
          {formError}
        </p>
      )}
      <div>
        <button
          type="button"
          onClick={() => router.push(`/users/${user_id}/archives/${archive_id}`)}
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} aria-describedby="delete-warning">
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </form>
  )
}
