import type { PersistedDecision } from '@/services/DecisionService'

// Approval alone is not evidence that the budget was updated (especially in public DTOs).
export function decisionStageKey(decision?: { status: string; appliedAt?: string } | null): string {
  if (!decision) return 'decisionJourney.continuation.saved'
  if (decision.appliedAt) return 'decisionJourney.continuation.applied'
  if (decision.status === 'APPROVED') return 'decisionJourney.continuation.approved'
  if (decision.status === 'REJECTED') return 'decisionJourney.continuation.rejected'
  return 'decisionJourney.continuation.open'
}

export function decisionLocksScenario(decision?: PersistedDecision | null): boolean {
  return Boolean(decision && (decision.appliedAt || decision.status !== 'OPEN' ||
    decision.approveVotes > 0 || decision.rejectVotes > 0))
}

export function decisionActionErrorKey(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status === 403) return 'decisionJourney.continuation.forbidden'
  if (status === 409) return 'decisionJourney.continuation.conflict'
  return 'decisionJourney.continuation.failed'
}
