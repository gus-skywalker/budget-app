import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import DecisionsView from '@/views/DecisionsView.vue'
import type { SavedScenario, ScenarioDeltaInput, ScenarioSimulationRequest } from '@/services/ScenarioService'

enableAutoUnmount(afterEach)

const { simulate, list, decisionList, replace, apply, create, updateStatus, billing } = vi.hoisted(() => ({
  simulate: vi.fn(), list: vi.fn(), decisionList: vi.fn(), replace: vi.fn(),
  apply: vi.fn(), create: vi.fn(), updateStatus: vi.fn(), billing: vi.fn(),
}))
vi.mock('@/services/ScenarioService', () => ({ default: { simulate, list } }))
vi.mock('@/services/DecisionService', () => ({ default: { list: decisionList, applyDecision: apply, createFromScenario: create, updateStatus } }))
vi.mock('@/services/BillingOrchestrationService', () => ({ default: { getBillingSummary: billing } }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => ({ getWorkspaces: [], getCurrentWorkspaceId: 'workspace' }) }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace, push: vi.fn() }),
}))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: ref('pt'), t: (key: string, args?: { category?: string }) =>
    args?.category ? `Ajuste da base: ${args.category}` : key }),
}))

const baseScenario = (overrides: Partial<SavedScenario> = {}): SavedScenario => ({
  id: 'saved-1', name: 'Mudança salva', budgetId: 'budget-1',
  sourceType: 'BUDGET_BASED', months: 12, deltas: [], ...overrides,
})

async function openList(scenario: SavedScenario): Promise<ScenarioSimulationRequest> {
  list.mockResolvedValue({ data: [scenario] })
  shallowMount(DecisionsView, { global: { plugins: [createVuetify({ components, directives })] } })
  await flushPromises()
  expect(simulate).toHaveBeenCalledTimes(1)
  // Assert the serialized request, not undefined properties omitted by HTTP JSON serialization.
  return JSON.parse(JSON.stringify(simulate.mock.calls[0][0]))
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  decisionList.mockResolvedValue({ data: [] })
  billing.mockResolvedValue({ data: { capabilities: { collaborationEnabled: true } } })
  apply.mockReset()
  create.mockReset()
  simulate.mockResolvedValue({ data: {
    scenarioName: 'Mudança salva', months: 12, currentBalance: 1000, baselineMonthlyNet: 100,
    scenarioMonthlyImpact: -20, projectedFinalBalance: 1960, decisionStatus: 'STABLE',
    availableForGoals: 1960, impactedGoalsCount: 0, impactedGoalNames: [], forecast: [],
  } })
  replace.mockResolvedValue(undefined)
})

