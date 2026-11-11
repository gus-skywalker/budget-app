import type { ScenarioSourceType, ScenarioSimulationResponse } from '@/services/ScenarioService'

export interface JourneyContext {
  userId: string
  workspaceId: string
}

export interface JourneySession extends JourneyContext {
  version: 1
  sessionId: string
  sourceType: ScenarioSourceType
  scenarioId: string | null
}

export const JOURNEY_SESSION_KEY = 'planning-decision-session-v1'
export const JOURNEY_RESULT_KEY = 'planning-scenario-latest-result'
const draftKeys = ['planning-scenario-wizard-v3', 'planning-scenario-wizard-v2', 'planning-debt-scenario-wizard-v1']

// Storage can be unavailable (privacy settings/quota). Keep this tab usable;
// successful reads always reflect storage, including an explicit removal.
const memory = new Map<string, string>()
export function readJourneyValue(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key)
    if (value === null) memory.delete(key)
    else memory.set(key, value)
    return value
  } catch {
    return memory.get(key) ?? null
  }
}

// Overrides also cover setItem/removeItem failing while getItem still works.
const pending = new Map<string, string | null>()
export function getJourneyValue(key: string): string | null {
  return pending.has(key) ? pending.get(key)! : readJourneyValue(key)
}

export function setJourneyValue(key: string, value: string | null) {
  if (value === null) memory.delete(key)
  else memory.set(key, value)
  try {
    if (value === null) window.sessionStorage.removeItem(key)
    else window.sessionStorage.setItem(key, value)
    pending.delete(key)
  } catch {
    pending.set(key, value)
  }
}

export function sameJourneyContext(a: JourneyContext | null, b: JourneyContext | null): boolean {
  return Boolean(a?.userId && a.workspaceId && b?.userId === a.userId && b.workspaceId === a.workspaceId)
}

export function readJourneySession(context: JourneyContext | null): JourneySession | null {
  if (!context) return null
  try {
    const raw = JSON.parse(getJourneyValue(JOURNEY_SESSION_KEY) || 'null')
    if (!raw || raw.version !== 1 || !sameJourneyContext(raw, context) ||
      typeof raw.sessionId !== 'string' || !raw.sessionId ||
      !['BUDGET_BASED', 'MANUAL_TYPED'].includes(raw.sourceType) ||
      !(raw.scenarioId === null || typeof raw.scenarioId === 'string')) return null
    return raw
  } catch {
    return null
  }
}

export function beginJourneySession(context: JourneyContext, sourceType: ScenarioSourceType, scenarioId: string | null = null): JourneySession {
  for (const key of [...draftKeys, JOURNEY_RESULT_KEY]) setJourneyValue(key, null)
  const session: JourneySession = { ...context, version: 1, sessionId: crypto.randomUUID(), sourceType, scenarioId }
  setJourneyValue(JOURNEY_SESSION_KEY, JSON.stringify(session))
  return session
}

export function clearJourneySession(session: JourneySession) {
  if (readJourneySession(session)?.sessionId !== session.sessionId) return
  for (const key of [...draftKeys, JOURNEY_RESULT_KEY, JOURNEY_SESSION_KEY]) setJourneyValue(key, null)
}

export function writeJourneyResult(session: JourneySession, scenarioId: string, result: ScenarioSimulationResponse) {
  if (readJourneySession(session)?.sessionId !== session.sessionId) return
  setJourneyValue(JOURNEY_RESULT_KEY, JSON.stringify({ sessionId: session.sessionId, scenarioId, result }))
}

export function readJourneyResult(session: JourneySession, scenarioId: string): ScenarioSimulationResponse | null {
  try {
    const cached = JSON.parse(getJourneyValue(JOURNEY_RESULT_KEY) || 'null')
    const result = cached?.result
    if (cached?.sessionId !== session.sessionId || cached.scenarioId !== scenarioId || !result ||
      (result.sourceType || 'BUDGET_BASED') !== session.sourceType ||
      !Array.isArray(result.forecast) || !Array.isArray(result.impactedGoalNames) ||
      !Number.isFinite(result.scenarioMonthlyImpact)) return null
    return result
  } catch {
    return null
  }
}
