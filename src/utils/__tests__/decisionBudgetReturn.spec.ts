import { beforeEach, describe, expect, it } from 'vitest'
import { beginJourneySession, getJourneyValue } from '@/utils/decisionJourneySession'
import { prepareBudgetReturn, readBudgetReturn } from '@/utils/decisionBudgetReturn'

const context = { userId: 'user', workspaceId: 'workspace' }
const query = { guided: '1', returnTo: 'planning-scenarios-new', intent: 'monthly-change' }
describe('budget journey return', () => {
  beforeEach(() => sessionStorage.clear())
  it('round-trips only an owned budget journey and keeps the draft', () => {
    const session = beginJourneySession(context, 'BUDGET_BASED')
    sessionStorage.setItem('planning-scenario-wizard-v3', 'draft')
    expect(prepareBudgetReturn(session, query.intent)).toEqual({ name: 'planning-budget', query })
    expect(readBudgetReturn(query, context)).toEqual({ name: 'planning-scenarios-new', query: { guided: '1', intent: 'monthly-change', resume: '1' } })
    expect(getJourneyValue('planning-scenario-wizard-v3')).toBe('draft')
  })
  it('rejects foreign users, workspaces, changed sessions and unowned links', () => {
    expect(readBudgetReturn(query, context)).toBeNull()
    const session = beginJourneySession(context, 'BUDGET_BASED')
    prepareBudgetReturn(session, query.intent)
    expect(readBudgetReturn(query, { ...context, userId: 'other' })).toBeNull()
    expect(readBudgetReturn(query, { ...context, workspaceId: 'other' })).toBeNull()
    beginJourneySession(context, 'BUDGET_BASED')
    expect(readBudgetReturn(query, context)).toBeNull()
  })
  it('rejects external destinations, mismatched or array intents and debt return', () => {
    const session = beginJourneySession(context, 'BUDGET_BASED')
    prepareBudgetReturn(session, query.intent)
    expect(readBudgetReturn({ ...query, returnTo: 'https://example.com' }, context)).toBeNull()
    expect(readBudgetReturn({ ...query, intent: 'custom' }, context)).toBeNull()
    expect(readBudgetReturn({ ...query, intent: ['monthly-change'] }, context)).toBeNull()
    expect(prepareBudgetReturn(session, 'payment-options')).toEqual({ name: 'planning-budget' })
    const debt = beginJourneySession(context, 'MANUAL_TYPED')
    expect(prepareBudgetReturn(debt, 'custom')).toEqual({ name: 'planning-budget' })
  })
})
