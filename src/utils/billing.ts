import type { BillingSubjectType } from '@/services/BillingDecisionService'

interface UserStoreLike {
  user?: {
    id?: string | null
  } | null
}

export interface CanonicalBillingSubject {
  subjectType: BillingSubjectType
  subjectId: string
}

export function resolveCanonicalBillingSubject(userStore: UserStoreLike): CanonicalBillingSubject | null {
  const userId = userStore?.user?.id
  if (!userId) {
    return null
  }

  return {
    subjectType: 'USER',
    subjectId: String(userId)
  }
}
