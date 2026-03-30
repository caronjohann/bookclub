'use server'

import { PASSWORD_MIN_LENGTH } from '@/src/auth/constants'
import { eq } from 'drizzle-orm'
import { db } from '@/src/db'
import { sessions, users } from '@/src/db/schema'
import { getStringField } from '@/src/lib/form-data'
import { z } from 'zod'
import { verifyPassword } from '@/src/auth/password'
import { generateSessionTokenAndExpiry } from '@/src/auth/token'
import { setSessionCookie } from '@/src/auth/session-cookie'
import { redirect } from 'next/navigation'

type SignInResult =
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

const signInSchema = z.object({
  email: z.string().trim().pipe(z.email('A valid email address is required.')),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`),
})

export const signInAction = async (
  _prevState: SignInResult | null,
  formData: FormData,
): Promise<SignInResult> => {
  const safeParseResult = signInSchema.safeParse({
    email: getStringField(formData, 'email'),
    password: getStringField(formData, 'password'),
  })

  if (!safeParseResult.success) {
    const flattenedErrors = z.flattenError(safeParseResult.error)

    return {
      success: false,
      fieldErrors: {
        email: flattenedErrors.fieldErrors.email?.[0],
        password: flattenedErrors.fieldErrors.password?.[0],
      },
      formError: flattenedErrors.formErrors[0],
    }
  }

  const { email, password } = safeParseResult.data

  try {
    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return { success: false, fieldErrors: {}, formError: 'Invalid email or password.' }
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return { success: false, fieldErrors: {}, formError: 'Invalid email or password.' }
    }

    const { rawToken, tokenHash, expiresAt } = generateSessionTokenAndExpiry()

    await db.insert(sessions).values({ userId: user.id, tokenHash, expiresAt })

    await setSessionCookie(rawToken, expiresAt)
  } catch (error) {
    console.error(error)

    return {
      success: false,
      fieldErrors: {},
      formError: 'Something went wrong. Please try again.',
    }
  }

  redirect('/library')
}
