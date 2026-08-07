import axiosInterceptor from './axiosInterceptor'

export type ClosingWorkflowStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'CANCELLED'
export type ClosingSettlementStatus = 'NOT_ISSUED' | 'OPEN' | 'PARTIAL' | 'PAID' | 'RECONCILED'

export interface ClosingVersion {
  id: string
  versionNumber: number
  versionStatus: 'EDITABLE' | 'FROZEN'
  inputRevision: number
  calculatedRevision: number | null
  calculationCurrent: boolean
}

export interface FinancialClosing {
  id: string
  workspaceId: string
  closingKey: string
  periodMonth: number
  periodYear: number
  currency: string
  workflowStatus: ClosingWorkflowStatus
  settlementStatus: ClosingSettlementStatus
  currentVersion: ClosingVersion
}
export interface OperationalObligation { id: string; domain: 'PRODUCTIVITY' | 'MARGIN'; originType: string; principalAmount: number; cashPaidAmount: number; creditedAmount: number; openAmount: number; cashSettlementStatus: string; resolutionStatus: string }
export interface PaymentExecution { id: string; status: string; amount: number; unallocatedAmount: number }
export interface BankReconciliationCandidate { candidateId: string; amount: number; transactionDate: string; direction: string; classification: 'EXACT' | 'LIKELY' | 'AMBIGUOUS'; score: number; reasons: string[]; maskedAccount?: string | null; ruleVersion: string; candidateFingerprint: string }
export interface BankReconciliationSuggestionPage { paymentExecutionId: string; classification: 'EXACT' | 'LIKELY' | 'AMBIGUOUS' | 'NO_MATCH'; totalCount: number; offset: number; limit: number; candidates: BankReconciliationCandidate[] }
export interface BankReconciliation { id: string; status: 'CONFIRMED' | 'REJECTED'; paymentExecutionId: string; financialTransactionId: string; classification: string; score: number; reasons: string[]; rejectionReasonCode?: string | null; decidedAt: string }
export interface FinancialCorrection { id: string; status: string; revision: number; type: string; amount: number; originalAllocationId?: string | null; reversalFinancialTransactionId?: string | null; rejectionReasonCode?: string | null }
export interface SettlementReversal { id: string; correctionCaseId: string; amount: number; currency: string; reasonCode: string; approvedAt: string }
export interface CalculationRevision { calculationRunId: string; inputRevision: number; runStatus: string; grossAmount: number; deductionAmount: number; productivityAmount: number; undistributedPoolAmount: number; netRevenueAmount: number; residualAmount: number; reconciliationDivergence: number; calculatedAt: string }
export interface PayoutDecision { id: string; status: string; revision: number; closingVersionId: string; calculationRunId: string; inputRevision: number; productivityAmount: number; valueReceivableAmount?: number; lines: Array<{ id: string; participantId: string; amount: number; dueDate?: string }>; issuedObligationCount: number; ownerSelfApprovalException: boolean }
export interface MarginDecision { id: string; status: string; settlementStatus: string; revision: number; poolKey: string; marginSnapshot: number; allocatedAmount: number; unallocatedMargin: number; allocations: Array<{ id: string; type: string; amount: number; purpose: string; dueDate?: string; categoryKey?: string; beneficiaryDisplayName?: string; issuedObligationCount: number }>; issuedObligationCount: number; ownerSelfApprovalException: boolean }
export interface TabularImportMapping {
  itemKeyColumn: string; sourceIdColumn: string; amountColumn: string; occurredOnColumn: string
  attributionMethodColumn?: string; participantIdColumn?: string; participantLabelColumn?: string
  poolKeyColumn?: string; directionColumn?: string; financialLabelColumn?: string; externalReferenceColumn?: string
  defaultAttributionMethod?: string; defaultPoolKey?: string; decimalSeparator: 'DOT' | 'COMMA'
}
export interface TabularImportIssue { rowNumber: number; column?: string | null; code: string; message: string }
export interface TabularImportValidation { valid: boolean; rowCount: number; ignoredRowCount: number; additionTotal: number; reversalTotal: number; issues: TabularImportIssue[]; ignoredRows?: Array<{ rowNumber: number; code: string; message: string }>; previewRows: Array<{ rowNumber: number; clientItemKey: string; amount: number; occurredOn?: string; sourceId?: string; attributionMethod?: string }>; detailedPreview: boolean }
export interface TabularImport { id: string; batchId: string; batchKey: string; rowCount: number; additionTotal: number; reversalTotal: number; replayed: boolean }
export interface AssistedImportProfile { id: string; profileKey: string; displayName: string; sourceKey: string; version: number; format: 'CSV' | 'XLSX'; expectedSheet?: string | null }
export interface AssistedImportProfileConfig { format: 'CSV' | 'XLSX'; expectedSheet?: string | null; itemKeyColumn: string; amountColumn: string; occurredOnColumn: string; externalReferenceColumn: string; participantColumn?: string | null; participantMappings: Record<string, string>; positiveDirection?: string | null; negativeAsReversal?: boolean | null; ignoreTotalsAndFormulas?: boolean | null; defaultAttributionMethod?: string | null; defaultPoolKey?: string | null; decimalSeparator: 'DOT' | 'COMMA' }
export interface AssistedImportProfileDetail extends Omit<AssistedImportProfile, 'format' | 'expectedSheet'> { config: AssistedImportProfileConfig }
export interface TabularImportExecution { id: string; versionNumber: number; format: string; status: 'CONFIRMED' | 'REJECTED'; acceptedRows: number; rejectedRows: number; additionTotal: number; reversalTotal: number; actorUserId: string; occurredAt: string; issueCounts: Record<string, number> }
export interface TabularImportExecutionPage { items: TabularImportExecution[]; total: number; limit: number; offset: number }
export interface TabularImportIssuePage { total: number; issueCounts: Record<string, number>; items: TabularImportIssue[]; detailed: boolean }
export interface ClosingTimelineEvent { type: string; title: string; description: string; status: string; occurredAt: string; actorUserId: string }
export interface ClosingOperations { timeline: ClosingTimelineEvent[]; pendingActions: Array<{ code: string; label: string; requiredRole: string; status: string }> }