describe('DecisionsView continuation commands', () => {
  const open = { id: 'decision', scenarioId: 'saved-1', title: 'Decision', status: 'OPEN', approveVotes: 0, rejectVotes: 0, canCurrentUserApply: true }
  async function mountDecision(overrides = {}) {
    list.mockResolvedValue({ data: [baseScenario()] })
    decisionList.mockResolvedValue({ data: [{ ...open, ...overrides }] })
    const wrapper = shallowMount(DecisionsView, { global: { plugins: [createVuetify({ components, directives })] } })
    await flushPromises()
    return wrapper
  }

  it('creates a decision without applying it and suppresses repeated creation', async () => {
    const wrapper = await mountDecision()
    ;(wrapper.vm as any).persistedDecisions = []
    let finish!: (value: unknown) => void
    create.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const first = (wrapper.vm as any).trackDecision('saved-1')
    await (wrapper.vm as any).trackDecision('saved-1')
    expect(create).toHaveBeenCalledTimes(1)
    finish({ data: open })
    await first
    await (wrapper.vm as any).trackDecision('saved-1')
    expect(create).toHaveBeenCalledTimes(1)
    expect(apply).not.toHaveBeenCalled()
  })

  it('applies only once during sending and never again after an application record', async () => {
    const wrapper = await mountDecision()
    let finish!: (value: unknown) => void
    apply.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const pending = (wrapper.vm as any).applyDecision('decision')
    await (wrapper.vm as any).applyDecision('decision')
    expect(apply).toHaveBeenCalledTimes(1)
    finish({ data: { status: 'APPROVED', appliedAt: '2026-10-01', updatedBudget: { net: 100 } } })
    await pending
    expect((wrapper.vm as any).decisionCards[0].stageKey).toBe('decisionJourney.continuation.applied')
    await (wrapper.vm as any).applyDecision('decision')
    expect(apply).toHaveBeenCalledTimes(1)
  })

  it.each([
    { status: 'APPROVED' }, { status: 'REJECTED' }, { appliedAt: '2026-10-01' },
    { canCurrentUserApply: false, applyBlockedReason: 'Debt is informational' },
  ])('honors status, application evidence and backend permissions: %j', async overrides => {
    const wrapper = await mountDecision(overrides)
    await (wrapper.vm as any).applyDecision('decision')
    expect(apply).not.toHaveBeenCalled()
    if (overrides.applyBlockedReason) expect(wrapper.text()).toContain(overrides.applyBlockedReason)
  })

  it('retains the collaboration entitlement gate', async () => {
    billing.mockResolvedValue({ data: { capabilities: { collaborationEnabled: false } } })
    const wrapper = await mountDecision()
    await (wrapper.vm as any).applyDecision('decision')
    expect(apply).not.toHaveBeenCalled()
  })

  it.each([403, 409])('keeps cards visible and reports application refusal %s without success', async status => {
    const wrapper = await mountDecision()
    apply.mockRejectedValueOnce({ response: { status } })
    await (wrapper.vm as any).applyDecision('decision')
    expect((wrapper.vm as any).error).toBe('')
    expect((wrapper.vm as any).successMessage).toBe('')
    expect((wrapper.vm as any).actionError).toBe(`decisionJourney.continuation.${status === 403 ? 'forbidden' : 'conflict'}`)
    expect((wrapper.vm as any).decisionCards[0].stageKey).toBe('decisionJourney.continuation.open')
    expect((wrapper.vm as any).pendingApplyId).toBeNull()
  })

  it('retains the creation dialog selection after failure', async () => {
    const wrapper = await mountDecision()
    ;(wrapper.vm as any).persistedDecisions = []
    ;(wrapper.vm as any).openDecisionCreationDialog()
    create.mockRejectedValueOnce({ response: { status: 403 } })
    await (wrapper.vm as any).createDecisionFromSelectedScenario()
    expect((wrapper.vm as any).decisionCreationDialogOpen).toBe(true)
    expect((wrapper.vm as any).selectedScenarioToCreate).toBe('saved-1')
  })
})

