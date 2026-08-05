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
export interface TabularImportMapping {
  itemKeyColumn: string; sourceIdColumn: string; amountColumn: string; occurredOnColumn: string
  attributionMethodColumn?: string; participantIdColumn?: string; participantLabelColumn?: string
  poolKeyColumn?: string; directionColumn?: string; financialLabelColumn?: string; externalReferenceColumn?: string
  defaultAttributionMethod?: string; defaultPoolKey?: string; decimalSeparator: 'DOT' | 'COMMA'
}
export interface TabularImportIssue { rowNumber: number; column?: string | null; code: string; message: string }
export interface TabularImportValidation { valid: boolean; rowCount: number; additionTotal: number; reversalTotal: number; issues: TabularImportIssue[]; previewRows: Array<{ rowNumber: number; clientItemKey: string; amount: number; occurredOn?: string; sourceId?: string; attributionMethod?: string }>; detailedPreview: boolean }
export interface TabularImport { id: string; batchId: string; batchKey: string; rowCount: number; additionTotal: number; reversalTotal: number; replayed: boolean }

export interface ClosingSource { id: string; sourceKey: string; displayName: string }
export interface ClosingParticipant { id: string; participantKey: string; displayName: string; linkedUserId?: string; active: boolean }
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
  residualAmount: number
}

const versionPath = (closing: FinancialClosing) => `/financial-closings/${closing.id}/versions/${closing.currentVersion.versionNumber}`

export default {
  list() { return axiosInterceptor.get<FinancialClosing[]>('/financial-closings') },
  createOrGet(periodMonth: number, periodYear: number, closingKey = 'DEFAULT', currency = 'BRL') {
    return axiosInterceptor.post<FinancialClosing>('/financial-closings', { periodMonth, periodYear, closingKey, currency })
  },
  summary(closing: FinancialClosing) { return axiosInterceptor.get<ClosingSummary>(`${versionPath(closing)}/summary`) },
  matrix(closing: FinancialClosing) { return axiosInterceptor.get<ClosingMatrix>(`${versionPath(closing)}/matrix`) },
  memory(closing: FinancialClosing) { return axiosInterceptor.get<CalculationMemory>(`${versionPath(closing)}/calculation-memory`) },
  drillDown(closing: FinancialClosing, participantId: string, sourceId: string) {
    return axiosInterceptor.get<DrillDown>(`${versionPath(closing)}/drill-down`, { params: { participantId, sourceId } })
  },
  calculate(closing: FinancialClosing) { return axiosInterceptor.post<ClosingSummary>(`${versionPath(closing)}/calculate`) },
  validateTabularImport(closing: FinancialClosing, file: File, mapping: TabularImportMapping) {
    const body = new FormData(); body.append('file', file); body.append('mapping', JSON.stringify(mapping))
    return axiosInterceptor.post<TabularImportValidation>(`${versionPath(closing)}/tabular-imports/validate`, body)
  },
  confirmTabularImport(closing: FinancialClosing, file: File, batchKey: string, mapping: TabularImportMapping) {
    const body = new FormData(); body.append('file', file); body.append('batchKey', batchKey); body.append('mapping', JSON.stringify(mapping))
    return axiosInterceptor.post<TabularImport>(`${versionPath(closing)}/tabular-imports`, body)
  },
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
}
