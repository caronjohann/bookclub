'use client'

import { logoutAction } from '@/app/(app)/actions'
import { useTransition } from 'react'

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={async () => {
        startTransition(() => {
          logoutAction()
        })
      }}
    >
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging out...' : 'Log out'}
      </button>
    </form>
  )
}

export default LogoutButton
