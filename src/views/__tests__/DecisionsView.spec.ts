import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref } from 'vue'
import DecisionsView from '@/views/DecisionsView.vue'
import type { SavedScenario, ScenarioDeltaInput, ScenarioSimulationRequest } from '@/services/ScenarioService'

enableAutoUnmount(afterEach)

const { simulate, list, decisionList, replace } = vi.hoisted(() => ({
  simulate: vi.fn(), list: vi.fn(), decisionList: vi.fn(), replace: vi.fn(),
}))
vi.mock('@/services/ScenarioService', () => ({ default: { simulate, list } }))
vi.mock('@/services/DecisionService', () => ({ default: { list: decisionList } }))
vi.mock('@/services/BillingOrchestrationService', () => ({ default: {} }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => ({ getWorkspaces: [] }) }))
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
  simulate.mockResolvedValue({ data: {
    scenarioName: 'Mudança salva', months: 12, currentBalance: 1000, baselineMonthlyNet: 100,
    scenarioMonthlyImpact: -20, projectedFinalBalance: 1960, decisionStatus: 'STABLE',
    availableForGoals: 1960, impactedGoalsCount: 0, impactedGoalNames: [], forecast: [],
  } })
  replace.mockResolvedValue(undefined)
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
