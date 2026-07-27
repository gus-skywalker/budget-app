import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ReportAnalyticsPanel from '@/components/ReportAnalyticsPanel.vue'

const { analyticsMock, fetchTransactionsMock, listCategoriesMock, routerPushMock } = vi.hoisted(() => ({
  analyticsMock: vi.fn(),
  fetchTransactionsMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  routerPushMock: vi.fn(),
}))

vi.mock('@/services/ReportService', () => ({
  default: class ReportServiceMock {
    analytics = analyticsMock
  },
}))

vi.mock('@/services/FinancialReadService', () => ({
  default: {
    fetchTransactions: fetchTransactionsMock,
    updateTransaction: vi.fn(),
  },
}))

vi.mock('@/services/DataService', () => ({
  default: { listCategories: listCategoriesMock },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPushMock }),
}))

vi.mock('vuetify', () => ({
  useDisplay: () => ({ mobile: ref(false) }),
}))

const messages: Record<string, string> = {
  'categories.travel': 'Viagens',
  'reportAnalytics.uncategorized': 'Sem categoria',
  'reportAnalytics.transactionCount': '{count} transações',
  'reportAnalytics.unknownCategory': 'Categoria padrão sem tradução',
  'reportAnalytics.customCategory': 'Categoria personalizada',
  'transactions.details.categorization_sources.UNKNOWN': 'Origem não registrada',
  'reportAnalytics.scope.label': 'Escopo do relatório',
  'reportAnalytics.scope.visibleToMe': 'Visível para mim',
  'reportAnalytics.scope.workspaceShared': 'Somente dados compartilhados do espaço',
  'reportAnalytics.scope.visibleToMeDescription': 'Pode conter seus dados pessoais.',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('pt'),
    te: (key: string) => Object.prototype.hasOwnProperty.call(messages, key),
    t: (key: string, params?: Record<string, unknown>) => {
      let value = messages[key] || key
      Object.entries(params || {}).forEach(([name, replacement]) => {
        value = value.replace(`{${name}}`, String(replacement))
      })
      return value
    },
  }),
}))

const analytics = {
  fromDate: '2026-07-01',
  toDate: '2026-07-31',
  reportScope: 'VISIBLE_TO_ACTOR' as const,
  currency: 'BRL',
  income: 300,
  expenses: 100,
  net: 200,
  excluded: 0,
  categories: [{
    categoryId: 7,
    categoryCode: 'travel',
    categoryName: 'Travel',
    systemDefined: true,
    displayColor: '#123456',
    displayIcon: null,
    amount: 80,
    transactionCount: 2,
  }],
  uncategorized: {
    categoryId: null,
    categoryCode: null,
    categoryName: null,
    systemDefined: false,
    displayColor: null,
    displayIcon: null,
    amount: 20,
    transactionCount: 1,
  },
}

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

