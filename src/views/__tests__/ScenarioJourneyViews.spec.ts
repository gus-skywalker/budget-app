import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import ScenarioBuilderView from '@/views/ScenarioBuilderView.vue'
import ScenarioEditorView from '@/views/ScenarioEditorView.vue'
import { beginJourneySession, readJourneySession, readJourneyResult } from '@/utils/decisionJourneySession'
import { readBudgetReturn } from '@/utils/decisionBudgetReturn'

enableAutoUnmount(afterEach)
const context = { userId: 'user-1', workspaceId: 'workspace-1' }
const store = reactive({ isAuthenticated: true, getUser: { id: context.userId }, getCurrentWorkspaceId: context.workspaceId })
const route = reactive({ params: {} as Record<string, string>, query: {} as Record<string, string> })
const { api, budgetApi, decisions, push, replace } = vi.hoisted(() => ({
  api: { simulate: vi.fn(), list: vi.fn() }, budgetApi: { getCurrent: vi.fn() },
  decisions: { list: vi.fn() }, push: vi.fn(), replace: vi.fn(),
}))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => store }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push, replace }), useRoute: () => route }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: ref('en') }) }))
vi.mock('@/i18n', () => ({ default: { global: { locale: { value: 'en' } } } }))
vi.mock('@/services/ScenarioService', () => ({ default: api }))
vi.mock('@/services/BudgetService', () => ({ default: budgetApi }))
vi.mock('@/services/DecisionService', () => ({ default: decisions }))

const budget = { id: 'budget-1', periodMonth: 9, periodYear: 2026, lines: [], totalIncome: 1000, totalExpense: 600, net: 400 }
const saved = { id: 'scenario-1', budgetId: budget.id, name: 'Monthly expense', sourceType: 'BUDGET_BASED', months: 6,
  deltas: [{ type: 'MONTHLY_EXPENSE', amount: 100, temporalType: 'ONGOING' }], lines: [] }
const response = { sourceType: 'BUDGET_BASED', scenarioName: 'Monthly expense', scenarioMonthlyImpact: -100, forecast: [], impactedGoalNames: [] }
const mountOptions = { global: { stubs: { PageHeader: true, ScenarioChangeCard: true, AlertStrip: true }, config: { warnHandler: () => {} } } }

