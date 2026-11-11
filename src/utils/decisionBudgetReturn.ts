import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { getJourneyValue, setJourneyValue, readJourneySession, type JourneyContext, type JourneySession } from './decisionJourneySession'

const key = 'planning-decision-budget-return-v1'
export const budgetIntent = (value: unknown): 'monthly-change' | 'custom' | null =>
  value === 'monthly-change' || value === 'custom' ? value : null

export function prepareBudgetReturn(session: JourneySession, value: unknown): RouteLocationRaw {
  const intent = budgetIntent(value)
  if (!intent || session.sourceType !== 'BUDGET_BASED' || readJourneySession(session)?.sessionId !== session.sessionId) return { name: 'planning-budget' }
  setJourneyValue(key, JSON.stringify({ ...session, intent }))
  return { name: 'planning-budget', query: { guided: '1', intent, returnTo: 'planning-scenarios-new' } }
}

// A URL alone never authorizes resuming a draft. The locally owned session must match.
export function readBudgetReturn(query: LocationQuery, context: JourneyContext | null): RouteLocationRaw | null {
  if (query.guided !== '1' || query.returnTo !== 'planning-scenarios-new' || !budgetIntent(query.intent)) return null
  const session = readJourneySession(context)
  if (!session || session.sourceType !== 'BUDGET_BASED') return null
  try {
    const pending = JSON.parse(getJourneyValue(key) || 'null')
    if (!pending || pending.version !== 1 || pending.sessionId !== session.sessionId ||
      pending.userId !== session.userId || pending.workspaceId !== session.workspaceId || pending.intent !== query.intent) return null
    return { name: 'planning-scenarios-new', query: { guided: '1', intent: pending.intent, resume: '1' } }
  } catch { return null }
}
