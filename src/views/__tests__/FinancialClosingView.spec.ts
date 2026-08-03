import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import FinancialClosingView from '@/views/FinancialClosingView.vue'
import { useUserStore } from '@/plugins/userStore'

const { serviceMock } = vi.hoisted(() => ({
  serviceMock: {
    list: vi.fn(), summary: vi.fn(), matrix: vi.fn(), memory: vi.fn(), drillDown: vi.fn(), calculate: vi.fn(),
  },
}))

vi.mock('@/services/FinancialClosingService', () => ({ default: serviceMock }))

class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = ResizeObserverMock as any
const vuetify = createVuetify({ components, directives })
const flush = async () => { await Promise.resolve(); await new Promise(resolve => setTimeout(resolve, 0)); await Promise.resolve() }

const closing = {
  id: 'closing-1', workspaceId: 'workspace-1', closingKey: 'DEFAULT', periodMonth: 7, periodYear: 2026,
  currency: 'BRL', workflowStatus: 'DRAFT', settlementStatus: 'NOT_ISSUED',
  currentVersion: { id: 'version-1', versionNumber: 1, versionStatus: 'EDITABLE', inputRevision: 3, calculatedRevision: 3, calculationCurrent: true },
}

describe('FinancialClosingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useUserStore().tenantRole = 'ROLE_MEMBER'
    vi.clearAllMocks()
    serviceMock.list.mockResolvedValue({ data: [closing] })
    serviceMock.summary.mockResolvedValue({ data: {
      calculationRunId: 'run-1', versionNumber: 1, inputRevision: 3, calculationPolicyVersion: 'DIRECT_ATTRIBUTION_V1',
      roundingMode: 'HALF_UP', intermediateScale: 12, grossAmount: 92000, reversalAmount: 0, deductionAmount: 1758.35,
      closingAdjustmentAmount: 0, productivityAmount: 81581.90, undistributedPoolAmount: 8659.75,
      netRevenueAmount: 90241.65, residualAmount: 0, calculatedAt: '2026-08-03T12:00:00Z',
      reconciliation: { expectedInflowAmount: 90241.65, reconciledInflowAmount: 0, coveragePercentage: 0, divergenceAmount: 90241.65, unreconciledItemCount: 10 },
    } })
    serviceMock.matrix.mockResolvedValue({ data: {
      sources: [{ id: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Convênio BP Paulista' }, { id: 'consult', sourceKey: 'CONSULTORIA', displayName: 'Consultoria' }],
      rows: [{ participant: { id: 'elimar', participantKey: 'ELIMAR', displayName: 'Elimar Elias Gomes', active: true }, values: { bp: 4731.71, consult: 5913.80 }, total: 10645.51 }],
      sourceTotals: { bp: 69979.18, consult: 5913.80 }, productivityTotal: 81581.90,
    } })
    serviceMock.drillDown.mockResolvedValue({ data: { participantId: 'elimar', sourceId: 'consult', grossAmount: 7068, deductionAmount: 1154.20, adjustmentAmount: 0, netAmount: 5913.80, items: [{ itemId: 'i1', clientItemKey: 'consultoria-elimar', financialLabel: 'Consultoria', signedGrossAmount: 7068, deductionAmount: 1154.20, adjustmentAmount: 0, netAmount: 5913.80 }] } })
  })

  it('renders the July totals, keeps margin separate, and exposes cell drill-down', async () => {
    const wrapper = mount(FinancialClosingView, {
      global: {
        plugins: [vuetify],
        stubs: {
          PageHeader: { props: ['title', 'summaryItems'], template: '<header><h1>{{ title }}</h1><slot name="actions" /></header>' },
          AlertStrip: { props: ['description'], template: '<div>{{ description }}</div>' },
          VDialog: { props: ['modelValue'], template: '<section v-if="modelValue"><slot /></section>' },
        },
      },
    })
    await flush(); await flush()

    expect(wrapper.text()).toContain('Produtividade Líquida')
    expect(wrapper.text()).toContain('R$ 81.581,90')
    expect(wrapper.text()).toContain('Margem de Contribuição')
    expect(wrapper.text()).toContain('R$ 8.659,75')
    expect(wrapper.text()).toContain('R$ 90.241,65')
    expect(wrapper.find('table').text()).not.toContain('8.659,75')

    const consultCell = wrapper.findAll('.cell-button').find(button => button.text().includes('5.913,80'))
    expect(consultCell).toBeTruthy()
    await consultCell!.trigger('click'); await flush()
    expect(serviceMock.drillDown).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'elimar', 'consult')
    expect(wrapper.text()).toContain('Elimar Elias Gomes · Consultoria')
    expect(wrapper.text()).toContain('Bruto R$ 7.068,00')
  })

  it.each([
    ['ROLE_VIEWER', false],
    ['ROLE_MEMBER', true],
    ['ROLE_ADMIN', true],
  ])('reflects calculation permission for %s', async (role, expectedEnabled) => {
    useUserStore().tenantRole = role
    const wrapper = mount(FinancialClosingView, {
      global: {
        plugins: [vuetify],
        stubs: {
          PageHeader: { props: ['title', 'summaryItems'], template: '<header><h1>{{ title }}</h1><slot name="actions" /></header>' },
          AlertStrip: { props: ['description'], template: '<div>{{ description }}</div>' },
        },
      },
    })
    await flush(); await flush()

    const recalculate = wrapper.get('button')
    expect(recalculate.attributes('disabled') === undefined).toBe(expectedEnabled)
  })
})
