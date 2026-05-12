const TECHNICAL_ERROR_PATTERNS = [
  'CompositeCacheKey',
  'Cannot construct instance',
  'Failed to decode',
  'StreamReadFeature',
  'io.quarkus',
  'Internal Server Error',
  'org.hibernate',
  'ConstraintViolationException',
  'PSQLException',
  'SQLState',
  'could not execute statement',
  'violates foreign key constraint',
  'update or delete on table',
  'delete from public.',
]

const GENERIC_ERROR_MESSAGES = [
  'An unexpected error occurred',
  'Unexpected error',
]

export const isTechnicalOpenFinanceError = (message: string | null | undefined) => {
  const text = String(message || '')
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => text.includes(pattern))
}

export const sanitizeOpenFinanceMessage = (message: string | null | undefined, fallback: string) => {
  const text = String(message || '').trim()
  if (!text) return fallback
  if (GENERIC_ERROR_MESSAGES.some((generic) => text.toLowerCase() === generic.toLowerCase())) {
    return fallback
  }
  if (isTechnicalOpenFinanceError(text)) return fallback
  return text
}

export const extractOpenFinanceErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data
  const rawMessage =
    data?.message ||
    data?.error ||
    data?.detail ||
    data?.title ||
    (typeof data === 'string' ? data : null) ||
    error?.message

  return sanitizeOpenFinanceMessage(rawMessage, fallback)
}
