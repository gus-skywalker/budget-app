import type { WorkbookInventory } from '@/services/FinancialClosingService'

export type ClosingImportSession = {
  file: File
  inventory: WorkbookInventory
  excludedNames: string[]
  readyProfileIds: string[]
  sensitiveIntentExpiresAt: number
}

type SessionScope = { workspaceId: string; userId: string; closingId: string }

const sessions = new Map<string, ClosingImportSession>()
const SENSITIVE_INTENT_TTL_MS = 15 * 60 * 1000

function key(scope: SessionScope) {
  return `${scope.workspaceId}:${scope.userId}:${scope.closingId}`
}

export function rememberClosingImportSession(scope: SessionScope, session: Omit<ClosingImportSession, 'sensitiveIntentExpiresAt'>, now = Date.now()) {
  sessions.set(key(scope), { ...session, sensitiveIntentExpiresAt: now + SENSITIVE_INTENT_TTL_MS })
}

export function readClosingImportSession(scope: SessionScope, now = Date.now()) {
  const session = sessions.get(key(scope))
  if (!session) return null
  return { ...session, sensitiveIntentValid: session.sensitiveIntentExpiresAt > now }
}

export function clearClosingImportSession(scope: SessionScope) {
  sessions.delete(key(scope))
}
