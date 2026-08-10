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
    calculationRevisions: vi.fn(), payoutDecisions: vi.fn(), marginDecisions: vi.fn(), sources: vi.fn(), participants: vi.fn(), sourceRetentions: vi.fn(), participantScores: vi.fn(), upsertSourceRetention: vi.fn(), deactivateSourceRetention: vi.fn(), upsertParticipantScore: vi.fn(), createOrGet: vi.fn(), upsertSource: vi.fn(), upsertParticipant: vi.fn(), operations: vi.fn(), tabularImportExecutions: vi.fn(), importProfiles: vi.fn(), importReadiness: vi.fn(), importProfile: vi.fn(), createImportProfile: vi.fn(), validateProfileImport: vi.fn(), confirmProfileImport: vi.fn(), grantSensitiveAccess: vi.fn(), workspaceSensitiveAccessGrants: vi.fn(), grantWorkspaceSensitiveAccess: vi.fn(), revokeWorkspaceSensitiveAccess: vi.fn(),
  },
}))
const { workspaceServiceMock } = vi.hoisted(() => ({ workspaceServiceMock: { listMembers: vi.fn() } }))

vi.mock('@/services/FinancialClosingService', () => ({ default: serviceMock }))
vi.mock('@/services/WorkspaceService', () => ({ default: workspaceServiceMock }))

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
    serviceMock.importReadiness.mockResolvedValue({ data: { sources: [], readyToCalculate: false, blockingSourceKeys: [] } })
    serviceMock.workbookInventory.mockResolvedValue({ data: { sheets: [
      { sheetName: 'BP Paulista', classification: 'FINANCIAL_SOURCE_PROBABLE', suggestedSourceKey: 'BP_PAULISTA', nonEmptyDataRows: 2, detail: 'Estrutura tabular potencialmente importável.', recommendedProfileId: 'profile-1', recommendedProfileName: 'Repasse BP Paulista', selectionStatus: 'AUTO_SELECTED', headers: ['referencia', 'valor', 'data', 'executor'], mappingSuggestion: { itemKeyColumn: 'referencia', externalReferenceColumn: 'referencia', amountColumn: 'valor', occurredOnColumn: 'data', participantColumn: 'executor', identityCandidateColumns: ['referencia'], ambiguousFields: [] } },
      { sheetName: 'GERAL', classification: 'CONSOLIDATION', suggestedSourceKey: 'GERAL', nonEmptyDataRows: 2, detail: 'Consolidação externa.', selectionStatus: 'CONSOLIDATION' },
      { sheetName: 'FECHAMENTO', classification: 'CONSOLIDATION', suggestedSourceKey: 'FECHAMENTO', nonEmptyDataRows: 2, detail: 'Consolidação externa.', selectionStatus: 'CONSOLIDATION' },
    ] } })
    serviceMock.importProfile.mockResolvedValue({ data: { id: 'profile-1', profileKey: 'REPASSE_BP_PAULISTA', displayName: 'Repasse BP Paulista', sourceKey: 'BP_PAULISTA', version: 1, config: { format: 'CSV', itemKeyColumn: 'referencia', amountColumn: 'valor', occurredOnColumn: 'data', externalReferenceColumn: 'referencia', participantColumn: 'executor', participantMappings: { 'EXECUTOR A': 'participant-1' }, decimalSeparator: 'COMMA' } } })
    serviceMock.bankReconciliationSuggestions.mockResolvedValue({ data: {
      paymentExecutionId: 'payment-1', classification: 'EXACT', totalCount: 1, offset: 0, limit: 20,
      candidates: [{ candidateId: 'safe-candidate-1', amount: 100, transactionDate: '2026-08-10', direction: 'OUTFLOW', classification: 'EXACT', score: 100, reasons: ['AMOUNT_EXACT', 'REFERENCE_HMAC_MATCH'], maskedAccount: null, ruleVersion: 'BANK_RECONCILIATION_V19A_1', candidateFingerprint: 'opaque-fingerprint' }],
    } })
    serviceMock.bankReconciliationHistory.mockResolvedValue({ data: [] }); serviceMock.workspaceSensitiveAccessGrants.mockResolvedValue({ data: [] })
    workspaceServiceMock.listMembers.mockResolvedValue({ data: [] })
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
    ;(wrapper.vm as any).manualSetupOpen = true; (wrapper.vm as any).importStepOpen = true
    await flush()
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
    serviceMock.sources.mockResolvedValue({ data: [{ id: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Repasse BP Paulista' }] })
    serviceMock.importReadiness.mockResolvedValue({ data: { sources: [{ sourceId: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Repasse BP Paulista', status: 'IMPORTED', recommendedProfileId: 'profile-1', recommendedProfileName: 'Repasse BP Paulista', action: 'Importação confirmada', detail: 'Fonte pronta.' }], readyToCalculate: true, blockingSourceKeys: [] } })
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

    const recalculate = wrapper.findAll('button').find(button => button.text().includes('Recalcular'))
    expect(Boolean(recalculate)).toBe(expectedEnabled)
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

  it('keeps the detailed import hidden for members until a source is prepared', async () => {
    const wrapper = mount(FinancialClosingView, {
      global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } },
    })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Importar minha planilha mensal')
    expect(wrapper.text()).toContain('Ler abas da planilha')
    expect(wrapper.text()).not.toContain('Mapeamento explícito de colunas')
    expect(wrapper.text()).not.toContain('Confirmar lote normalizado')
  })

  it('shows source readiness, preselects its profile, and keeps calculation blocked while the import is pending', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.importReadiness.mockResolvedValue({ data: { sources: [{ sourceId: 'bp', sourceKey: 'BP_PAULISTA', displayName: 'Repasse BP Paulista', status: 'READY_TO_IMPORT', recommendedProfileId: 'profile-1', recommendedProfileName: 'Repasse BP Paulista', action: 'Importar', detail: 'Aguarda lote confirmado.' }], readyToCalculate: false, blockingSourceKeys: ['BP_PAULISTA'] } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}<slot name="actions" /></header>' }, AlertStrip: true } } })
    await flush(); await flush()
    expect((wrapper.vm as any).readinessBlocksCalculation).toBe(true)
    ;(wrapper.vm as any).selectSourceProfile('profile-1')
    await flush()
    expect((wrapper.vm as any).selectedProfileId).toBe('profile-1')
    expect(wrapper.text()).toContain('Fontes para importar')
    expect(wrapper.text()).toContain('Pronta para importar')
    expect(wrapper.text()).toContain('GERAL')
  })

  it('guides a workbook inventory without treating GERAL or FECHAMENTO as importable sources', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}<slot name="actions" /></header>' }, AlertStrip: true } } })
    await flush(); await flush()
    ;(wrapper.vm as any).workbookFile = new File(['synthetic'], 'monthly.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    ;(wrapper.vm as any).sensitiveAccessConfirmed = true
    await (wrapper.vm as any).inventoryWorkbook(); await flush()
    expect(serviceMock.workbookInventory).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.any(File), true)
    expect(wrapper.text()).toContain('Importar minha planilha mensal')
    expect(wrapper.text()).toContain('Perfil compatível encontrado')
    expect(wrapper.text()).toContain('GERAL')
    expect(wrapper.text()).toContain('FECHAMENTO')
    expect((wrapper.vm as any).isPermanentConsolidation((wrapper.vm as any).workbookInventory.sheets[1])).toBe(true)
    expect((wrapper.vm as any).workbookClassification((wrapper.vm as any).workbookInventory.sheets[2])).toBe('CONSOLIDATION')
    expect((wrapper.vm as any).selectedWorkbookSheets).toHaveLength(1)
    ;(wrapper.vm as any).removeWorkbookSelection((wrapper.vm as any).workbookInventory.sheets[0])
    expect((wrapper.vm as any).selectedWorkbookSheets).toHaveLength(0)
    expect(serviceMock.confirmProfileImport).not.toHaveBeenCalled()
    ;(wrapper.vm as any).prepareWorkbookSource((wrapper.vm as any).workbookInventory.sheets[0])
    expect((wrapper.vm as any).newSourceKey).toBe('BP_PAULISTA')
    expect((wrapper.vm as any).selectedProfileId).toBe('profile-1')
  })

  it('homologates a candidate structurally before saving a reusable source profile', async () => {
    useUserStore().tenantRole = 'ROLE_ADMIN'
    serviceMock.upsertSource.mockResolvedValue({ data: { id: 'source-1', sourceKey: 'SOURCE_ALPHA', displayName: 'Fonte Alpha' } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush()
    const sheet = { sheetName: 'Fonte Alpha', classification: 'FINANCIAL_SOURCE_PROBABLE', suggestedSourceKey: 'SOURCE_ALPHA', nonEmptyDataRows: 2, detail: 'Dados encontrados.', selectionStatus: 'REVIEW_REQUIRED', headers: ['item reference', 'amount', 'event date', 'responsible'], mappingSuggestion: { itemKeyColumn: 'item reference', externalReferenceColumn: 'item reference', amountColumn: 'amount', occurredOnColumn: 'event date', participantColumn: 'responsible', identityCandidateColumns: ['item reference'], ambiguousFields: [] } }
    ;(wrapper.vm as any).prepareWorkbookSource(sheet)
    expect((wrapper.vm as any).guidedSheet).toEqual(sheet)
    expect((wrapper.vm as any).guidedMapping.itemKeyColumn).toBe('item reference')
    ;(wrapper.vm as any).guidedItemKeyColumns = ['item reference', 'event date']
    ;(wrapper.vm as any).guidedMapping.externalReferenceColumn = ''
    ;(wrapper.vm as any).guidedMultiplicityPolicy = 'PRESERVE_LEGITIMATE_MULTIPLICITY'
    ;(wrapper.vm as any).guidedMultiplicityJustification = 'Ocorrências repetidas foram homologadas pela fonte.'
    await (wrapper.vm as any).saveGuidedSourceProfile(); await flush(); await flush()
    expect(serviceMock.upsertSource).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'SOURCE_ALPHA', 'Fonte Alpha')
    expect(serviceMock.createImportProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.objectContaining({ sourceKey: 'SOURCE_ALPHA', config: expect.objectContaining({ headerSignature: ['item reference', 'amount', 'event date', 'responsible'], itemKeyColumn: 'item reference', itemKeyColumns: ['item reference', 'event date'], externalReferenceColumn: '', amountColumn: 'amount', monetaryFormat: expect.objectContaining({ groupingSeparator: 'NONE', normalizeCommonSpaces: true }), multiplicityPolicy: 'PRESERVE_LEGITIMATE_MULTIPLICITY', multiplicityJustification: 'Ocorrências repetidas foram homologadas pela fonte.' }) }))
    expect((wrapper.vm as any).workbookSelected['Fonte Alpha']).toBe(true)
  })

  it('keeps owner-only sensitive access in the first guided step and reveals import only after preparation', async () => {
    useUserStore().tenantRole = 'ROLE_OWNER'
    useUserStore().user = { id: 'owner-1' }
    serviceMock.grantSensitiveAccess.mockResolvedValue({ data: { granted: true } })
    const wrapper = mount(FinancialClosingView, { global: { plugins: [vuetify], stubs: { PageHeader: { props: ['title'], template: '<header>{{ title }}</header>' }, AlertStrip: true } } })
    await flush(); await flush()
    expect(wrapper.text()).toContain('Habilitar leitura protegida')
    expect(wrapper.text()).not.toContain('Fonte tabular')
    expect(wrapper.text()).not.toContain('Configurar as fontes e participantes')
    ;(wrapper.vm as any).sensitiveAccessConfirmed = true
    await (wrapper.vm as any).enableOwnSensitiveAccess(); await flush()
    expect(serviceMock.grantSensitiveAccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), expect.anything(), true)
    expect((wrapper.vm as any).ownerSensitiveAccessEnabled).toBe(true)
    expect(wrapper.text()).toContain('Planilha mensal XLSX')
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
        { rowNumber: 3, code: 'AMOUNT_INCOMPATIBLE_FORMAT', message: 'Formato incompatível' },
        { rowNumber: 4, code: 'MISSING_DATE', message: 'Data obrigatória' },
      ],
    }
    await flush()
    expect(wrapper.text()).toContain('A fonte não fornece identidade única para estes itens')
    expect(wrapper.text()).toContain('Solicite o identificador externo ou uma regra de deduplicação formal aprovada')
    expect(wrapper.text()).toContain('Resolver participantes desconhecidos')
    expect(wrapper.text()).toContain('Valor incompatível com o formato homologado')
    expect(wrapper.text()).toContain('Data de competência ausente')
    expect(wrapper.text()).toContain('Nenhuma data será preenchida automaticamente')
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
    expect(wrapper.text()).not.toContain('Configure as fontes e participantes')
    ;(wrapper.vm as any).manualSetupOpen=true; await flush()
    ;(wrapper.vm as any).newSourceKey='CONSULTING'; (wrapper.vm as any).newSourceName='Consultoria'; await (wrapper.vm as any).addSource()
    expect(serviceMock.upsertSource).toHaveBeenCalledWith(expect.objectContaining({ id: 'closing-1' }), 'CONSULTING', 'Consultoria')
    expect(wrapper.text()).toContain('1. Configure as fontes e participantes')
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
