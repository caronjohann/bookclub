export const getPostgresErrorDetails = (
  error: unknown,
): { code?: string; constraint?: string } | null => {
  if (!(error instanceof Error)) {
    return null
  }

  if (typeof error.cause !== 'object' || error.cause === null) {
    return null
  }

  const cause = error.cause as {
    code?: string
    constraint_name?: string
  }

  return {
    code: cause.code,
    constraint: cause.constraint_name,
  }
}
