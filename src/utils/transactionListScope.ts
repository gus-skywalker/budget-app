import type { TransactionView } from '@/types/financialRead'
import { normalizeTransactionVisibilityScope } from '@/types/financialRead'

export function matchesTransactionListScope(transaction: TransactionView, filter = 'all', conflictIds: string[] = []): boolean {
  switch (filter) {
    case 'open-finance':
      return Boolean(transaction.openFinance)
    case 'workspace':
      return normalizeTransactionVisibilityScope(transaction.visibilityScope) === 'WORKSPACE'
    case 'private':
      return transaction.visibilityScope === 'PRIVATE'
    case 'conflicts':
      return transaction.reconciliationStatus === 'CONFLICT_DUPLICATE' || conflictIds.includes(transaction.id)
    case 'uncategorized':
      return !transaction.category && !transaction.categoryName && !transaction.categoryId
    default:
      return true
  }
}

export function matchesExpenseRouteScope(
  transaction: TransactionView,
  filters: { accountId?: string; category?: string },
): boolean {
  if (filters.accountId && transaction.accountId !== filters.accountId) return false
  if (!filters.category) return true
  return [transaction.categoryId, transaction.categoryCode, transaction.categoryName, transaction.category]
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value) === filters.category)
}
