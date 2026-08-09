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
    obligations: vi.fn(), bankReconciliationSuggestions: vi.fn(), bankReconciliationHistory: vi.fn(), confirmBankReconciliation: vi.fn(), rejectBankReconciliation: vi.fn(), workbookInventory: vi.fn(),
    calculationRevisions: vi.fn(), payoutDecisions: vi.fn(), marginDecisions: vi.fn(), sources: vi.fn(), participants: vi.fn(), sourceRetentions: vi.fn(), participantScores: vi.fn(), upsertSourceRetention: vi.fn(), deactivateSourceRetention: vi.fn(), upsertParticipantScore: vi.fn(), createOrGet: vi.fn(), upsertSource: vi.fn(), upsertParticipant: vi.fn(), operations: vi.fn(), tabularImportExecutions: vi.fn(), importProfiles: vi.fn(), importReadiness: vi.fn(), importProfile: vi.fn(), createImportProfile: vi.fn(), validateProfileImport: vi.fn(), confirmProfileImport: vi.fn(), grantSensitiveAccess: vi.fn(),
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
      sourceProductivity: [{ sourceId: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Convênio BP Paulista', grossAmount: 70000, reversalAmount: 20, retentionAmount: 7000, eligibleAmount: 62980 }],
      participantPayouts: [{ participantId: 'elimar', productivityAmount: 100, reserveAmount: 15, monthlyCeilingAmount: 85, score: 85, appliedScore: 85, valueReceivableAmount: 85, annualBonusEligibleScore: 0, undistributedAmount: 0, tmReserveAmount: 10, tiReserveAmount: 5, totalExplainedAmount: 100 }],
    } })
    serviceMock.matrix.mockResolvedValue({ data: {
      sources: [{ id: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Convênio BP Paulista' }, { id: 'consult', sourceKey: 'CONSULTORIA', displayName: 'Consultoria' }],
      rows: [{ participant: { id: 'elimar', participantKey: 'ELIMAR', displayName: 'Elimar Elias Gomes', active: true }, values: { bp: 4731.71, consult: 5913.80 }, total: 10645.51 }],
      sourceTotals: { bp: 69979.18, consult: 5913.80 }, productivityTotal: 81581.90,
    } })
    serviceMock.obligations.mockResolvedValue({ data: [] })
    serviceMock.calculationRevisions.mockResolvedValue({ data: [{ calculationRunId: 'run-3', inputRevision: 3, runStatus: 'CURRENT', grossAmount: 92000, deductionAmount: 1758.35, productivityAmount: 81581.90, undistributedPoolAmount: 8659.75, netRevenueAmount: 90241.65, residualAmount: 0, reconciliationDivergence: 0, calculatedAt: '2026-08-03T12:00:00Z' }] })
    serviceMock.payoutDecisions.mockResolvedValue({ data: [] }); serviceMock.marginDecisions.mockResolvedValue({ data: [] })
    serviceMock.sources.mockResolvedValue({ data: [] }); serviceMock.participants.mockResolvedValue({ data: [] }); serviceMock.sourceRetentions.mockResolvedValue({ data: [] }); serviceMock.participantScores.mockResolvedValue({ data: [] }); serviceMock.operations.mockResolvedValue({ data: { timeline: [], pendingActions: [] } }); serviceMock.tabularImportExecutions.mockResolvedValue({ data: { items: [], total: 0, limit: 25, offset: 0 } })
    serviceMock.importProfiles.mockResolvedValue({ data: [] }); serviceMock.createImportProfile.mockResolvedValue({ data: { id: 'profile-1', profileKey: 'REPASSE_BP_PAULISTA', displayName: 'Repasse BP Paulista', sourceKey: 'BP_PAULISTA', version: 1, format: 'CSV' } })
    serviceMock.importReadiness.mockResolvedValue({ data: { sources: [], readyToCalculate: true, blockingSourceKeys: [] } })
    serviceMock.workbookInventory.mockResolvedValue({ data: { sheets: [
      { sheetName: 'BP Paulista', classification: 'FINANCIAL_SOURCE_PROBABLE', suggestedSourceKey: 'BP_PAULISTA', nonEmptyDataRows: 2, detail: 'Estrutura tabular potencialmente importável.', recommendedProfileId: 'profile-1', recommendedProfileName: 'Repasse BP Paulista' },
      { sheetName: 'GERAL', classification: 'CONSOLIDATION', suggestedSourceKey: 'GERAL', nonEmptyDataRows: 2, detail: 'Consolidação externa.' },
      { sheetName: 'FECHAMENTO', classification: 'CONSOLIDATION', suggestedSourceKey: 'FECHAMENTO', nonEmptyDataRows: 2, detail: 'Consolidação externa.' },
    ] } })
    serviceMock.importProfile.mockResolvedValue({ data: { id: 'profile-1', profileKey: 'REPASSE_BP_PAULISTA', displayName: 'Repasse BP Paulista', sourceKey: 'BP_PAULISTA', version: 1, config: { format: 'CSV', itemKeyColumn: 'referencia', amountColumn: 'valor', occurredOnColumn: 'data', externalReferenceColumn: 'referencia', participantColumn: 'executor', participantMappings: { 'EXECUTOR A': 'participant-1' }, decimalSeparator: 'COMMA' } } })
    serviceMock.bankReconciliationSuggestions.mockResolvedValue({ data: {
      paymentExecutionId: 'payment-1', classification: 'EXACT', totalCount: 1, offset: 0, limit: 20,
      candidates: [{ candidateId: 'safe-candidate-1', amount: 100, transactionDate: '2026-08-10', direction: 'OUTFLOW', classification: 'EXACT', score: 100, reasons: ['AMOUNT_EXACT', 'REFERENCE_HMAC_MATCH'], maskedAccount: null, ruleVersion: 'BANK_RECONCILIATION_V19A_1', candidateFingerprint: 'opaque-fingerprint' }],
    } })
    serviceMock.bankReconciliationHistory.mockResolvedValue({ data: [] })
    serviceMock.drillDown.mockResolvedValue({ data: { participantId: 'elimar', sourceId: 'consult', grossAmount: 7068, deductionAmount: 1154.20, adjustmentAmount: 0, netAmount: 5913.80, items: [{ itemId: 'i1', clientItemKey: 'consultoria-elimar', financialLabel: 'Consultoria', signedGrossAmount: 7068, deductionAmount: 1154.20, adjustmentAmount: 0, netAmount: 5913.80 }] } })
  })

  it('renders the July totals, shows source eligibility, and exposes cell drill-down', async () => {
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
    expect(wrapper.text()).toContain('Pool não distribuído')
    expect(wrapper.text()).toContain('R$ 8.659,75')
    expect(wrapper.text()).toContain('R$ 90.241,65')
    expect(wrapper.text()).toContain('Produtividade Líquida elegível')
    expect(wrapper.text()).toContain('Valor a Receber por participante')
    expect(wrapper.text()).toContain('85%')
    expect(wrapper.find('table').text()).not.toContain('8.659,75')

    const consultCell = wrapper.findAll('.cell-button').find(button => button.text().includes('5.913,80'))
    expect(consultCell).toBeTruthy()
    await consultCell!.trigger('click'); await flush()
    expect(serviceMock.drillDown).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'elimar', 'consult')
    expect(wrapper.text()).toContain('Elimar Elias Gomes · Consultoria')
    expect(wrapper.text()).toContain('Bruto R$ 7.068,00')
  })

  it('lets a member configure a source retention and an auditable score while the closing is editable', async () => {
    serviceMock.sources.mockResolvedValue({ data: [{ id: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Convênio BP Paulista' }] })
    serviceMock.participants.mockResolvedValue({ data: [{ id: 'ana', participantKey: 'ANA', displayName: 'Ana Demo', active: true }] })
    serviceMock.upsertSourceRetention.mockResolvedValue({ data: { id: 'retention-1' } })
    serviceMock.upsertParticipantScore.mockResolvedValue({ data: { id: 'score-1' } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush(); await (wrapper.vm as any).loadSetup()
    ;(wrapper.vm as any).retentionSourceKey='BP_PAULISTA'; (wrapper.vm as any).retentionName='Fundo'; (wrapper.vm as any).retentionPercentage=10; (wrapper.vm as any).retentionJustification='Política vigente'
    await (wrapper.vm as any).saveRetention()
    expect(serviceMock.upsertSourceRetention).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.objectContaining({ sourceKey: 'BP_PAULISTA', percentage: 10 }))
    ;(wrapper.vm as any).scoreParticipantId='ana'; (wrapper.vm as any).scoreValue=85; (wrapper.vm as any).scoreJustification='Pontuação validada'
    await (wrapper.vm as any).saveScore()
    expect(serviceMock.upsertParticipantScore).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.objectContaining({ participantId: 'ana', score: 85 }))
    expect(wrapper.text()).toContain('Deduções por fonte e pontuação')
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

  it('renders safe, read-only bank suggestions without sensitive fields', async () => {
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

    ;(wrapper.vm as any).suggestionPaymentId = 'payment-1'
    await (wrapper.vm as any).loadBankSuggestions()
    await flush()

    expect(serviceMock.bankReconciliationSuggestions).toHaveBeenCalledWith('payment-1')
    expect(wrapper.text()).toContain('Conciliação bancária assistida')
    expect(wrapper.text()).toContain('Correspondência exata')
    expect(wrapper.text()).toContain('valor exato')
    expect(wrapper.text()).toContain('Não executa operação bancária nem altera saldos')
    expect(wrapper.text()).not.toContain('Confirmar conciliação')
  })

  it('keeps reconciliation actions hidden from members', async () => {
    const wrapper = mount(FinancialClosingView, {
      global: {
        plugins: [vuetify],
        stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true },
      },
    })
    await flush(); await flush()
    ;(wrapper.vm as any).suggestionPaymentId = 'payment-1'
    await (wrapper.vm as any).loadBankSuggestions()
    await flush()
    expect(wrapper.text()).not.toContain('Confirmar rejeição')
    expect(wrapper.text()).not.toContain('Confirmar')
  })

  it('shows the generic import entry point to members but keeps confirmation restricted', async () => {
    const wrapper = mount(FinancialClosingView, {
      global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } },
    })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Importar planilha')
    expect(wrapper.text()).toContain('Mapeamento explícito de colunas')
    expect(wrapper.text()).toContain('confirmação é restrita a ADMIN/OWNER')
    expect(wrapper.text()).not.toContain('Confirmar lote normalizado')
  })

  it('shows source readiness, preselects its profile, and keeps calculation blocked while the import is pending', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.importReadiness.mockResolvedValue({ data: { sources: [{ sourceId: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Repasse BP Paulista', status: 'READY_TO_IMPORT', recommendedProfileId: 'profile-1', recommendedProfileName: 'Repasse BP Paulista', action: 'Importar', detail: 'Aguarda lote confirmado.' }], readyToCalculate: false, blockingSourceKeys: ['BP_PAULISTA'] } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}<slot name="actions" /></header>' }, AlertStrip: true } } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Fontes para importar')
    expect(wrapper.text()).toContain('Pronta para importar')
    expect(wrapper.text()).toContain('GERAL')
    expect((wrapper.vm as any).readinessBlocksCalculation).toBe(true)
    ;(wrapper.vm as any).selectSourceProfile('profile-1')
    await flush()
    expect((wrapper.vm as any).selectedProfileId).toBe('profile-1')
  })

  it('guides a workbook inventory without treating GERAL or FECHAMENTO as importable sources', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}<slot name="actions" /></header>' }, AlertStrip: true } } })
    await flush(); await flush()
    ;(wrapper.vm as any).workbookFile = new File(['synthetic'], 'monthly.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    await (wrapper.vm as any).inventoryWorkbook(); await flush()
    expect(serviceMock.workbookInventory).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.any(File))
    expect(wrapper.text()).toContain('Importar minha planilha mensal')
    expect(wrapper.text()).toContain('Perfil recomendado: Repasse BP Paulista')
    expect(wrapper.text()).toContain('GERAL')
    expect(wrapper.text()).toContain('FECHAMENTO')
    expect((wrapper.vm as any).isPermanentConsolidation((wrapper.vm as any).workbookInventory.sheets[1])).toBe(true)
    expect((wrapper.vm as any).workbookClassification((wrapper.vm as any).workbookInventory.sheets[2])).toBe('CONSOLIDATION')
    ;(wrapper.vm as any).prepareWorkbookSource((wrapper.vm as any).workbookInventory.sheets[0])
    expect((wrapper.vm as any).newSourceKey).toBe('BP_PAULISTA')
    expect((wrapper.vm as any).selectedProfileId).toBe('profile-1')
  })

  it('turns unresolved participants and ambiguous identity into actionable blocks without an override', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.participants.mockResolvedValue({ data: [{ id: 'participant-1', participantKey: 'ANA', displayName: 'Ana Demo', active: true }] })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush(); await (wrapper.vm as any).loadSetup()
    ;(wrapper.vm as any).tabularValidation = {
      valid: false, rowCount: 1, ignoredRowCount: 0, reversalRowCount: 0, additionTotal: 100, reversalTotal: 0,
      detailedPreview: true, previewRows: [], ignoredRows: [], unmappedParticipantLabels: ['DANIEL_DEMO'],
      issues: [
        { rowNumber: 2, code: 'INVALID_CLIENT_ITEM_KEY', message: 'Identidade ambígua' },
        { rowNumber: 2, code: 'UNMAPPED_PARTICIPANT', message: 'Participante sem mapa' },
      ],
    }
    await flush()
    expect(wrapper.text()).toContain('A fonte não fornece identidade única para estes itens')
    expect(wrapper.text()).toContain('Solicite o identificador externo ou uma regra de deduplicação formal aprovada')
    expect(wrapper.text()).toContain('Resolver participantes desconhecidos')
    expect(wrapper.text()).toContain('DANIEL_DEMO')
    expect(wrapper.text()).not.toContain('Forçar importação')
    const confirmProfile = wrapper.findAll('button').find(button => button.text().includes('Confirmar com perfil'))
    expect(confirmProfile?.attributes('disabled')).toBeDefined()
  })

  it('lets an administrator start the first closing and configure canonical inputs without API manual work', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.list.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [closing] })
    serviceMock.createOrGet.mockResolvedValue({ data: closing })
    serviceMock.upsertSource.mockResolvedValue({ data: { id: 'source-1', sourceKey: 'CONSULTING', displayName: 'Consultoria' } })
    serviceMock.upsertParticipant.mockResolvedValue({ data: { id: 'participant-1', participantKey: 'ANA', displayName: 'Ana', active: true } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Iniciar apuração')
    expect(wrapper.text()).toContain('Escopo DEFAULT')
    await (wrapper.vm as any).createClosing(); await flush()
    expect(serviceMock.createOrGet).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 'DEFAULT', 'BRL')
    ;(wrapper.vm as any).newSourceKey='CONSULTING'; (wrapper.vm as any).newSourceName='Consultoria'; await (wrapper.vm as any).addSource()
    expect(serviceMock.upsertSource).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'CONSULTING', 'Consultoria')
    expect(wrapper.text()).toContain('Abas de consolidação')
  })

  it('saves an assisted profile using the stable source key and explicit participant mapping', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.sources.mockResolvedValue({ data: [{ id: 'source-1', sourceKey: 'BP_PAULISTA', displayName: 'Repasse BP Paulista' }] })
    serviceMock.participants.mockResolvedValue({ data: [{ id: 'participant-1', participantKey: 'ANA', displayName: 'Ana', active: true }] })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush(); await (wrapper.vm as any).loadSetup()
    ;(wrapper.vm as any).profileKey = 'REPASSE_BP_PAULISTA'; (wrapper.vm as any).profileName = 'Repasse BP Paulista'; (wrapper.vm as any).profileSourceKey = 'BP_PAULISTA'
    ;(wrapper.vm as any).profileItemKeyColumns = 'atendimento | codigo | subject'
    ;(wrapper.vm as any).profileParticipantExternal = 'Executor A'; (wrapper.vm as any).profileParticipantId = 'participant-1'; (wrapper.vm as any).addProfileParticipantMapping()
    await (wrapper.vm as any).createImportProfile()
    expect(serviceMock.createImportProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.objectContaining({
      sourceKey: 'BP_PAULISTA', config: expect.objectContaining({ itemKeyColumns: ['atendimento', 'codigo', 'subject'], participantMappings: { 'EXECUTOR A': 'participant-1' } }),
    }))
    expect(wrapper.text()).toContain('chave da fonte')
    ;(wrapper.vm as any).selectedProfileId = 'profile-1'; await (wrapper.vm as any).loadSelectedProfile()
    expect(serviceMock.importProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'profile-1')
    expect((wrapper.vm as any).profileParticipantMappings).toEqual({ 'EXECUTOR A': 'participant-1' })
  })

  it('loads decision workflow and safe calculation revision comparison on demand', async () => {
    const wrapper = mount(FinancialClosingView, {
      global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } },
    })
    await flush(); await flush()
    await (wrapper.vm as any).loadDecisionData(); await flush()
    expect(serviceMock.calculationRevisions).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }))
    expect(wrapper.text()).toContain('Decisão colaborativa')
    expect(wrapper.text()).toContain('Comparar revisões de cálculo')
    expect(wrapper.text()).toContain('81.581,90')
  })

  it('shows confirmation and typed rejection only to administrators', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    const wrapper = mount(FinancialClosingView, {
      global: {
        plugins: [vuetify],
        stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true },
      },
    })
    await flush(); await flush()
    ;(wrapper.vm as any).suggestionPaymentId = 'payment-1'
    await (wrapper.vm as any).loadBankSuggestions()
    await flush()
    expect(wrapper.text()).toContain('Confirmar')
    expect(wrapper.text()).toContain('Rejeitar')
    await (wrapper.vm as any).confirmBankSuggestion((wrapper.vm as any).bankSuggestions.candidates[0])
    expect(serviceMock.confirmBankReconciliation).toHaveBeenCalledWith('payment-1', {
      financialTransactionId: 'safe-candidate-1', expectedCandidateFingerprint: 'opaque-fingerprint',
    }, expect.any(String))
  })
})
