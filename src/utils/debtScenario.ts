import {
  DEBT_PAYMENT_SCENARIO_TYPE,
  type DebtPaymentComparison,
  type DebtPaymentOptionInput,
  type DebtPaymentScenarioInput,
  type ScenarioSourceType,
  type ScenarioSimulationRequest,
  type SavedScenario
} from '@/services/ScenarioService'
import i18n from '@/i18n'

export type DebtScenarioSnapshot = {
  scenarioType: typeof DEBT_PAYMENT_SCENARIO_TYPE
  sourceType: ScenarioSourceType
  scenarioName: string
  currentScenarioId: string | null
  budgetId?: string
  debtInput: DebtPaymentScenarioInput
}

const STORAGE_KEY = 'planning-debt-scenario-wizard-v1'

export const createDebtOption = (
  defaults?: Partial<DebtPaymentOptionInput>
): DebtPaymentOptionInput => ({
  name: defaults?.name || '',
  type: defaults?.type || 'INSTALLMENT',
  financedAmount: defaults?.financedAmount ?? null,
  installments: defaults?.installments ?? null,
  monthlyInterestRate: defaults?.monthlyInterestRate ?? null,
  iofAmount: defaults?.iofAmount ?? null,
  totalInstallmentAmount: defaults?.totalInstallmentAmount ?? null,
  expectedPayoffDays: defaults?.expectedPayoffDays ?? null,
  liquidityCertainty: defaults?.liquidityCertainty || 'UNCERTAIN',
  notes: defaults?.notes || ''
})

export const createDebtSnapshot = (): DebtScenarioSnapshot => ({
  scenarioType: DEBT_PAYMENT_SCENARIO_TYPE,
  sourceType: 'MANUAL_TYPED',
  scenarioName: '',
  currentScenarioId: null,
  debtInput: {
    title: '',
    totalAmount: 0,
    availableCash: 0,
    options: [
      createDebtOption({ type: 'INSTALLMENT' }),
      createDebtOption({ type: 'SHORT_TERM_CREDIT' })
    ]
  }
})

export const normalizeDebtSnapshot = (
  snapshot?: Partial<DebtScenarioSnapshot> | null
): DebtScenarioSnapshot => {
  const base = createDebtSnapshot()
  const options =
    Array.isArray(snapshot?.debtInput?.options) && snapshot?.debtInput?.options.length >= 2
      ? snapshot.debtInput.options.map((option) => createDebtOption(option))
      : base.debtInput.options

  return {
    scenarioType: DEBT_PAYMENT_SCENARIO_TYPE,
    sourceType: 'MANUAL_TYPED',
    scenarioName: String(snapshot?.scenarioName || snapshot?.debtInput?.title || ''),
    currentScenarioId: snapshot?.currentScenarioId || null,
    budgetId: snapshot?.budgetId,
    debtInput: {
      title: String(snapshot?.debtInput?.title || snapshot?.scenarioName || ''),
      totalAmount: Number(snapshot?.debtInput?.totalAmount || 0),
      availableCash: Number(snapshot?.debtInput?.availableCash || 0),
      options
    }
  }
}

export const validateDebtSnapshot = (snapshot: DebtScenarioSnapshot): string[] => {
  const isEnglish = String(i18n.global.locale.value).startsWith('en')
  const errors: string[] = []
  if (!String(snapshot.scenarioName || snapshot.debtInput.title || '').trim()) {
    errors.push(isEnglish ? 'Title is required.' : 'O título é obrigatório.')
  }
  if (Number(snapshot.debtInput.totalAmount || 0) <= 0) {
    errors.push(
      isEnglish
        ? 'Total amount must be greater than zero.'
        : 'O valor total deve ser maior que zero.',
    )
  }
  if (Number(snapshot.debtInput.availableCash || 0) < 0) {
    errors.push(
      isEnglish
        ? 'Available cash cannot be negative.'
        : 'O caixa disponível não pode ser negativo.',
    )
  }
  if (!Array.isArray(snapshot.debtInput.options) || snapshot.debtInput.options.length < 2) {
    errors.push(
      isEnglish
        ? 'Add at least two payment options.'
        : 'Adicione pelo menos duas opções de pagamento.',
    )
  }
  snapshot.debtInput.options.forEach((option, index) => {
    if (!String(option.name || '').trim()) {
      errors.push(
        isEnglish
          ? `Option ${index + 1} needs a name.`
          : `A opção ${index + 1} precisa de um nome.`,
      )
    }
  })
  return errors
}

