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
  comments?: DecisionComment[]
  approveVotes: number
  rejectVotes: number
  currentUserVote?: DecisionVoteValue | null
}

export interface DecisionComment {
  id: string
  decisionId: string
  authorId: string
  body: string
  createdAt?: string
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
  listComments(decisionId: string) {
    return axiosInterceptor.get<DecisionComment[]>(`/decisions/${decisionId}/comments`)
  },
  addComment(decisionId: string, body: string) {
    return axiosInterceptor.post<DecisionComment>(`/decisions/${decisionId}/comments`, { body })
  },
  vote(decisionId: string, voteValue: DecisionVoteValue) {
    return axiosInterceptor.put<PersistedDecision>(`/decisions/${decisionId}/vote`, { voteValue })
  },
  removeVote(decisionId: string) {
    return axiosInterceptor.delete<PersistedDecision>(`/decisions/${decisionId}/vote`)
  },
}
