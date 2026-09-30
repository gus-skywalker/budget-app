import type { ScenarioDeltaType } from '@/services/ScenarioService'

export type ChangeKind = 'income' | 'expense' | 'reduceIncome' | 'reduceExpense'
export function changeKind(type: ScenarioDeltaType | undefined, flow: 'INCOME' | 'EXPENSE'): ChangeKind {
  if (type?.includes('EXPENSE_REDUCTION')) return 'reduceExpense'
  if (type?.includes('INCOME_REDUCTION')) return 'reduceIncome'
  return flow === 'INCOME' ? 'income' : 'expense'
}
export function scenarioMonthLabel(offset: number, locale: string) {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + 1 + Math.max(0, Math.trunc(Number(offset || 0))))
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date).replace('.', '')
}