export const buildDebtScenarioPayload = (
  snapshot: DebtScenarioSnapshot
): ScenarioSimulationRequest => ({
  id: snapshot.currentScenarioId || undefined,
  budgetId: snapshot.budgetId,
  name: String(snapshot.scenarioName || snapshot.debtInput.title || '').trim(),
  scenarioType: DEBT_PAYMENT_SCENARIO_TYPE,
  sourceType: 'MANUAL_TYPED',
  months: 1,
  deltas: [],
  lineAdjustments: [],
  debtInput: {
    ...snapshot.debtInput,
    title: String(snapshot.debtInput.title || snapshot.scenarioName || '').trim(),
    totalAmount: Number(snapshot.debtInput.totalAmount || 0),
    availableCash: Number(snapshot.debtInput.availableCash || 0),
    options: snapshot.debtInput.options.map((option) => ({
      ...option,
      name: String(option.name || '').trim()
    }))
  }
})

export const snapshotFromSavedDebtScenario = (scenario: SavedScenario): DebtScenarioSnapshot =>
  normalizeDebtSnapshot({
    scenarioName: scenario.name,
    currentScenarioId: scenario.id,
    budgetId: scenario.budgetId,
    debtInput: scenario.debtInput || {
      title: scenario.name,
      totalAmount: 0,
      availableCash: 0,
      options: [createDebtOption(), createDebtOption({ type: 'SHORT_TERM_CREDIT' })]
    }
  })

export const getRecommendedDebtOption = (comparison?: DebtPaymentComparison | null) =>
  (comparison?.options || []).find((option) => option.name === comparison?.recommendedOption) ||
  null

export const saveDebtSnapshot = (snapshot: DebtScenarioSnapshot) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export const loadDebtSnapshot = (): DebtScenarioSnapshot | null => {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return normalizeDebtSnapshot(JSON.parse(raw) as DebtScenarioSnapshot)
  } catch {
    return null
  }
}

export const clearDebtSnapshot = () => {
  window.sessionStorage.removeItem(STORAGE_KEY)
}

export const debtScenarioTemplates = {
  pay_now_or_installments: (): DebtScenarioSnapshot =>
    normalizeDebtSnapshot({
      scenarioName: 'Pagar agora ou parcelar',
      currentScenarioId: null,
      debtInput: {
        title: 'Pagar agora ou parcelar',
        totalAmount: 0,
        availableCash: 0,
        options: [
          createDebtOption({
            name: 'Pagar agora',
            type: 'MANUAL',
            financedAmount: 0,
            installments: 1,
            monthlyInterestRate: 0,
            totalInstallmentAmount: 0,
            expectedPayoffDays: 0,
            liquidityCertainty: 'CERTAIN',
            notes: 'Use esta opcao para comparar quitação imediata com menor custo total.'
          }),
          createDebtOption({
            name: 'Parcelar',
            type: 'INSTALLMENT',
            financedAmount: 0,
            installments: 6,
            monthlyInterestRate: 0,
            totalInstallmentAmount: 0,
            expectedPayoffDays: 180,
            liquidityCertainty: 'UNCERTAIN',
            notes: 'Use esta opcao para testar a troca entre liquidez no curto prazo e custo total.'
          })
        ]
      }
    })
}
