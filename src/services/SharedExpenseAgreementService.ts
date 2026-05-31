import axiosInterceptor from './axiosInterceptor'

export type SharedExpenseSplitType = 'FIXED_AMOUNT' | 'PERCENTAGE' | 'EQUAL_SPLIT'
export type SharedExpensePaymentMode = 'DEBIT' | 'CREDIT_CARD' | 'PIX_REIMBURSEMENT' | 'OTHER'
export type SharedExpenseAgreementStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'DECLINED'
  | 'CANCELLED'
export type SharedExpenseObligationStatus =
  | 'PENDING'
  | 'REMINDED'
  | 'PAID_REPORTED'
  | 'CONFIRMED'
  | 'CANCELLED'

export interface CreateSharedExpenseAgreementRequest {
  transactionId: string
  counterpartyUserId?: string | null
  counterpartyEmail?: string | null
  participants?: SharedExpenseParticipantRequest[]
  sharedAmount?: number | null
  percentage?: number | null
  splitType: SharedExpenseSplitType
  paymentMode: SharedExpensePaymentMode
  installmentCount?: number | null
  dueDate?: string | null
  reminderDaysBefore?: number | null
  title?: string | null
  notes?: string | null
}

export interface SharedExpenseParticipantRequest {
  userId?: string | null
  email?: string | null
  displayName?: string | null
  sharedAmount?: number | null
  percentage?: number | null
}

export interface SharedExpenseParticipant {
  id: string
  agreementId: string
  userId?: string | null
  email?: string | null
  displayName?: string | null
  sharedAmount: number | string
  percentage?: number | string | null
  createdAt?: string | null
}

export interface SharedExpenseObligation {
  id: string
  agreementId: string
  participantId?: string | null
  installmentNumber: number
  amount: number | string
  dueDate?: string | null
  status: SharedExpenseObligationStatus
  reminderDaysBefore: number
  remindedAt?: string | null
  paidAt?: string | null
  confirmedAt?: string | null
  createdAt?: string | null
}

export interface SharedExpenseAgreement {
  id: string
  workspaceId?: string | null
  transactionId: string
  createdByUserId?: string | null
  payerUserId?: string | null
  counterpartyUserId?: string | null
  counterpartyEmail?: string | null
  title: string
  totalAmount: number | string
  sharedAmount: number | string
  splitType: SharedExpenseSplitType
  paymentMode: SharedExpensePaymentMode
  installmentCount: number
  dueDate?: string | null
  status: SharedExpenseAgreementStatus
  notes?: string | null
  createdAt?: string | null
  participants: SharedExpenseParticipant[]
  obligations: SharedExpenseObligation[]
  emailDeliveryStatus?: 'NOT_ATTEMPTED' | 'SKIPPED' | 'SENT' | 'PARTIAL' | 'FAILED'
  emailDeliveryCount?: number
  emailDeliveryErrors?: string[]
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shared-expense-agreements`

const SharedExpenseAgreementService = {
  create(request: CreateSharedExpenseAgreementRequest): Promise<{ data: SharedExpenseAgreement }> {
    return axiosInterceptor.post(API_URL, request)
  },
  update(id: string, request: CreateSharedExpenseAgreementRequest): Promise<{ data: SharedExpenseAgreement }> {
    return axiosInterceptor.put(`${API_URL}/${id}`, request)
  },
  list(params: { transactionId?: string } = {}): Promise<{ data: SharedExpenseAgreement[] }> {
    return axiosInterceptor.get(API_URL, { params })
  },
  listReceived(): Promise<{ data: SharedExpenseAgreement[] }> {
    return axiosInterceptor.get(`${API_URL}/received`)
  },
  get(id: string): Promise<{ data: SharedExpenseAgreement }> {
    return axiosInterceptor.get(`${API_URL}/${id}`)
  },
  getReceived(id: string): Promise<{ data: SharedExpenseAgreement }> {
    return axiosInterceptor.get(`${API_URL}/received/${id}`)
  },
}

export default SharedExpenseAgreementService