describe('DecisionsView saved simulation request', () => {
  it('preserves every delta field, including percentage, finite period and delayed start', async () => {
    const delta: ScenarioDeltaInput = {
      label: 'Redução temporária', type: 'PERCENT_EXPENSE_REDUCTION', temporalType: 'FIXED_PERIOD',
      amount: 400, percentage: 12.5, startMonthOffset: 2, endMonthOffset: 5,
    }
    const scenario = baseScenario({ deltas: [delta] })
    expect(await openList(scenario)).toEqual({
      id: scenario.id, budgetId: scenario.budgetId, name: scenario.name,
      sourceType: 'BUDGET_BASED', months: 12, deltas: [delta],
    })
  })

  it.each<ScenarioDeltaInput>([
    { type: 'PERCENT_INCOME_INCREASE', amount: 10, percentage: 0, temporalType: 'FIXED_PERIOD', startMonthOffset: 0, endMonthOffset: 0 },
    { type: 'EXPENSE_INCREASE', amount: 350, temporalType: 'SINGLE', startMonthOffset: 3 },
    { type: 'PERCENT_INCOME_REDUCTION', amount: 15, percentage: 15, temporalType: 'ONGOING', startMonthOffset: 4 },
    { type: 'MONTHLY_EXPENSE', amount: 50, startMonthOffset: 1, endMonthOffset: 2 },
    { type: 'ONE_TIME_EXPENSE', amount: 500, startMonthOffset: 2 },
    { type: 'MONTHLY_INCOME', amount: 100, startMonthOffset: 0 },
  ])('round-trips saved delta $type / $temporalType without inventing optional fields', async (delta) => {
    expect((await openList(baseScenario({ deltas: [delta] }))).deltas).toEqual([delta])
  })

  it('adds each changed budget line once, keeps manual changes and leaves the saved input untouched', async () => {
    const manual: ScenarioDeltaInput = { label: 'Mesmo valor, outra mudança', type: 'MONTHLY_INCOME', amount: 100, startMonthOffset: 0 }
    const scenario = baseScenario({ deltas: [manual], lines: [
      { id: '1', category: 'Salário', type: 'INCOME', originalAmount: 1000, adjustedAmount: 1100, delta: 100 },
      { id: '2', category: 'Extra', type: 'INCOME', originalAmount: 300, adjustedAmount: 250, delta: -50 },
      { id: '3', category: 'Aluguel', type: 'EXPENSE', originalAmount: 500, adjustedAmount: 600, delta: 100 },
      { id: '4', category: 'Lazer', type: 'EXPENSE', originalAmount: 200, adjustedAmount: 125, delta: -75 },
      { id: '5', category: 'Igual', type: 'EXPENSE', originalAmount: 200, adjustedAmount: 200, delta: 0 },
    ] })
    const original = JSON.stringify(scenario)
    const payload = await openList(scenario)
    expect(payload.deltas).toEqual([
      manual,
      { label: 'Ajuste da base: Salário', type: 'MONTHLY_INCOME', amount: 100, startMonthOffset: 0 },
      { label: 'Ajuste da base: Extra', type: 'MONTHLY_EXPENSE', amount: 50, startMonthOffset: 0 },
      { label: 'Ajuste da base: Aluguel', type: 'MONTHLY_EXPENSE', amount: 100, startMonthOffset: 0 },
      { label: 'Ajuste da base: Lazer', type: 'MONTHLY_INCOME', amount: 75, startMonthOffset: 0 },
    ])
    expect(payload).not.toHaveProperty('lineAdjustments')
    expect(JSON.stringify(scenario)).toBe(original)
  })

  it('preserves debt origin and all option premises without adding budget deltas', async () => {
    const scenario = baseScenario({ budgetId: undefined, months: 1,
      scenarioType: 'DEBT_PAYMENT_DECISION', sourceType: 'MANUAL_TYPED',
      debtInput: { title: 'Pagamento', totalAmount: 1500, availableCash: 500, options: [
        { name: 'Parcelar', type: 'INSTALLMENT', financedAmount: 1000, installments: 4,
          totalInstallmentAmount: 1100, iofAmount: 10, liquidityCertainty: 'CERTAIN' },
        { name: 'Crédito curto', type: 'SHORT_TERM_CREDIT', financedAmount: 1000,
          monthlyInterestRate: 2.5, expectedPayoffDays: 20, liquidityCertainty: 'UNCERTAIN', notes: 'Entrada futura' },
      ] },
    })
    expect(await openList(scenario)).toEqual({ id: scenario.id, name: scenario.name,
      months: 1, scenarioType: 'DEBT_PAYMENT_DECISION', sourceType: 'MANUAL_TYPED',
      debtInput: scenario.debtInput, deltas: [],
    })
  })

  it('retains existing legacy defaults without synthesizing percentage or end month', async () => {
    const scenario = baseScenario({ months: null, debtInput: null, deltas: [{ type: 'MONTHLY_EXPENSE', amount: 50 }] })
    const payload = await openList(scenario)
    expect(payload.months).toBe(6)
    expect(payload.deltas).toEqual([{ type: 'MONTHLY_EXPENSE', amount: 50, startMonthOffset: 0 }])
    expect(payload).not.toHaveProperty('debtInput')
  })
})
