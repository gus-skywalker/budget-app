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
export interface BankReconciliationCandidate { candidateId: string; amount: number; transactionDate: string; direction: string; classification: 'EXACT' | 'LIKELY' | 'AMBIGUOUS'; score: number; reasons: string[]; maskedAccount?: string | null }
export interface BankReconciliationSuggestionPage { paymentExecutionId: string; classification: 'EXACT' | 'LIKELY' | 'AMBIGUOUS' | 'NO_MATCH'; totalCount: number; offset: number; limit: number; candidates: BankReconciliationCandidate[] }
export interface FinancialCorrection { id: string; status: string; revision: number; type: string; amount: number }

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
  obligations() { return axiosInterceptor.get<OperationalObligation[]>('/financial-closings/obligations') },
  recordPayment(payload: { direction: string; currency: string; amount: number; externalReference?: string; idempotencyKey: string; executedAt?: string }) { return axiosInterceptor.post<PaymentExecution>('/financial-closings/payment-executions', payload) },
  confirmPayment(id: string, payload: { justification: string; evidenceReference: string; idempotencyKey: string }) { return axiosInterceptor.post<PaymentExecution>(`/financial-closings/payment-executions/${id}/confirm`, payload) },
  voidPayment(id: string, reason: string) { return axiosInterceptor.post<PaymentExecution>(`/financial-closings/payment-executions/${id}/void`, { reason }) },
  bankReconciliationSuggestions(id: string, limit = 20, offset = 0) { return axiosInterceptor.get<BankReconciliationSuggestionPage>(`/financial-closings/payment-executions/${id}/bank-reconciliation-suggestions`, { params: { limit, offset } }) },
  createCorrection(payload: { type: string; originalObligationId: string; amount: number }) { return axiosInterceptor.post<FinancialCorrection>('/financial-closings/financial-corrections', payload) },
  submitCorrection(id: string, expectedRevision: number) { return axiosInterceptor.post<FinancialCorrection>(`/financial-closings/financial-corrections/${id}/submit`, { expectedRevision }) },
  approveCorrection(id: string, expectedRevision: number) { return axiosInterceptor.post<FinancialCorrection>(`/financial-closings/financial-corrections/${id}/approve`, { expectedRevision, idempotencyKey: crypto.randomUUID() }) },
}
