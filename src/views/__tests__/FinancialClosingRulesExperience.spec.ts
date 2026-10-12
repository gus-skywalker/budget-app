import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FinancialClosingRulesView from '@/views/FinancialClosingRulesView.vue'

const { list, productivityDeductions, closingReserveRules, participants, deductionReadiness, previewProductivityDeductions, push } = vi.hoisted(() => ({
  list: vi.fn(), productivityDeductions: vi.fn(), closingReserveRules: vi.fn(), participants: vi.fn(),
  deductionReadiness: vi.fn(), previewProductivityDeductions: vi.fn(), push: vi.fn(),
}))
vi.mock('@/services/FinancialClosingService', () => ({ default: {
  list, productivityDeductions, closingReserveRules, participants, deductionReadiness, previewProductivityDeductions,
} }))
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { closingId: 'closing-1' }, query: {} }), useRouter: () => ({ push }) }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => ({ canWrite: true }) }))
vi.mock('@/components/PageHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/AlertStrip.vue', () => ({ default: { props: ['description'], template: '<p>{{ description }}</p>' } }))

const mountView = () => mount(FinancialClosingRulesView, { global: { stubs: {
  VBtn: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
  VIcon: { template: '<span />' }, VProgressCircular: { template: '<span />' },
  VChip: { template: '<span><slot /></span>' }, VDialog: { template: '<div><slot /></div>' },
  VCard: { template: '<div><slot /></div>' }, VCardTitle: { template: '<div><slot /></div>' },
  VCardText: { template: '<div><slot /></div>' }, VCardActions: { template: '<div><slot /></div>' },
  VSpacer: { template: '<span />' }, VTextField: { inheritAttrs: false, template: '<input />' },
  VSelect: { template: '<select />' }, VTextarea: { template: '<textarea />' },
  VSwitch: { template: '<input type="checkbox" />' },
} } })

describe('FinancialClosingRulesView experience states', () => {
  beforeEach(() => {
    list.mockReset(); productivityDeductions.mockReset(); closingReserveRules.mockReset()
    participants.mockReset(); deductionReadiness.mockReset(); previewProductivityDeductions.mockReset()
    list.mockResolvedValue({ data: [{ id: 'closing-1', workflowStatus: 'DRAFT', currency: 'BRL', periodMonth: 6, periodYear: 2026,
      currentVersion: { versionNumber: 1, versionStatus: 'EDITABLE' } }] })
    productivityDeductions.mockResolvedValue({ data: [] })
    closingReserveRules.mockResolvedValue({ data: [] })
    participants.mockResolvedValue({ data: [] })
    deductionReadiness.mockResolvedValue({ data: { sources: [{ sourceId: 'source-1', sourceKey: 'TEST', displayName: 'Fonte de teste', detail: '', status: 'REVIEW_REQUIRED', dependencyCurrent: false }], blockingSourceKeys: ['TEST'], readyToCalculate: false } })
    previewProductivityDeductions.mockResolvedValue({ data: null })
  })

  it('offers recovery without rendering stale rules after a load failure', async () => {
    list.mockRejectedValueOnce(new Error('offline'))
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Tentar novamente')
    expect(wrapper.text()).not.toContain('Ajustes individuais')

    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('details.optional-rules')[1].text()).toContain('Ajustes individuais')
  })

  it('starts optional rules collapsed while keeping source review visible', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.findAll('details.optional-rules')).toHaveLength(3)
    expect(wrapper.findAll('details.optional-rules').slice(1).every((details) => details.attributes('open') === undefined)).toBe(true)
    expect(wrapper.text()).toContain('Confirmar sem dedução')
  })
})
