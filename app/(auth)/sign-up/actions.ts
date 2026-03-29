'use server'

import { PASSWORD_MIN_LENGTH, SESSION_TTL_DAYS } from '@/src/auth/constants'
import { z } from 'zod'
import { db } from '@/src/db'
import { users, sessions } from '@/src/db/schema'
import { redirect } from 'next/navigation'
import { randomBytes } from 'node:crypto'
import { hashSessionToken } from '@/src/auth/token'
import { hashPassword } from '@/src/auth/password'
import { setSessionCookie } from '@/src/auth/session-cookie'
import { addDays } from '@/src/lib/date'
import { getStringField } from '@/src/lib/form-data'
import { getPostgresErrorDetails } from '@/src/lib/db-errors'

type SignUpResult =
  | { success: true }
  | {
      success: false
      fieldErrors: {
        email?: string
        password?: string
        confirmPassword?: string
      }
      formError?: string
    }

const signUpSchema = z
  .object({
    email: z.string().trim().pipe(z.email('A valid email address is required.')),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const signUpAction = async (
  _prevState: SignUpResult | null,
  formData: FormData,
): Promise<SignUpResult> => {
  const safeParseResult = signUpSchema.safeParse({
    email: getStringField(formData, 'email'),
    password: getStringField(formData, 'password'),
    confirmPassword: getStringField(formData, 'confirmPassword'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        email: flattenedErrors.fieldErrors.email?.[0],
        password: flattenedErrors.fieldErrors.password?.[0],
        confirmPassword: flattenedErrors.fieldErrors.confirmPassword?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const { email, password } = safeParseResult.data

  try {
    const passwordHash = await hashPassword(password)
    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = hashSessionToken(rawToken)
    const expiresAt = addDays(new Date(), SESSION_TTL_DAYS)

    await db.transaction(async (tx) => {
      const [{ userId }] = await tx
        .insert(users)
        .values({ email, passwordHash })
        .returning({ userId: users.id })

      await tx.insert(sessions).values({
        userId,
        tokenHash,
        expiresAt,
      })
    })

    await setSessionCookie(rawToken, expiresAt)
  } catch (error) {
    const postgresError = getPostgresErrorDetails(error)

    if (postgresError?.code === '23505' && postgresError.constraint === 'users_email_unique') {
      return {
        success: false,
        fieldErrors: { email: 'An account with that email already exists.' },
      }
    }

    console.error(error)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect('/library')
}