export interface ClosingSource { id: string; sourceKey: string; displayName: string }
export interface ClosingParticipant { id: string; participantKey: string; displayName: string; linkedUserId?: string; active: boolean }
export interface SourceRetention { id: string; sourceKey: string; displayName: string; percentage: number; active: boolean; justification: string; createdAt: string }
export interface ParticipantScore { id: string; participantId: string; score: number; active: boolean; justification: string; createdAt: string }
export interface SourceProductivity { sourceId: string; sourceKey: string; displayName: string; grossAmount: number; reversalAmount: number; retentionAmount: number; eligibleAmount: number }
export interface ParticipantPayout { participantId: string; productivityAmount: number; reserveAmount: number; monthlyCeilingAmount: number; score?: number | null; appliedScore: number; valueReceivableAmount: number; annualBonusEligibleScore: number; undistributedAmount: number; tmReserveAmount: number; tiReserveAmount: number; totalExplainedAmount: number }
export interface ReconciliationSummary {
  expectedInflowAmount: number
  reconciledInflowAmount: number
  coveragePercentage: number
  divergenceAmount: number
  unreconciledItemCount: number
}
export interface ClosingSummary {
  calculationRunId: string
  versionNumber: number
  inputRevision: number
  calculationPolicyVersion: string
  roundingMode: string
  intermediateScale: number
  grossAmount: number
  reversalAmount: number
  deductionAmount: number
  closingAdjustmentAmount: number
  productivityAmount: number
  undistributedPoolAmount: number
  netRevenueAmount: number
  residualAmount: number
  reconciliation: ReconciliationSummary
  calculatedAt: string
  sourceProductivity: SourceProductivity[]
  participantPayouts?: ParticipantPayout[]
}
export interface MatrixRow { participant: ClosingParticipant; values: Record<string, number>; total: number }
export interface ClosingMatrix { sources: ClosingSource[]; rows: MatrixRow[]; sourceTotals: Record<string, number>; productivityTotal: number }
export interface DrillDownItem {
  itemId: string; clientItemKey: string; occurredOn?: string; financialLabel?: string
  signedGrossAmount: number; deductionAmount: number; adjustmentAmount: number; netAmount: number
}
export interface DrillDown {
  participantId: string; sourceId: string; grossAmount: number; deductionAmount: number
  adjustmentAmount: number; netAmount: number; items: DrillDownItem[]
}
export interface CalculationMemory {
  calculationRunId: string; calculationPolicyVersion: string; roundingMode: string; intermediateScale: number
  items: Array<{ itemId: string; clientItemKey: string; memory: string }>
  participantAdjustments: Array<{ participantId: string; sourceId: string; direction: string; amount: number; justification: string }>
  participantScores: ParticipantScore[]
  residualAmount: number
  participantPayouts?: ParticipantPayout[]
}

