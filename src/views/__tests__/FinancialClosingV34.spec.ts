import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import FinancialClosingDecisionView from '@/views/FinancialClosingDecisionView.vue'

const { serviceMock, routerPush, routeState, userState } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routeState: { params: { closingId: 'closing-1' } },
  userState: { canWrite: true, isAdmin: true },
  serviceMock: {
    list: vi.fn(), summary: vi.fn(), participants: vi.fn(), payoutDecisions: vi.fn(),
    createPayoutDecision: vi.fn(), submitPayoutDecision: vi.fn(), approvePayoutDecision: vi.fn(),
    inflowCoverage: vi.fn(), attestInflowCoverage: vi.fn(), revokeInflowCoverage: vi.fn(),
  },
}))
vi.mock('@/services/FinancialClosingService', () => ({ default: serviceMock }))
vi.mock('@/plugins/userStore', () => ({ useUserStore: () => userState }))
vi.mock('vue-router', () => ({ useRoute: () => routeState, useRouter: () => ({ push: routerPush }) }))
class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver = ResizeObserverMock as any
Object.defineProperty(window, 'visualViewport', { value: { addEventListener: () => {}, removeEventListener: () => {}, width: 1024, height: 768, offsetTop: 0, offsetLeft: 0, scale: 1 }, configurable: true })
const vuetify = createVuetify({ components, directives })
const flush = async () => { await Promise.resolve(); await new Promise(resolve => setTimeout(resolve, 0)); await Promise.resolve() }
const stubs = { PageHeader: { props: ['title'], template: '<header><h1>{{title}}</h1></header>' }, AlertStrip: { props: ['description'], template: '<div role="alert">{{description}}</div>' } }
const closing = { id: 'closing-1', workspaceId: 'workspace-1', closingKey: 'DEFAULT', periodMonth: 8, periodYear: 2026, currency: 'BRL', workflowStatus: 'DRAFT', settlementStatus: 'NOT_ISSUED', currentVersion: { id: 'version-1', versionNumber: 1, versionStatus: 'EDITABLE', inputRevision: 4, calculatedRevision: 4, calculationCurrent: true } }
const payout = { participantId: 'participant-1', productivityAmount: 100, reserveAmount: 15, monthlyCeilingAmount: 85, score: 85, appliedScore: 85, valueReceivableAmount: 85, annualBonusEligibleScore: 0, undistributedAmount: 0, tmReserveAmount: 10, tiReserveAmount: 5, totalExplainedAmount: 100 }
const summary = { calculationRunId: 'run-1', versionNumber: 1, inputRevision: 4, calculationPolicyVersion: 'GROSS_TO_NET_V2', roundingMode: 'HALF_UP', intermediateScale: 12, grossAmount: 100, reversalAmount: 0, deductionAmount: 0, closingAdjustmentAmount: 0, productivityAmount: 100, undistributedPoolAmount: 0, netRevenueAmount: 100, residualAmount: 0, reconciliation: { expectedInflowAmount: 100, reconciledInflowAmount: 100, coveragePercentage: 100, divergenceAmount: 0, unreconciledItemCount: 0 }, calculatedAt: '2026-08-12T12:00:00Z', sourceProductivity: [], grossProductivityAmount: 100, netProductivityAmount: 100, calculationSemanticsVersion: 'GROSS_TO_NET_V2', participantPayouts: [payout] }
const draft = { id: 'decision-1', status: 'DRAFT', revision: 1, closingVersionId: 'version-1', calculationRunId: 'run-1', inputRevision: 4, productivityAmount: 100, valueReceivableAmount: 85, lines: [{ id: 'line-1', participantId: 'participant-1', amount: 85 }], issuedObligationCount: 0, ownerSelfApprovalException: false }
const review = { ...draft, status: 'REVIEW', revision: 2 }
const approved = { ...review, status: 'APPROVED', revision: 3, issuedObligationCount: 1 }
const coverage = { calculationRunId: 'run-1', coveragePolicyVersion: 'INFLOW_COVERAGE_V36', status: 'ATTESTED', expectedAmount: 100, attestedAmount: 100, divergenceAmount: 0, itemCount: 1, pendingItemCount: 0, attestationId: 'attestation-1', applicationId: 'application-1', replayed: false }

