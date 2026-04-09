// Returns null for missing fields and whitespace-only strings.
export const getStringField = (formData: FormData, key: string): string | null => {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  return value.trim() === '' ? null : value
}
