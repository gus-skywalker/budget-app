import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref, reactive } from 'vue'
import DebtScenarioBuilderView from '@/views/DebtScenarioBuilderView.vue'
import { beginJourneySession } from '@/utils/decisionJourneySession'

enableAutoUnmount(afterEach)
const context = { userId: 'user-1', workspaceId: 'workspace-1' }
const userStoreMock = reactive({ isAuthenticated: true, getUser: { id: context.userId }, getCurrentWorkspaceId: context.workspaceId })
const routeState = reactive({ params: {} as Record<string, string>, query: {} as Record<string, string> })
const savedDraft = { scenarioName: 'Existing debt', currentScenarioId: 'saved-debt', sourceType: 'MANUAL_TYPED', debtInput: {
  title: 'Existing debt', totalAmount: 500, availableCash: 100,
  options: [{ name: 'A', type: 'MANUAL', liquidityCertainty: 'CERTAIN' }, { name: 'B', type: 'INSTALLMENT', liquidityCertainty: 'UNCERTAIN' }],
} }
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => userStoreMock }))

const { routerPush, scenarioServiceMock, budgetServiceMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  scenarioServiceMock: {
    simulate: vi.fn(),
    list: vi.fn(),
  },
  budgetServiceMock: {
    getCurrent: vi.fn(),
  },
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({
      push: routerPush,
    }),
    useRoute: () => routeState,
  }
})

vi.mock('@/services/ScenarioService', () => ({
  default: scenarioServiceMock,
  DEBT_PAYMENT_SCENARIO_TYPE: 'DEBT_PAYMENT_DECISION',
}))

vi.mock('@/services/BudgetService', () => ({
  default: budgetServiceMock,
}))

vi.mock('@/i18n', () => ({
  default: {
    global: {
      locale: { value: 'en' },
    },
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('en'),
    t: (key: string, params?: Record<string, unknown>) => {
      const messages: Record<string, string> = {
        'contentExperience.planning.debtBuilder.addOption': 'Add option',
        'contentExperience.planning.debtBuilder.compareOptions': 'Compare options',
        'contentExperience.planning.debtBuilder.optionLabel': 'Option {index}',
      }
      let value = messages[key] || key
      Object.entries(params || {}).forEach(([name, replacement]) => {
        value = value.replace(`{${name}}`, String(replacement))
      })
      return value
    },
  }),
}))

const vuetify = createVuetify({ components, directives })

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!(globalThis as any).ResizeObserver) {
  ;(globalThis as any).ResizeObserver = ResizeObserverMock
}

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('DebtScenarioBuilderView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    routeState.params = {}
    routeState.query = {}
    userStoreMock.getCurrentWorkspaceId = context.workspaceId
    budgetServiceMock.getCurrent.mockResolvedValue({ status: 204, data: null })
    scenarioServiceMock.list.mockResolvedValue({ data: [] })
    scenarioServiceMock.simulate.mockResolvedValue({
      data: {
        scenarioName: 'Debt choice',
        scenarioType: 'DEBT_PAYMENT_DECISION',
        sourceType: 'MANUAL_TYPED',
        scenarioMonthlyImpact: -1144.82,
        summary: 'Bridge credit is cheaper if repaid fast, but installments are safer.',
        debtComparison: {
          cheapestOption: 'Bridge credit',
          safestOption: 'Installment card',
          recommendedOption: 'Installment card',
          recommendationReason: 'Installment card is safer.',
          tradeOffSummary: 'Installment card is safer.',
          warnings: ['Bridge credit: This option becomes risky if the expected cash does not arrive on time.'],
          options: [],
        },
      },
    })
  })

  it('validates required debt fields and supports adding/removing options', async () => {
    const wrapper = mount(DebtScenarioBuilderView, {
      global: {
        plugins: [vuetify],
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Option 1')
    expect(wrapper.text()).toContain('Option 2')

    const addButton = wrapper.findAll('button').find((button) => button.text().includes('Add option'))
    expect(addButton).toBeTruthy()
    await addButton!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Option 3')

    const compareButton = wrapper.findAll('button').find((button) => button.text().includes('Compare options'))
    expect(compareButton).toBeTruthy()
    await compareButton!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Title is required.')

    const removeButtons = wrapper.findAll('button').filter((button) => button.html().includes('mdi-delete-outline'))
    expect(removeButtons.length).toBeGreaterThan(0)
    await removeButtons[0].trigger('click')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Option 3')
  })

  it('starts a new guided debt instead of restoring the previous saved identity', async () => {
    beginJourneySession(context, 'MANUAL_TYPED', 'saved-debt')
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', JSON.stringify(savedDraft))
    routeState.query = { guided: '1', intent: 'payment-options' }
    const wrapper = mount(DebtScenarioBuilderView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.find('input').element.value).toBe('')
    expect(JSON.parse(sessionStorage.getItem('planning-debt-scenario-wizard-v1')!).currentScenarioId).toBeNull()
  })

  it('restores only an explicit same-context resume', async () => {
    beginJourneySession(context, 'MANUAL_TYPED', 'saved-debt')
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', JSON.stringify(savedDraft))
    routeState.query = { resume: '1' }
    const wrapper = mount(DebtScenarioBuilderView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.find('input').element.value).toBe('Existing debt')
    await wrapper.findAll('button').find(b => b.text().includes('Compare options'))!.trigger('click')
    await flushPromises()
    expect(scenarioServiceMock.simulate.mock.calls[0][0]).toMatchObject({ id: 'saved-debt', sourceType: 'MANUAL_TYPED' })
  })

  it('does not restore an unowned legacy draft', async () => {
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', JSON.stringify(savedDraft))
    routeState.query = { resume: '1' }
    const wrapper = mount(DebtScenarioBuilderView, { global: { plugins: [vuetify] } })
    await flushPromises()
    expect(wrapper.find('input').element.value).toBe('')
  })

  it.each(['edit', 'clone'])('preserves API data for %s with the appropriate saved identity', async (mode) => {
    if (mode === 'edit') routeState.params = { id: 'saved-debt' }
    else routeState.query = { cloneFrom: 'saved-debt', locked: '1' }
    scenarioServiceMock.list.mockResolvedValue({ data: [{ ...savedDraft, id: 'saved-debt', name: 'Existing debt' }] })
    mount(DebtScenarioBuilderView, { global: { plugins: [vuetify] } })
    await flushPromises()
    const draft = JSON.parse(sessionStorage.getItem('planning-debt-scenario-wizard-v1')!)
    expect(draft.currentScenarioId).toBe(mode === 'edit' ? 'saved-debt' : null)
    expect(draft.debtInput.totalAmount).toBe(500)
  })

  it('ignores a simulation response after changing workspace', async () => {
    beginJourneySession(context, 'MANUAL_TYPED', 'saved-debt')
    sessionStorage.setItem('planning-debt-scenario-wizard-v1', JSON.stringify(savedDraft))
    routeState.query = { resume: '1' }
    let finish!: (value: unknown) => void
    scenarioServiceMock.simulate.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const wrapper = mount(DebtScenarioBuilderView, { global: { plugins: [vuetify] } })
    await flushPromises()
    await wrapper.findAll('button').find(b => b.text().includes('Compare options'))!.trigger('click')
    userStoreMock.getCurrentWorkspaceId = 'workspace-2'
    finish({ data: { sourceType: 'MANUAL_TYPED', scenarioName: 'Stale' } })
    await flushPromises()
    expect(routerPush).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('planning-scenario-latest-result')).toBeNull()
    expect(wrapper.find('input').element.value).toBe('')
  })
})
