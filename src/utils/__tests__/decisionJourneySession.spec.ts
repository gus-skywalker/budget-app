import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  beginJourneySession, clearJourneySession, getJourneyValue, readJourneyResult, readJourneySession,
  setJourneyValue, writeJourneyResult, JOURNEY_SESSION_KEY, JOURNEY_RESULT_KEY,
} from '@/utils/decisionJourneySession'
import type { ScenarioSimulationResponse } from '@/services/ScenarioService'

const context = { userId: 'user-1', workspaceId: 'workspace-1' }
const result: ScenarioSimulationResponse = {
  scenarioName: 'Test', sourceType: 'BUDGET_BASED', months: 6, currentBalance: 10,
  baselineMonthlyNet: 50, scenarioMonthlyImpact: -10, projectedFinalBalance: 250,
  decisionStatus: 'WATCH', availableForGoals: 40, impactedGoalsCount: 0, forecast: [], impactedGoalNames: [],
}
const keys = [JOURNEY_SESSION_KEY, JOURNEY_RESULT_KEY, 'planning-scenario-wizard-v3', 'planning-scenario-wizard-v2', 'planning-debt-scenario-wizard-v1']

describe('decision journey session boundary', () => {
  beforeEach(() => { sessionStorage.clear() })
  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of keys) setJourneyValue(key, null)
  })

  it('accepts a preview after reload only for its owner, workspace, session and scenario', () => {
    const session = beginJourneySession(context, 'BUDGET_BASED')
    writeJourneyResult(session, 'preview', result)
    const reloaded = readJourneySession(context)!
    expect(readJourneyResult(reloaded, 'preview')).toEqual(result)
    expect(readJourneyResult(reloaded, 'another-scenario')).toBeNull()
    expect(readJourneySession({ ...context, userId: 'user-2' })).toBeNull()
    expect(readJourneySession({ ...context, workspaceId: 'workspace-2' })).toBeNull()
  })

  it('starting another type clears only journey data and rejects the old response', () => {
    sessionStorage.setItem('userStore', 'keep-auth')
    sessionStorage.setItem('unrelated-form', 'keep-draft')
    const old = beginJourneySession(context, 'BUDGET_BASED')
    setJourneyValue('planning-scenario-wizard-v3', '{"name":"old"}')
    writeJourneyResult(old, 'preview', result)
    const next = beginJourneySession(context, 'MANUAL_TYPED')
    writeJourneyResult(old, 'preview', result)
    clearJourneySession(old)
    expect(readJourneySession(context)?.sessionId).toBe(next.sessionId)
    expect(getJourneyValue(JOURNEY_RESULT_KEY)).toBeNull()
    expect(getJourneyValue('planning-scenario-wizard-v3')).toBeNull()
    expect(sessionStorage.getItem('userStore')).toBe('keep-auth')
    expect(sessionStorage.getItem('unrelated-form')).toBe('keep-draft')
  })

  it('rejects missing or malformed metadata and an incompatible result source', () => {
    expect(readJourneySession(context)).toBeNull()
    setJourneyValue(JOURNEY_SESSION_KEY, '{broken')
    expect(readJourneySession(context)).toBeNull()
    const session = beginJourneySession(context, 'MANUAL_TYPED')
    writeJourneyResult(session, 'preview', result)
    expect(readJourneyResult(session, 'preview')).toBeNull()
  })

  it('does not infer ownership for a legacy result without a session identifier', () => {
    const session = beginJourneySession(context, 'BUDGET_BASED')
    setJourneyValue(JOURNEY_RESULT_KEY, JSON.stringify({ scenarioId: 'preview', result }))
    expect(readJourneyResult(session, 'preview')).toBeNull()
  })

  it('keeps navigation data usable in memory when browser storage is unavailable', () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
    }
    const session = beginJourneySession(context, 'BUDGET_BASED')
    writeJourneyResult(session, 'preview', result)
    expect(readJourneyResult(readJourneySession(context)!, 'preview')).toEqual(result)
    clearJourneySession(session)
    expect(readJourneySession(context)).toBeNull()
  })

  it('does not read stale disk data after a write fails but reads still work', () => {
    beginJourneySession(context, 'MANUAL_TYPED')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
    const current = beginJourneySession(context, 'BUDGET_BASED')
    writeJourneyResult(current, 'preview', result)
    expect(readJourneySession(context)?.sessionId).toBe(current.sessionId)
    expect(readJourneyResult(current, 'preview')).toEqual(result)
  })
})