describe('Financial closing V34 decision journey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userState.canWrite = true
    userState.isAdmin = true
    serviceMock.list.mockResolvedValue({ data: [closing] })
    serviceMock.summary.mockResolvedValue({ data: summary })
    serviceMock.participants.mockResolvedValue({ data: [{ id: 'participant-1', participantKey: 'P1', displayName: 'Participante 1', active: true }] })
    serviceMock.payoutDecisions.mockResolvedValue({ data: [] })
    serviceMock.createPayoutDecision.mockResolvedValue({ data: draft })
    serviceMock.submitPayoutDecision.mockResolvedValue({ data: review })
    serviceMock.approvePayoutDecision.mockResolvedValue({ data: approved })
    serviceMock.inflowCoverage.mockResolvedValue({ data: coverage })
    serviceMock.attestInflowCoverage.mockResolvedValue({ data: coverage })
    serviceMock.revokeInflowCoverage.mockResolvedValue({ data: { ...coverage, status: 'REQUIRED', attestedAmount: 0, divergenceAmount: 100, pendingItemCount: 1, attestationId: null, applicationId: null } })
  })

  it('prepares and submits only the canonical Value Receivable without issuing obligations', async () => {
    const wrapper = mount(FinancialClosingDecisionView, { global: { plugins: [vuetify], stubs } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Revise antes de criar a proposta')
    expect(wrapper.text()).toContain('Valor a Receber')
    expect(wrapper.text()).toContain('R$ 85,00')
    expect(wrapper.text()).toContain('Não executa transferência bancária')
    await (wrapper.vm as any).createDecision(); await flush()
    expect(serviceMock.createPayoutDecision).toHaveBeenCalledWith(closing, undefined)
    expect(wrapper.text()).toContain('Proposta preparada')
    await (wrapper.vm as any).submitDecision(); await flush()
    expect(serviceMock.submitPayoutDecision).toHaveBeenCalledWith(closing, 'decision-1', 1)
    expect(wrapper.text()).toContain('Proposta em autorização')
  })

  it('keeps final approval unavailable to MEMBER and preserves the separation of duties message', async () => {
    userState.canWrite = true
    userState.isAdmin = false
    serviceMock.payoutDecisions.mockResolvedValue({ data: [review] })
    const wrapper = mount(FinancialClosingDecisionView, { global: { plugins: [vuetify], stubs } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Seu perfil pode consultar esta proposta')
    expect(wrapper.findAll('button').some(button => button.text().includes('Aprovar e emitir'))).toBe(false)
  })

  it('reuses the same idempotency key after a lost approval response and exposes the immutable result', async () => {
    serviceMock.payoutDecisions.mockResolvedValue({ data: [review] })
    serviceMock.approvePayoutDecision.mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce({ data: approved })
    const wrapper = mount(FinancialClosingDecisionView, { global: { plugins: [vuetify], stubs } })
    await flush(); await flush()
    ;(wrapper.vm as any).approvalJustification = 'Conciliação e valores conferidos'
    await (wrapper.vm as any).approveDecision()
    await (wrapper.vm as any).approveDecision()
    expect(serviceMock.approvePayoutDecision).toHaveBeenCalledTimes(2)
    expect(serviceMock.approvePayoutDecision.mock.calls[0][4]).toBe(serviceMock.approvePayoutDecision.mock.calls[1][4])
    expect(wrapper.text()).toContain('Histórico preservado')
    expect(wrapper.text()).toContain('1 obrigação(ões) emitida(s)')
  })

  it('blocks approval when the canonical inflow coverage is incomplete and remains usable at 360 px', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 360, configurable: true })
    serviceMock.summary.mockResolvedValue({ data: { ...summary, reconciliation: { ...summary.reconciliation, reconciledInflowAmount: 80, divergenceAmount: 20, coveragePercentage: 80 } } })
    serviceMock.inflowCoverage.mockResolvedValue({ data: { ...coverage, status: 'REQUIRED', attestedAmount: 0, divergenceAmount: 100, pendingItemCount: 1, attestationId: null, applicationId: null } })
    serviceMock.payoutDecisions.mockResolvedValue({ data: [review] })
    const wrapper = mount(FinancialClosingDecisionView, { global: { plugins: [vuetify], stubs } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('cobertura operacional das entradas ainda precisa de confirmação')
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('.sticky-action').exists()).toBe(true)
    expect(wrapper.findAll('button').find(button => button.text().includes('Aprovar e emitir'))?.attributes('disabled')).toBeDefined()
  })

  it('records a protected coverage attestation without exposing its evidence in the decision surface', async () => {
    serviceMock.payoutDecisions.mockResolvedValue({ data: [review] })
    serviceMock.inflowCoverage.mockResolvedValue({ data: { ...coverage, status: 'REQUIRED', attestedAmount: 0, divergenceAmount: 100, pendingItemCount: 1, attestationId: null, applicationId: null } })
    const wrapper = mount(FinancialClosingDecisionView, { global: { plugins: [vuetify], stubs } })
    await flush(); await flush()
    ;(wrapper.vm as any).coverageOpen = true
    ;(wrapper.vm as any).coverageJustification = 'Entradas conferidas na fonte autorizada'
    ;(wrapper.vm as any).coverageEvidence = 'private-reference-not-rendered-after-submit'
    ;(wrapper.vm as any).coverageIntent = true
    await (wrapper.vm as any).attestCoverage(); await flush()
    expect(serviceMock.attestInflowCoverage).toHaveBeenCalledWith(closing, 'run-1', expect.objectContaining({ sensitiveAccessConfirmed: true, explicitFullCoverageConfirmation: true }))
    expect(wrapper.text()).toContain('Cobertura registrada')
    expect(wrapper.text()).not.toContain('private-reference-not-rendered-after-submit')
  })
})
