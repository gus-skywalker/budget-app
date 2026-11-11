/**
 * messageId is the idempotency key for command endpoints.
 * It must be stable across retries for the same logical action.
 */
export function createMessageId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? fallbackUUIDv4())
}

function fallbackUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