const versionPath = (closing: FinancialClosing) => `/financial-closings/${closing.id}/versions/${closing.currentVersion.versionNumber}`

export default {
  list() { return axiosInterceptor.get<FinancialClosing[]>('/financial-closings') },
  createOrGet(periodMonth: number, periodYear: number, closingKey = 'DEFAULT', currency = 'BRL') {
    return axiosInterceptor.post<FinancialClosing>('/financial-closings', { periodMonth, periodYear, closingKey, currency })
  },
  sources(closing: FinancialClosing) { return axiosInterceptor.get<ClosingSource[]>(`${versionPath(closing)}/sources`) },
  upsertSource(closing: FinancialClosing, sourceKey: string, displayName: string) { return axiosInterceptor.post<ClosingSource>(`${versionPath(closing)}/sources`, { sourceKey, displayName }) },
  participants(closing: FinancialClosing) { return axiosInterceptor.get<ClosingParticipant[]>(`${versionPath(closing)}/participants`) },
  upsertParticipant(closing: FinancialClosing, participantKey: string, displayName: string) { return axiosInterceptor.post<ClosingParticipant>(`${versionPath(closing)}/participants`, { participantKey, displayName, active: true }) },
  sourceRetentions(closing: FinancialClosing) { return axiosInterceptor.get<SourceRetention[]>(`${versionPath(closing)}/source-retentions`) },
  upsertSourceRetention(closing: FinancialClosing, payload: { sourceKey: string; displayName: string; percentage: number; justification: string }) { return axiosInterceptor.post<SourceRetention>(`${versionPath(closing)}/source-retentions`, payload) },
  deactivateSourceRetention(closing: FinancialClosing, id: string, justification: string) { return axiosInterceptor.post(`${versionPath(closing)}/source-retentions/${id}/deactivate`, { justification }) },
  participantScores(closing: FinancialClosing) { return axiosInterceptor.get<ParticipantScore[]>(`${versionPath(closing)}/participant-scores`) },
  upsertParticipantScore(closing: FinancialClosing, payload: { participantId: string; score: number; justification: string }) { return axiosInterceptor.post<ParticipantScore>(`${versionPath(closing)}/participant-scores`, payload) },
  summary(closing: FinancialClosing) { return axiosInterceptor.get<ClosingSummary>(`${versionPath(closing)}/summary`) },
  matrix(closing: FinancialClosing) { return axiosInterceptor.get<ClosingMatrix>(`${versionPath(closing)}/matrix`) },
  memory(closing: FinancialClosing) { return axiosInterceptor.get<CalculationMemory>(`${versionPath(closing)}/calculation-memory`) },
  drillDown(closing: FinancialClosing, participantId: string, sourceId: string) {
    return axiosInterceptor.get<DrillDown>(`${versionPath(closing)}/drill-down`, { params: { participantId, sourceId } })
  },
  calculate(closing: FinancialClosing) { return axiosInterceptor.post<ClosingSummary>(`${versionPath(closing)}/calculate`) },
  calculationRevisions(closing: FinancialClosing) { return axiosInterceptor.get<CalculationRevision[]>(`${versionPath(closing)}/calculation-revisions`) },
  payoutDecisions(closing: FinancialClosing) { return axiosInterceptor.get<PayoutDecision[]>(`/financial-closings/${closing.id}/payout-decisions`) },
  createPayoutDecision(closing: FinancialClosing, defaultDueDate?: string) { return axiosInterceptor.post<PayoutDecision>(`/financial-closings/${closing.id}/payout-decisions`, { versionNumber: closing.currentVersion.versionNumber, defaultDueDate }) },
  submitPayoutDecision(closing: FinancialClosing, id: string, expectedRevision: number) { return axiosInterceptor.post<PayoutDecision>(`/financial-closings/${closing.id}/payout-decisions/${id}/submit`, { expectedRevision }) },
  approvePayoutDecision(closing: FinancialClosing, id: string, expectedRevision: number, justification: string) { return axiosInterceptor.post<PayoutDecision>(`/financial-closings/${closing.id}/payout-decisions/${id}/approve`, { expectedRevision, justification, idempotencyKey: crypto.randomUUID() }) },
  marginDecisions(closing: FinancialClosing) { return axiosInterceptor.get<MarginDecision[]>(`/financial-closings/${closing.id}/margin-decisions`) },
  createMarginDecision(closing: FinancialClosing, payload: { poolKey: string; allocations: unknown[] }) { return axiosInterceptor.post<MarginDecision>(`/financial-closings/${closing.id}/margin-decisions`, { versionNumber: closing.currentVersion.versionNumber, ...payload }) },
  submitMarginDecision(closing: FinancialClosing, id: string, expectedRevision: number) { return axiosInterceptor.post<MarginDecision>(`/financial-closings/${closing.id}/margin-decisions/${id}/submit`, { expectedRevision }) },
  approveMarginDecision(closing: FinancialClosing, id: string, expectedRevision: number, justification: string) { return axiosInterceptor.post<MarginDecision>(`/financial-closings/${closing.id}/margin-decisions/${id}/approve`, { expectedRevision, justification, idempotencyKey: crypto.randomUUID() }) },
  validateTabularImport(closing: FinancialClosing, file: File, mapping: TabularImportMapping) {
    const body = new FormData(); body.append('file', file); body.append('mapping', JSON.stringify(mapping))
    return axiosInterceptor.post<TabularImportValidation>(`${versionPath(closing)}/tabular-imports/validate`, body)
  },
  confirmTabularImport(closing: FinancialClosing, file: File, batchKey: string, mapping: TabularImportMapping) {
    const body = new FormData(); body.append('file', file); body.append('batchKey', batchKey); body.append('mapping', JSON.stringify(mapping))
    return axiosInterceptor.post<TabularImport>(`${versionPath(closing)}/tabular-imports`, body)
  },
  importProfiles(closing: FinancialClosing) { return axiosInterceptor.get<AssistedImportProfile[]>(`${versionPath(closing)}/import-profiles`) },
  importProfile(closing: FinancialClosing, profileId: string) { return axiosInterceptor.get<AssistedImportProfileDetail>(`${versionPath(closing)}/import-profiles/${profileId}`) },
  createImportProfile(closing: FinancialClosing, payload: { profileKey: string; displayName: string; sourceKey: string; config: unknown }) { return axiosInterceptor.post<AssistedImportProfile>(`${versionPath(closing)}/import-profiles`, payload) },
  confirmProfileImport(closing: FinancialClosing, file: File, batchKey: string, profileId: string) { const body=new FormData(); body.append('file',file);body.append('batchKey',batchKey);body.append('profileId',profileId);return axiosInterceptor.post<TabularImport>(`${versionPath(closing)}/tabular-imports/profile`,body) },
  validateProfileImport(closing: FinancialClosing, file: File, profileId: string) { const body=new FormData(); body.append('file',file);body.append('profileId',profileId);return axiosInterceptor.post<TabularImportValidation>(`${versionPath(closing)}/tabular-imports/profile/validate`,body) },
  tabularImportExecutions(closing: FinancialClosing, limit = 25, offset = 0) { return axiosInterceptor.get<TabularImportExecutionPage>(`/financial-closings/${closing.id}/tabular-imports`, { params: { limit, offset } }) },
  tabularImportIssues(closing: FinancialClosing, executionId: string) { return axiosInterceptor.get<TabularImportIssuePage>(`/financial-closings/${closing.id}/tabular-imports/${executionId}/issues`) },
  operations(closing: FinancialClosing) { return axiosInterceptor.get<ClosingOperations>(`/financial-closings/${closing.id}/operations`) },
  obligations() { return axiosInterceptor.get<OperationalObligation[]>('/financial-closings/obligations') },
  recordPayment(payload: { direction: string; currency: string; amount: number; externalReference?: string; idempotencyKey: string; executedAt?: string }) { return axiosInterceptor.post<PaymentExecution>('/financial-closings/payment-executions', payload) },
  confirmPayment(id: string, payload: { justification: string; evidenceReference: string; idempotencyKey: string }) { return axiosInterceptor.post<PaymentExecution>(`/financial-closings/payment-executions/${id}/confirm`, payload) },
  voidPayment(id: string, reason: string) { return axiosInterceptor.post<PaymentExecution>(`/financial-closings/payment-executions/${id}/void`, { reason }) },
  bankReconciliationSuggestions(id: string, limit = 20, offset = 0) { return axiosInterceptor.get<BankReconciliationSuggestionPage>(`/financial-closings/payment-executions/${id}/bank-reconciliation-suggestions`, { params: { limit, offset } }) },
  confirmBankReconciliation(paymentExecutionId: string, payload: { financialTransactionId: string; expectedCandidateFingerprint: string }, idempotencyKey: string) { return axiosInterceptor.post<BankReconciliation>(`/financial-closings/payment-executions/${paymentExecutionId}/bank-reconciliations/confirm`, payload, { headers: { 'Idempotency-Key': idempotencyKey } }) },
  rejectBankReconciliation(paymentExecutionId: string, payload: { financialTransactionId: string; expectedCandidateFingerprint: string; reasonCode: string }, idempotencyKey: string) { return axiosInterceptor.post<BankReconciliation>(`/financial-closings/payment-executions/${paymentExecutionId}/bank-reconciliations/reject`, payload, { headers: { 'Idempotency-Key': idempotencyKey } }) },
  bankReconciliationHistory(paymentExecutionId: string) { return axiosInterceptor.get<BankReconciliation[]>(`/financial-closings/payment-executions/${paymentExecutionId}/bank-reconciliations`) },
  createCorrection(payload: { type: string; originalObligationId: string; amount: number; originalAllocationId?: string; reversalFinancialTransactionId?: string; reasonCode?: string }) { return axiosInterceptor.post<FinancialCorrection>('/financial-closings/financial-corrections', payload) },
  submitCorrection(id: string, expectedRevision: number) { return axiosInterceptor.post<FinancialCorrection>(`/financial-closings/financial-corrections/${id}/submit`, { expectedRevision }) },
  approveCorrection(id: string, expectedRevision: number) { return axiosInterceptor.post<FinancialCorrection>(`/financial-closings/financial-corrections/${id}/approve`, { expectedRevision, idempotencyKey: crypto.randomUUID() }) },
  rejectCorrection(id: string, expectedRevision: number, reasonCode: string) { return axiosInterceptor.post<FinancialCorrection>(`/financial-closings/financial-corrections/${id}/reject`, { expectedRevision, reasonCode }) },
  settlementReversal(id: string) { return axiosInterceptor.get<SettlementReversal>(`/financial-closings/financial-corrections/${id}/settlement-reversal`) },
  grantSensitiveAccess(closing: FinancialClosing, userId: string, confirmed: boolean) { return axiosInterceptor.put(`/financial-closings/${closing.id}/sensitive-access-grants`, { userId, confirmed }) },
}
