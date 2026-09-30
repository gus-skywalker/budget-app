import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from 'vue-i18n'
import DecisionStartView from '@/views/DecisionStartView.vue'
import { advancedDecisionAccess, decisionDestination, decisionIntents, intentKey } from '@/utils/decisionJourney'
import pt from '@/assets/locales/pt.json'
import en from '@/assets/locales/en.json'
import es from '@/assets/locales/es.json'
import fr from '@/assets/locales/fr.json'

enableAutoUnmount(afterEach)
const store = reactive({ canWrite: true, isAuthenticated: true, getUser: { id: 'user-1' }, getCurrentWorkspaceId: 'workspace-1' })
const dark = ref({ dark: false })
const { summary, simulate, save, createDecision, activate } = vi.hoisted(() => ({ summary: vi.fn(), simulate: vi.fn(), save: vi.fn(), createDecision: vi.fn(), activate: vi.fn() }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => store }))
vi.mock('vuetify', () => ({ useTheme: () => ({ global: { current: dark } }) }))
vi.mock('@/services/BillingOrchestrationService', () => ({ default: { getBillingSummary: summary } }))
vi.mock('@/services/ScenarioService', () => ({ default: { simulate, save } }))
vi.mock('@/services/DecisionService', () => ({ default: { createFromScenario: createDecision } }))
vi.mock('@/services/BudgetService', () => ({ default: { activate } }))

const i18n = () => createI18n({ legacy: false, locale: 'pt', messages: { pt, en, es, fr } })
async function setup(query = '') {
  const names = ['decisions', 'planning-scenarios-new', 'planning-scenarios-debt-new', 'planning-budget', 'planning-goals']
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/planning/decide', name: 'planning-decision-start', component: DecisionStartView },
    ...names.map(name => ({ name, path: `/${name}`, component: { template: '<div />' } })),
  ] })
  await router.push('/planning/decide' + query)
  const wrapper = mount(DecisionStartView, { global: { plugins: [router, i18n()], stubs: {
    'v-icon': { template: '<i aria-hidden="true" />' },
    'v-btn': { template: '<button><slot /></button>' },
  } } })
  return { wrapper, router }
}

describe('decision entry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    store.canWrite = true
    store.isAuthenticated = true
    store.getCurrentWorkspaceId = 'workspace-1'
    dark.value = { dark: false }
    summary.mockResolvedValue({ data: { capabilities: { advancedScenariosEnabled: true } } })
  })

  it.each(decisionIntents)('navigates to $id without inherited query or financial commands', async intent => {
    sessionStorage.setItem('planning-scenario-wizard-v3', 'existing draft')
    const { wrapper, router } = await setup('?template=investment&cloneFrom=old&resume=1&intent=unknown')
    await flushPromises()
    expect(sessionStorage.getItem('planning-scenario-wizard-v3')).toBe('existing draft')
    await wrapper.get(`[data-intent="${intent.id}"]`).trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe(intent.destination)
    expect(router.currentRoute.value.query).toEqual(intent.group === 'primary' ? { guided: '1', intent: intent.id } : {})
    for (const command of [simulate, save, createDecision, activate]) expect(command).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('planning-scenario-wizard-v3')).toBe('existing draft')
  })

  it('explains read-only access and keeps plan/goal navigation available', async () => {
    store.canWrite = false
    const { wrapper, router } = await setup()
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toContain('acesso de leitura')
    for (const intent of decisionIntents.filter(item => item.requiresWrite)) {
      const card = wrapper.get(`[data-intent="${intent.id}"]`)
      expect(card.attributes('aria-disabled')).toBe('true')
      await card.trigger('click')
      expect(router.currentRoute.value.name).toBe('planning-decision-start')
    }
    expect(wrapper.findAll('.support-link')).toHaveLength(2)
  })

  it('distinguishes loading, network error and retry from a plan denial', async () => {
    let reject!: (error: Error) => void
    summary.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail }))
    const { wrapper, router } = await setup()
    expect(wrapper.text()).toContain('Verificando acesso')
    await wrapper.get('[data-intent="payment-options"]').trigger('click')
    expect(router.currentRoute.value.name).toBe('planning-decision-start')
    reject(new Error('offline'))
    await flushPromises()
    expect(wrapper.text()).toContain('Não conseguimos verificar')
    expect(wrapper.text()).not.toContain('Não incluído no plano atual')
    await wrapper.get('.decision-start__retry').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-intent="payment-options"]').attributes('aria-disabled')).toBe('false')
  })

  it('uses confirmed denial only for the advanced path', async () => {
    summary.mockResolvedValue({ data: { capabilities: { advancedScenariosEnabled: false, advancedToolsEnabled: true }, hasPremiumAccess: true } })
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.get('[data-intent="payment-options"]').text()).toContain('Não incluído no plano atual')
    expect(wrapper.get('[data-intent="monthly-change"]').attributes('aria-disabled')).toBe('false')
  })

  it('does not reuse access from the previous workspace', async () => {
    let finish!: (value: unknown) => void
    summary.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const { wrapper } = await setup()
    summary.mockResolvedValue({ data: { capabilities: { advancedScenariosEnabled: false } } })
    store.getCurrentWorkspaceId = 'workspace-2'
    await flushPromises()
    finish({ data: { capabilities: { advancedScenariosEnabled: true } } })
    await flushPromises()
    expect(wrapper.get('[data-intent="payment-options"]').attributes('aria-disabled')).toBe('true')
  })

  it('does not apply light tokens in dark mode', async () => {
    const { wrapper } = await setup()
    expect(wrapper.classes()).toContain('decision-start--light')
    dark.value = { dark: true }
    await flushPromises()
    expect(wrapper.classes()).not.toContain('decision-start--light')
  })

  it('preserves legacy capability fallbacks and treats missing evidence as unknown', () => {
    expect(advancedDecisionAccess(null)).toBeNull()
    expect(advancedDecisionAccess({} as any)).toBeNull()
    expect(advancedDecisionAccess({ capabilities: { advancedToolsEnabled: true } } as any)).toBe(true)
    expect(advancedDecisionAccess({ capabilities: {}, hasPremiumAccess: true } as any)).toBe(true)
    expect(advancedDecisionAccess({ capabilities: { advancedScenariosEnabled: false }, hasPremiumAccess: true } as any)).toBe(false)
    expect(decisionDestination(['payment-options'])).toEqual({ name: 'planning-scenarios-new', query: { guided: '1', intent: 'custom' } })
  })

  it('has every static and dynamic journey key in all four languages', () => {
    const translator = i18n().global
    const keys: string[] = []
    function collect(object: Record<string, unknown>, prefix: string) {
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') keys.push(`${prefix}.${key}`)
        else collect(value as Record<string, unknown>, `${prefix}.${key}`)
      }
    }
    collect(pt.decisionJourney, 'decisionJourney')
    for (const language of ['pt', 'en', 'es', 'fr'] as const) {
      for (const key of keys) expect(translator.te(key, language), `${language}: ${key}`).toBe(true)
      for (const intent of decisionIntents) expect(translator.te(intentKey(intent, 'title'), language)).toBe(true)
    }
  })
})