const stubs = {
  VSelect: { props: ['modelValue', 'items'], template: '<div class="select-stub" />' },
  VAlert: true,
  VProgressCircular: true,
  VIcon: true,
  VBtn: { template: '<button><slot /></button>' },
  VDialog: { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' },
  VCard: { template: '<div><slot /></div>' },
  VCardTitle: { template: '<div><slot /></div>' },
  VCardText: { template: '<div><slot /></div>' },
  VCardActions: { template: '<div><slot /></div>' },
  VDivider: true,
  VSpacer: true,
  VPagination: true,
}

const mountPanel = () => mount(ReportAnalyticsPanel, { global: { stubs } })

describe('ReportAnalyticsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    analyticsMock.mockResolvedValue({ data: analytics })
    fetchTransactionsMock.mockResolvedValue({ data: { items: [], total: 2, limit: 12, offset: 0 } })
    listCategoriesMock.mockResolvedValue({ data: [] })
  })

  it('opens a paginated drill-down with the exact category and report filters', async () => {
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.text()).toContain('Viagens')
    await wrapper.get('.category-chart__row--interactive').trigger('click')
    await flushPromises()

    expect(fetchTransactionsMock).toHaveBeenCalledWith(expect.objectContaining({
      fromDate: '2026-07-01',
      toDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      direction: 'OUTFLOW',
      categoryId: 7,
      excludedFromPlanning: false,
      reportScope: 'VISIBLE_TO_ACTOR',
      limit: 12,
      offset: 0,
    }))
  })

  it('loads both comparison periods in the actor-visible scope by default', async () => {
    mountPanel()
    await flushPromises()

    expect(analyticsMock).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'VISIBLE_TO_ACTOR')
  })

  it('propagates the selected scope to analytics, drill-down and Transactions navigation', async () => {
    const wrapper = mountPanel()
    await flushPromises()

    ;(wrapper.vm as any).selectedReportScope = 'WORKSPACE_SHARED'
    await flushPromises()
    expect(analyticsMock).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), 'WORKSPACE_SHARED')

    await wrapper.get('.category-chart__row--interactive').trigger('click')
    await flushPromises()
    expect(fetchTransactionsMock).toHaveBeenLastCalledWith(expect.objectContaining({
      reportScope: 'WORKSPACE_SHARED',
    }))

    const openTransactionsButton = wrapper.findAll('button').find((button) => button.text().includes('reportAnalytics.openTransactions'))
    await openTransactionsButton!.trigger('click')
    expect(routerPushMock).toHaveBeenCalledWith(expect.objectContaining({
      query: expect.objectContaining({ reportScope: 'WORKSPACE_SHARED' }),
    }))
  })

  it('opens uncategorized as a separate actionable queue', async () => {
    const wrapper = mountPanel()
    await flushPromises()

    const buttons = wrapper.findAll('.uncategorized-card button')
    await buttons[0].trigger('click')
    await flushPromises()

    expect(fetchTransactionsMock).toHaveBeenCalledWith(expect.objectContaining({
      uncategorized: true,
      categoryId: undefined,
    }))
  })

  it('renders several categories, long labels, large amounts and a dominant uncategorized queue', async () => {
    const categories = Array.from({ length: 9 }, (_, index) => ({
      categoryId: index + 1,
      categoryCode: `custom-${index + 1}`,
      categoryName: index === 0
        ? 'Alimentação fora de casa e experiências gastronômicas especiais'
        : `Categoria personalizada ${index + 1}`,
      systemDefined: false,
      displayColor: index === 0 ? '#123456' : null,
      displayIcon: null,
      amount: index === 0 ? 1234567.89 : 1000 + index,
      transactionCount: index + 1,
    }))
    analyticsMock.mockResolvedValue({
      data: {
        ...analytics,
        expenses: 6500000,
        categories,
        uncategorized: {
          ...analytics.uncategorized,
          amount: 4999999.99,
          transactionCount: 87,
        },
      },
    })

    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.findAll('.category-chart__row--interactive')).toHaveLength(7)
    expect(wrapper.text()).toContain('Alimentação fora de casa e experiências gastronômicas especiais')
    expect(wrapper.text()).toMatch(/1\.234\.567,89/)
    expect(wrapper.get('.uncategorized-card').text()).toContain('Sem categoria')
    expect(wrapper.get('.uncategorized-card').text()).toMatch(/4\.999\.999,99/)

    const showAllButton = wrapper.findAll('button').find((button) => button.text().includes('reportAnalytics.showAll'))
    expect(showAllButton).toBeDefined()
    await showAllButton!.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.category-chart__row--interactive')).toHaveLength(9)
  })

  it('keeps a full page of long drill-down transactions readable', async () => {
    const items = Array.from({ length: 12 }, (_, index) => ({
      id: `transaction-${index + 1}`,
      accountId: 3,
      accountName: 'Conta principal de uso diário',
      amount: index === 0 ? -9876543.21 : -(index + 1) * 100,
      date: `2026-07-${String(index + 1).padStart(2, '0')}`,
      description: index === 0
        ? 'Compra com uma descrição excepcionalmente longa para validar a legibilidade do detalhamento'
        : `Transação de teste ${index + 1}`,
      direction: 'OUTFLOW',
      categorizationSource: 'UNKNOWN',
      visibilityScope: 'WORKSPACE',
      excludedFromPlanning: false,
    }))
    fetchTransactionsMock.mockResolvedValue({ data: { items, total: 48, limit: 12, offset: 0 } })

    const wrapper = mountPanel()
    await flushPromises()
    await wrapper.get('.category-chart__row--interactive').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.drill-down__transaction')).toHaveLength(12)
    expect(wrapper.text()).toContain('Compra com uma descrição excepcionalmente longa para validar a legibilidade do detalhamento')
    expect(wrapper.text()).toMatch(/9\.876\.543,21/)
    expect(wrapper.findAll('.select-stub')).toHaveLength(14)
  })
})
