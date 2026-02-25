/**
 * Correlation IDs are required for cross-service tracing (ADR-003-v2).
 * Keep it simple: generate UUID v4 when available.
 */
export function getOrCreateCorrelationId(storageKey = 'correlationId'): string {
  const existing = sessionStorage.getItem(storageKey)
  if (existing) return existing

  const id = (globalThis.crypto?.randomUUID?.() ?? fallbackUUIDv4())
  sessionStorage.setItem(storageKey, id)
  return id
}

export function clearCorrelationId(storageKey = 'correlationId') {
  sessionStorage.removeItem(storageKey)
}

function fallbackUUIDv4(): string {
  // RFC4122-ish fallback; good enough for correlation IDs.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

