'use client'

import { useActionState } from 'react'
import { signInAction } from './actions'
import { PASSWORD_MIN_LENGTH } from '@/src/auth/constants'

const SignInForm = () => {
  const [formState, formAction, isPending] = useActionState(signInAction, null)
  const formError = formState?.success === false ? formState.formError : undefined
  const fieldErrors = formState?.success === false ? formState.fieldErrors : undefined

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          required
          aria-invalid={!!fieldErrors?.email}
          aria-describedby={fieldErrors?.email ? 'email-error' : undefined}
        />
        {fieldErrors?.email && <p id="email-error">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          aria-invalid={!!fieldErrors?.password}
          aria-describedby={fieldErrors?.password ? 'password-error' : undefined}
        />
        {fieldErrors?.password && <p id="password-error">{fieldErrors.password}</p>}
      </div>
      {formError && (
        <p role="status" aria-live="polite">
          {formError}
        </p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Continue with Email'}
      </button>
    </form>
  )
}

export default SignInForm
