import axiosInterceptor from './axiosInterceptor'

export type PersistedDecisionStatus = 'OPEN' | 'APPROVED' | 'REJECTED'
export type DecisionVoteValue = 'APPROVE' | 'REJECT'

export interface PersistedDecision {
  id: string
  scenarioId: string
  title: string
  summary?: string
  status: PersistedDecisionStatus
  createdAt?: string
  appliedAt?: string
  comments?: DecisionComment[]
  approveVotes: number
  rejectVotes: number
  currentUserVote?: DecisionVoteValue | null
  currentUserOwner?: boolean
  canCurrentUserApply?: boolean
  applyBlockedReason?: string | null
}

export interface ApplyDecisionResponse {
  decisionId: string
  status: PersistedDecisionStatus
  appliedAt?: string
  updatedBudget: {
    id: string
    totalIncome: number
    totalExpense: number
    net: number
  }
}

export interface DecisionComment {
  id: string
  decisionId: string
  authorId: string
  body: string
  createdAt?: string
}

export interface DecisionVoteSummary {
  totalApproves: number
  totalRejects: number
  userVote?: DecisionVoteValue | null
}

export default {
  list() {
    return axiosInterceptor.get<PersistedDecision[]>('/decisions')
  },
  createFromScenario(scenarioId: string) {
    return axiosInterceptor.post<PersistedDecision>(`/decisions/from-scenario/${scenarioId}`)
  },
  updateStatus(decisionId: string, status: PersistedDecisionStatus) {
    return axiosInterceptor.patch<PersistedDecision>(`/decisions/${decisionId}/status`, { status })
  },
  applyDecision(decisionId: string) {
    return axiosInterceptor.post<ApplyDecisionResponse>(`/decisions/${decisionId}/apply`)
  },
  listComments(decisionId: string) {
    return axiosInterceptor.get<DecisionComment[]>(`/decisions/${decisionId}/comments`)
  },
  addComment(decisionId: string, body: string) {
    return axiosInterceptor.post<DecisionComment>(`/decisions/${decisionId}/comments`, { content: body })
  },
  vote(decisionId: string, voteValue: DecisionVoteValue) {
    return axiosInterceptor.post<DecisionVoteSummary>(`/decisions/${decisionId}/vote`, { vote: voteValue })
  },
  removeVote(decisionId: string) {
    return axiosInterceptor.delete<DecisionVoteSummary>(`/decisions/${decisionId}/vote`)
  },
}