describe('budget journey views', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    store.getCurrentWorkspaceId = context.workspaceId
    route.params = {}
    route.query = {}
    budgetApi.getCurrent.mockResolvedValue({ status: 200, data: budget })
    api.list.mockResolvedValue({ data: [saved] })
    api.simulate.mockResolvedValue({ data: response })
    decisions.list.mockResolvedValue({ data: [] })
  })

  it('starts a fresh budget session after a debt session and removes its preview', async () => {
    beginJourneySession(context, 'MANUAL_TYPED', 'debt-1')
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', JSON.stringify({ currentScenarioId: 'debt-1' }))
    sessionStorage.setItem('planning-scenario-latest-result', '{}')
    route.query = { guided: '1' }
    shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    expect(readJourneySession(context)).toMatchObject({ sourceType: 'BUDGET_BASED', scenarioId: null })
    expect(sessionStorage.getItem('planning-debt-scenario-wizard-v1')).toBeNull()
    expect(sessionStorage.getItem('planning-scenario-latest-result')).toBeNull()
    expect(JSON.parse(sessionStorage.getItem('planning-scenario-wizard-v3')!).currentScenarioId).toBeNull()
  })

  it('distinguishes a failed baseline load from no budget and retries without replacing the session', async () => {
    budgetApi.getCurrent.mockRejectedValueOnce(new Error('offline'))
    const wrapper = shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    expect(wrapper.text()).toContain('decisionJourney.base.loadError')
    expect(wrapper.text()).not.toContain('planning.scenarios.empty_no_budget_title')
    const id = readJourneySession(context)!.sessionId
    await (wrapper.vm as any).loadBudget(true)
    await flushPromises()
    expect((wrapper.vm as any).activeBudget.id).toBe(budget.id)
    expect(readJourneySession(context)!.sessionId).toBe(id)
  })

  it('offers manual preparation after 204 and resumes the same journey after a plan is ready', async () => {
    route.query = { guided: '1', intent: 'monthly-change' }
    budgetApi.getCurrent.mockResolvedValueOnce({ status: 204, data: null })
    const wrapper = shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    expect(wrapper.text()).toContain('decisionJourney.base.manualHelp')
    expect(wrapper.text()).not.toContain('decisionJourney.base.loadError')
    const id = readJourneySession(context)!.sessionId
    await (wrapper.vm as any).prepareBudget()
    const destination = push.mock.calls[0][0]
    expect(destination.name).toBe('planning-budget')
    const back = readBudgetReturn(destination.query, context) as any
    wrapper.unmount()
    route.query = back.query
    const returned = shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    expect(readJourneySession(context)!.sessionId).toBe(id)
    expect((returned.vm as any).snapshot.budgetId).toBe(budget.id)
    expect(api.simulate).not.toHaveBeenCalled()
  })

  it('clones a saved budget scenario without retaining its persisted identity', async () => {
    route.query = { cloneFrom: saved.id, locked: '1' }
    shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    const draft = JSON.parse(sessionStorage.getItem('planning-scenario-wizard-v3')!)
    expect(draft.currentScenarioId).toBeNull()
    expect(draft.adjustments[0].amount).toBe(100)
  })

  it('preserves the current draft when explicitly resuming in the same builder', async () => {
    const wrapper = shallowMount(ScenarioBuilderView, mountOptions)
    await flushPromises()
    ;(wrapper.vm as any).snapshot.scenarioName = 'My draft'
    await flushPromises()
    const sessionId = readJourneySession(context)!.sessionId
    route.query = { resume: '1' }
    await flushPromises()
    expect(readJourneySession(context)!.sessionId).toBe(sessionId)
    expect((wrapper.vm as any).snapshot.scenarioName).toBe('My draft')
    expect(JSON.parse(sessionStorage.getItem('planning-scenario-wizard-v3')!).scenarioName).toBe('My draft')
  })

  it('keeps saved identity when editing and publishes a matching result', async () => {
    route.params = { id: saved.id }
    const wrapper = shallowMount(ScenarioEditorView, mountOptions)
    await flushPromises()
    await (wrapper.vm as any).simulate()
    expect(api.simulate.mock.calls[0][0]).toMatchObject({ id: saved.id, sourceType: 'BUDGET_BASED' })
    expect(readJourneyResult(readJourneySession(context)!, saved.id)?.scenarioName).toBe('Monthly expense')
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ params: { id: saved.id } }))
  })

  it('keeps governance redirect for a scenario with votes', async () => {
    route.params = { id: saved.id }
    decisions.list.mockResolvedValue({ data: [{ scenarioId: saved.id, status: 'OPEN', approveVotes: 1, rejectVotes: 0 }] })
    shallowMount(ScenarioEditorView, mountOptions)
    await flushPromises()
    expect(replace).toHaveBeenCalledWith({ name: 'planning-scenarios-new', query: { cloneFrom: saved.id, locked: '1' } })
    expect(api.simulate).not.toHaveBeenCalled()
  })

  it('ignores a late budget load after a workspace change', async () => {
    let finish!: (value: unknown) => void
    budgetApi.getCurrent.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const wrapper = shallowMount(ScenarioBuilderView, mountOptions)
    store.getCurrentWorkspaceId = 'workspace-2'
    finish({ status: 200, data: budget })
    await flushPromises()
    expect((wrapper.vm as any).activeBudget).toBeNull()
    expect(sessionStorage.getItem('planning-scenario-wizard-v3')).toBeNull()
  })

  it('does not publish a response after the builder unmounts', async () => {
    route.params = { id: saved.id }
    let finish!: (value: unknown) => void
    api.simulate.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const wrapper = shallowMount(ScenarioEditorView, mountOptions)
    await flushPromises()
    const request = (wrapper.vm as any).simulate()
    wrapper.unmount()
    finish({ data: response })
    await request
    expect(push).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('planning-scenario-latest-result')).toBeNull()
  })

  it('keeps the submitted draft with the result if values change while awaiting simulation', async () => {
    route.params = { id: saved.id }
    let finish!: (value: unknown) => void
    api.simulate.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const wrapper = shallowMount(ScenarioEditorView, mountOptions)
    await flushPromises()
    const request = (wrapper.vm as any).simulate()
    ;(wrapper.vm as any).snapshot.adjustments[0].amount = 999
    await flushPromises()
    finish({ data: response })
    await request
    const draft = JSON.parse(sessionStorage.getItem('planning-scenario-wizard-v3')!)
    expect(draft.adjustments[0].amount).toBe(100)
    expect(api.simulate.mock.calls[0][0].deltas[0].amount).toBe(100)
  })
})
