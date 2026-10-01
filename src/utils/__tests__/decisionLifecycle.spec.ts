import { describe, expect, it } from 'vitest'
import { decisionStageKey, decisionLocksScenario, decisionActionErrorKey } from '@/utils/decisionLifecycle'
import type { PersistedDecision } from '@/services/DecisionService'
import pt from '@/assets/locales/pt.json'
import en from '@/assets/locales/en.json'
import es from '@/assets/locales/es.json'
import fr from '@/assets/locales/fr.json'

describe('decision lifecycle evidence and copy', () => {
  it('distinguishes approval from recorded application, including the public DTO', () => {
    expect(decisionStageKey({ status: 'APPROVED' })).toBe('decisionJourney.continuation.approved')
    expect(decisionStageKey({ status: 'APPROVED', appliedAt: '2026-10-01' })).toBe('decisionJourney.continuation.applied')
    expect(decisionStageKey({ status: 'OPEN' })).toBe('decisionJourney.continuation.open')
    expect(decisionStageKey({ status: 'REJECTED' })).toBe('decisionJourney.continuation.rejected')
    expect(decisionStageKey(null)).toBe('decisionJourney.continuation.saved')
  })
  it('retains locks for votes, closed statuses and applied records', () => {
    const decision: PersistedDecision = { id: 'd', scenarioId: 's', title: 'Test', status: 'OPEN', approveVotes: 0, rejectVotes: 0 }
    expect(decisionLocksScenario(decision)).toBe(false)
    for (const change of [{ approveVotes: 1 }, { rejectVotes: 1 }, { status: 'APPROVED' as const }, { status: 'REJECTED' as const }, { appliedAt: '2026-10-01' }]) {
      expect(decisionLocksScenario({ ...decision, ...change })).toBe(true)
    }
  })
  it.each([403, 409, 500])('maps %s without claiming an uncertain command succeeded', status => {
    expect(decisionActionErrorKey({ response: { status } })).toBe(`decisionJourney.continuation.${status === 403 ? 'forbidden' : status === 409 ? 'conflict' : 'failed'}`)
  })
  it.each([en, es, fr])('has the same nonempty continuation keys in all languages', locale => {
    const entries = locale.decisionJourney.continuation
    expect(Object.keys(entries).sort()).toEqual(Object.keys(pt.decisionJourney.continuation).sort())
    expect(Object.values(entries).every(value => typeof value === 'string' && value.trim())).toBe(true)
  })
})
