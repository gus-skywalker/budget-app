<template>
  <div class="planning-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('planning.budget.title') }}</h1>
          <p class="page-subtitle">{{ $t('planning.budget.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-wallet-outline</v-icon>
            {{ $t('planning.budget.current_plan_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div v-if="isLoading" class="helper-text">{{ $t('planning.budget.loading_baselines') }}</div>

          <template v-else>
            <v-alert
              v-if="emptyBudgetMessage"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-1"
            >
              {{ emptyBudgetMessage }}
            </v-alert>

            <v-alert
              v-if="bannerMessage"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-1"
            >
              {{ bannerMessage }}
            </v-alert>

            <section v-if="activeBudget" class="baseline-section">
              <div class="section-heading">
                <div>
                  <p class="section-kicker">{{ $t('planning.budget.active_baseline') }}</p>
                  <h3>{{ baselineTitle(activeBudget) }}</h3>
                </div>
                <v-chip color="success" variant="tonal" size="small">{{ $t('planning.budget.used_by_scenarios') }}</v-chip>
              </div>

              <div class="summary-grid">
                <div class="summary-card">
                  <span>{{ $t('planning.budget.total_income') }}</span>
                  <strong>{{ formatCurrency(activeBudget.totalIncome) }}</strong>
                </div>
                <div class="summary-card">
                  <span>{{ $t('planning.budget.total_expense') }}</span>
                  <strong>{{ formatCurrency(activeBudget.totalExpense) }}</strong>
                </div>
                <div class="summary-card">
                  <span>{{ $t('planning.budget.net') }}</span>
                  <strong :class="{ 'negative-value': activeBudget.net < 0 }">{{ formatCurrency(activeBudget.net) }}</strong>
                </div>
              </div>

              <div class="baseline-meta">
                <span>{{ activeBudget.periodMonth }}/{{ activeBudget.periodYear }}</span>
                <span>{{ $t('planning.budget.lines_count', { count: activeBudget.lines?.length || 0 }) }}</span>
                <span>{{ baselineSourceLabel(activeBudget) }}</span>
              </div>

              <v-alert
                v-if="activeBaselineNotice"
                type="info"
                variant="tonal"
                density="comfortable"
                class="mb-1"
              >
                {{ activeBaselineNotice }}
              </v-alert>

          <div class="flow-action">
                <v-btn color="#667eea" size="large" @click="goToScenarioCreation">
                  <v-icon start>mdi-chart-timeline-variant</v-icon>
                  {{ $t('planning.budget.create_scenario') }}
                </v-btn>
              </div>
            </section>

            <section v-else-if="!showSuggestionEditor && !showManualEditor" class="empty-state">
              <v-icon color="#94a3b8" size="28">mdi-wallet-plus-outline</v-icon>
              <p class="empty-title">{{ $t('planning.budget.empty_start_title') }}</p>
              <p class="helper-text">
                {{ $t('planning.budget.empty_start_description') }}
              </p>
              <p v-if="!canManageBudget" class="helper-text">
                {{ $t('planning.budget.manage_permission_hint') }}
              </p>
            </section>

            <section v-if="canManageBudget && showSuggestionEditor && suggestion" class="baseline-section">
              <div class="suggestion-header">
                <h3>{{ $t('planning.budget.suggested_budget') }}</h3>
                <p>{{ $t('planning.budget.suggestion_lookback', { count: suggestion.lookbackMonths || 3 }) }}</p>
              </div>

              <div class="summary-grid">
                <div class="summary-card">
                  <span>{{ $t('planning.budget.suggested_income') }}</span>
                  <strong>{{ formatCurrency(suggestedIncomeTotal) }}</strong>
                </div>
                <div class="summary-card">
                  <span>{{ $t('planning.budget.suggested_expense') }}</span>
                  <strong>{{ formatCurrency(suggestedExpenseTotal) }}</strong>
                </div>
                <div class="summary-card">
                  <span>{{ $t('planning.budget.net') }}</span>
                  <strong :class="{ 'negative-value': suggestedNetTotal < 0 }">{{ formatCurrency(suggestedNetTotal) }}</strong>
                </div>
              </div>

              <v-table density="comfortable" class="suggestion-table">
                <thead>
                  <tr>
                    <th>{{ $t('planning.budget.category') }}</th>
                    <th>{{ $t('planning.budget.suggested') }}</th>
                    <th>{{ $t('planning.budget.confidence') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, index) in editableSuggestionLines" :key="`${line.type}-${line.category}-${index}`">
                    <td>{{ line.category }} <span class="line-type">{{ line.type }}</span></td>
                    <td>
                      <v-text-field
                        v-model.number="line.suggestedAmount"
                        type="number"
                        min="0"
                        density="compact"
                        variant="outlined"
                        hide-details
                      />
                    </td>
                    <td>
                      <v-chip size="x-small" variant="tonal" :color="confidenceColor(line.confidence)">
                        {{ line.confidence }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <div class="empty-actions">
                <v-btn
                  color="#667eea"
                  :loading="isUsingSuggestedPlan"
                  :disabled="isUsingSuggestedPlan || !hasSuggestedBudgetValues"
                  @click="useSuggestedPlan"
                >
                  <v-icon start>mdi-check-circle-outline</v-icon>
                  {{ $t('planning.budget.activate_this_plan') }}
                </v-btn>
                <v-btn variant="text" color="#64748b" @click="cancelSuggestion">
                  {{ $t('common.cancel') }}
                </v-btn>
              </div>
            </section>

            <section v-else-if="canManageBudget && showManualEditor" class="baseline-section">
              <template v-if="manualMode === 'quick'">
                <div class="suggestion-header">
                  <h3>{{ $t('planning.budget.quick_baseline') }}</h3>
                  <p>{{ $t('planning.budget.quick_baseline_description') }}</p>
                </div>

                <div class="quick-baseline-panel">
                  <v-text-field
                    v-model.number="quickBaselineAmount"
                    :label="$t('planning.budget.monthly_net_cashflow')"
                    type="number"
                    density="comfortable"
                    variant="outlined"
                    prefix="R$"
                    hide-details
                  />
                  <div class="summary-card quick-baseline-summary">
                    <span>{{ $t('planning.budget.baseline') }}</span>
                    <strong :class="{ 'negative-value': Number(quickBaselineAmount || 0) < 0 }">
                      {{ formatCurrency(Number(quickBaselineAmount || 0)) }}
                    </strong>
                  </div>
                </div>

                <div class="empty-actions">
                  <v-btn
                    color="#667eea"
                    :loading="isCreatingManualBudget"
                    :disabled="isCreatingManualBudget || !hasQuickBaselineValue"
                    @click="createQuickBaselineBudget"
                  >
                    <v-icon start>mdi-check-circle-outline</v-icon>
                    {{ $t('planning.budget.activate_quick_baseline') }}
                  </v-btn>
                  <v-btn variant="tonal" color="#667eea" @click="startDetailedManualBudget">
                    <v-icon start>mdi-format-list-bulleted</v-icon>
                    {{ $t('planning.budget.use_detailed_budget') }}
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="cancelManualBudget">
                    {{ $t('common.cancel') }}
                  </v-btn>
                </div>
              </template>

              <template v-else>
                <div class="suggestion-header">
                  <h3>{{ $t('planning.budget.detailed_manual_budget') }}</h3>
                  <p>{{ $t('planning.budget.detailed_manual_description') }}</p>
                </div>

                <div class="summary-grid">
                  <div class="summary-card">
                    <span>{{ $t('planning.budget.income') }}</span>
                    <strong>{{ formatCurrency(manualIncomeTotal) }}</strong>
                  </div>
                  <div class="summary-card">
                    <span>{{ $t('planning.budget.expense') }}</span>
                    <strong>{{ formatCurrency(manualExpenseTotal) }}</strong>
                  </div>
                  <div class="summary-card">
                    <span>{{ $t('planning.budget.net') }}</span>
                    <strong :class="{ 'negative-value': manualNetTotal < 0 }">{{ formatCurrency(manualNetTotal) }}</strong>
                  </div>
                </div>

                <div class="manual-lines">
                  <div
                    v-for="(line, index) in editableManualLines"
                    :key="line.id"
                    class="manual-line"
                  >
                    <v-text-field
                      v-model="line.category"
                      :label="$t('planning.budget.category')"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                    />
                    <v-btn-toggle v-model="line.type" mandatory divided color="#667eea">
                      <v-btn value="INCOME">{{ $t('planning.budget.income') }}</v-btn>
                      <v-btn value="EXPENSE">{{ $t('planning.budget.expense') }}</v-btn>
                    </v-btn-toggle>
                    <v-text-field
                      v-model.number="line.plannedAmount"
                      :label="$t('planning.budget.monthly_amount')"
                      type="number"
                      min="0"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                    />
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      :disabled="editableManualLines.length === 1"
                      @click="removeManualLine(index)"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div class="empty-actions">
                  <v-btn variant="tonal" color="#667eea" @click="addManualLine">
                    <v-icon start>mdi-plus</v-icon>
                    {{ $t('planning.budget.add_line') }}
                  </v-btn>
                  <v-btn
                    color="#667eea"
                    :loading="isCreatingManualBudget"
                    :disabled="isCreatingManualBudget || !hasManualBudgetValues"
                    @click="createManualBudget"
                  >
                    <v-icon start>mdi-check-circle-outline</v-icon>
                    {{ $t('planning.budget.activate_detailed_budget') }}
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="startManualBudget">
                    {{ $t('planning.budget.quick_baseline') }}
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="cancelManualBudget">
                    {{ $t('common.cancel') }}
                  </v-btn>
                </div>
              </template>
            </section>

            <section v-if="canManageBudget && !showSuggestionEditor && !showManualEditor" class="baseline-section">
              <div class="section-heading">
                <div>
                  <p class="section-kicker">{{ $t('planning.budget.create_baseline') }}</p>
                  <h3>{{ $t('planning.budget.choose_source') }}</h3>
                </div>
              </div>

              <div class="baseline-option-grid">
                <div class="baseline-option">
                  <v-icon color="#10b981" size="26">mdi-bank-transfer-in</v-icon>
                  <div>
                    <h4>{{ $t('planning.budget.suggested_from_transactions') }}</h4>
                    <p>{{ suggestionMessage }}</p>
                  </div>
                  <v-btn
                    color="#667eea"
                    :loading="isGeneratingSuggestion"
                    :disabled="isGeneratingSuggestion"
                    @click="generateSuggestion"
                  >
                    <v-icon start>mdi-auto-fix</v-icon>
                    {{ $t('planning.budget.generate_suggested_budget') }}
                  </v-btn>
                </div>

                <div class="baseline-option">
                  <v-icon color="#0ea5e9" size="26">mdi-finance</v-icon>
                  <div>
                    <h4>{{ $t('planning.budget.real_baseline_openfinance') }}</h4>
                    <p>{{ consolidatedBaselineMessage }}</p>
                  </div>
                  <v-btn
                    color="#0f766e"
                    :loading="isGeneratingRealBaseline"
                    :disabled="isGeneratingRealBaseline"
                    @click="generateRealBaseline"
                  >
                    <v-icon start>mdi-chart-box-outline</v-icon>
                    {{ $t('planning.budget.generate_real_baseline') }}
                  </v-btn>
                </div>

                <div class="baseline-option">
                  <v-icon color="#667eea" size="26">mdi-pencil-outline</v-icon>
                  <div>
                    <h4>{{ $t('planning.budget.quick_manual_baseline') }}</h4>
                    <p>{{ $t('planning.budget.quick_manual_description') }}</p>
                  </div>
                  <v-btn :variant="hasSuggestionData ? 'tonal' : 'flat'" color="#667eea" @click="startManualBudget">
                    <v-icon start>mdi-plus-circle-outline</v-icon>
                    {{ $t('planning.budget.create_manually') }}
                  </v-btn>
                </div>
              </div>
            </section>

            <section v-if="canManageBudget && usableAlternativeBudgets.length" class="baseline-section">
              <div class="section-heading">
                <div>
                  <p class="section-kicker">{{ $t('planning.budget.available_baselines') }}</p>
                  <h3>{{ $t('planning.budget.other_versions_for_period', { month: now.getMonth() + 1, year: now.getFullYear() }) }}</h3>
                </div>
              </div>

              <div class="baseline-list">
                <div
                  v-for="budget in usableAlternativeBudgets"
                  :key="budget.id"
                  class="baseline-row"
                >
                  <div>
                    <h4>{{ baselineTitle(budget) }}</h4>
                    <p>{{ baselineSourceLabel(budget) }} · {{ $t('planning.budget.lines_count', { count: budget.lines?.length || 0 }) }}</p>
                  </div>
                  <div class="baseline-row__numbers">
                    <span>{{ $t('planning.budget.net') }}</span>
                    <strong :class="{ 'negative-value': budget.net < 0 }">{{ formatCurrency(budget.net) }}</strong>
                  </div>
                  <v-btn
                    variant="tonal"
                    color="#667eea"
                    :loading="activatingBudgetId === budget.id"
                    :disabled="Boolean(activatingBudgetId)"
                    @click="activateExistingBudget(budget)"
                  >
                    {{ $t('planning.budget.set_active') }}
                  </v-btn>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BudgetService, {
  type Budget,
  type BudgetLineType,
  type BudgetSuggestion,
  type BudgetSuggestionLine
} from '@/services/BudgetService'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { OpenFinanceConnection } from '@/types/openFinance'
import { useUserStore } from '@/plugins/userStore'

type ManualBudgetLine = {
  id: string
  category: string
  type: BudgetLineType
  plannedAmount: number
}

type ManualBudgetMode = 'quick' | 'detailed'

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()

const isLoading = ref(false)
const isCreatingManualBudget = ref(false)
const isGeneratingSuggestion = ref(false)
const isGeneratingRealBaseline = ref(false)
const isUsingSuggestedPlan = ref(false)
const activatingBudgetId = ref<string | null>(null)
const activeBudget = ref<Budget | null>(null)
const allBudgets = ref<Budget[]>([])
const suggestion = ref<BudgetSuggestion | null>(null)
const hasSuggestionData = ref(false)
const visibleOpenFinanceConnections = ref<OpenFinanceConnection[]>([])
const showSuggestionEditor = ref(false)
const showManualEditor = ref(false)
const bannerMessage = ref('')
const emptyBudgetMessage = ref('')
const canManageBudget = computed(() => userStore.isTenantAdmin)
const editableSuggestionLines = ref<BudgetSuggestionLine[]>([])
const editableManualLines = ref<ManualBudgetLine[]>([])
const manualMode = ref<ManualBudgetMode>('quick')
const quickBaselineAmount = ref<number | null>(null)

const now = computed(() => new Date())
const suggestedIncomeTotal = computed(() =>
  editableSuggestionLines.value
    .filter((line) => line.type === 'INCOME')
    .reduce((total, line) => total + Number(line.suggestedAmount || 0), 0)
)
const suggestedExpenseTotal = computed(() =>
  editableSuggestionLines.value
    .filter((line) => line.type === 'EXPENSE')
    .reduce((total, line) => total + Number(line.suggestedAmount || 0), 0)
)
const suggestedNetTotal = computed(() => suggestedIncomeTotal.value - suggestedExpenseTotal.value)
const hasSuggestedBudgetValues = computed(() =>
  editableSuggestionLines.value.some((line) => Number(line.suggestedAmount || 0) > 0)
)
const manualIncomeTotal = computed(() =>
  editableManualLines.value
    .filter((line) => line.type === 'INCOME')
    .reduce((total, line) => total + Number(line.plannedAmount || 0), 0)
)
const manualExpenseTotal = computed(() =>
  editableManualLines.value
    .filter((line) => line.type === 'EXPENSE')
    .reduce((total, line) => total + Number(line.plannedAmount || 0), 0)
)
const manualNetTotal = computed(() => manualIncomeTotal.value - manualExpenseTotal.value)
const hasQuickBaselineValue = computed(() => Number(quickBaselineAmount.value || 0) !== 0)
const hasManualBudgetValues = computed(() =>
  editableManualLines.value.some(
    (line) => line.category.trim().length > 0 && Number(line.plannedAmount || 0) > 0
  )
)
const usableAlternativeBudgets = computed(() =>
  allBudgets.value.filter(
    (budget) => budget.id !== activeBudget.value?.id && hasUsableBudgetBaseline(budget)
  )
)
const hasVisiblePlanningSharedConnection = computed(() =>
  visibleOpenFinanceConnections.value.some(
    (connection) =>
      connection.payerDocumentType === 'CPF' &&
      connection.planningSharingLevel === 'PLANNING_IMPACT_ONLY' &&
      (connection.status === 'CONNECTED' || connection.status === 'ERROR')
  )
)
const hasVisiblePrivateOnlyPlanningSource = computed(() =>
  visibleOpenFinanceConnections.value.some(
    (connection) =>
      connection.payerDocumentType === 'CPF' &&
      connection.planningSharingLevel === 'PRIVATE' &&
      (connection.status === 'CONNECTED' || connection.status === 'ERROR')
  )
)
const planningSharingDisabledNotice = computed(() =>
  hasVisiblePrivateOnlyPlanningSource.value && !hasVisiblePlanningSharedConnection.value
)
const suggestionMessage = computed(() =>
  hasSuggestionData.value
    ? t('planning.budget.suggestion_message_ready')
    : planningSharingDisabledNotice.value
      ? t('planning.budget.suggestion_message_sharing_disabled')
      : t('planning.budget.suggestion_message_unavailable')
)
const consolidatedBaselineMessage = computed(() =>
  planningSharingDisabledNotice.value
    ? t('planning.budget.consolidated_message_sharing_disabled')
    : t('planning.budget.consolidated_message_ready')
)
const activeBaselineNotice = computed(() => {
  if (!activeBudget.value || !isOpenFinanceAggregatedBaseline(activeBudget.value)) {
    return ''
  }
  if (planningSharingDisabledNotice.value) {
    return t('planning.budget.active_baseline_sharing_disabled')
  }
  return t('planning.budget.active_baseline_snapshot')
})

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const createManualLine = (defaults?: Partial<ManualBudgetLine>): ManualBudgetLine => ({
  id: defaults?.id || crypto.randomUUID(),
  category: defaults?.category || '',
  type: defaults?.type || 'EXPENSE',
  plannedAmount: Number(defaults?.plannedAmount || 0),
})

const hasUsableBudgetBaseline = (budget: Budget): boolean =>
  Array.isArray(budget.lines) &&
  budget.lines.some((line) => Number(line.plannedAmount || 0) > 0)

const findActiveBudget = (budgets: Budget[]): Budget | null =>
  budgets.find((budget) => budget.status === 'ACTIVE' && hasUsableBudgetBaseline(budget)) || null

const loadCurrentBudget = async () => {
  isLoading.value = true
  emptyBudgetMessage.value = ''
  try {
    const { data } = await BudgetService.list(now.value.getMonth() + 1, now.value.getFullYear())
    const budgets = Array.isArray(data) ? data : []
    allBudgets.value = budgets
    const currentBudget = findActiveBudget(budgets)
    if (!currentBudget && budgets.some((budget) => budget.status === 'ACTIVE')) {
      activeBudget.value = null
      emptyBudgetMessage.value = t('planning.budget.empty_current_plan')
      await preloadSuggestionAvailability()
      return
    }

    activeBudget.value = currentBudget
    showSuggestionEditor.value = false
    showManualEditor.value = false
    await preloadSuggestionAvailability()
  } catch (error) {
    console.error(error)
    activeBudget.value = null
  } finally {
    isLoading.value = false
  }
}

const loadOpenFinancePlanningContext = async () => {
  try {
    const { data } = await OpenFinanceService.listConnections()
    visibleOpenFinanceConnections.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error(error)
    visibleOpenFinanceConnections.value = []
  }
}

const preloadSuggestionAvailability = async () => {
  try {
    const { data } = await BudgetService.getSuggestions(now.value.getMonth() + 1, now.value.getFullYear())
    suggestion.value = data
    hasSuggestionData.value = Array.isArray(data?.lines) && data.lines.length > 0
  } catch (error) {
    console.error(error)
    suggestion.value = null
    hasSuggestionData.value = false
  }
}

const generateSuggestion = async () => {
  isGeneratingSuggestion.value = true
  showManualEditor.value = false
  bannerMessage.value = ''
  emptyBudgetMessage.value = ''
  try {
    const { data } = await BudgetService.getSuggestions(now.value.getMonth() + 1, now.value.getFullYear())
    suggestion.value = data
    editableSuggestionLines.value = (data?.lines || []).map((line) => ({
      ...line,
      suggestedAmount: Number(line.suggestedAmount || 0),
    }))
    showSuggestionEditor.value = editableSuggestionLines.value.length > 0
    hasSuggestionData.value = editableSuggestionLines.value.length > 0
    if (!hasSuggestionData.value) {
      emptyBudgetMessage.value = planningSharingDisabledNotice.value
        ? t('planning.budget.generate_suggestion_sharing_disabled')
        : t('planning.budget.generate_suggestion_no_data')
    }
  } catch (error) {
    console.error(error)
    emptyBudgetMessage.value = t('planning.budget.generate_suggestion_error')
  } finally {
    isGeneratingSuggestion.value = false
  }
}

const generateRealBaseline = async () => {
  isGeneratingRealBaseline.value = true
  bannerMessage.value = ''
  emptyBudgetMessage.value = ''
  showSuggestionEditor.value = false
  showManualEditor.value = false
  try {
    const { data } = await BudgetService.generateBaseline(now.value.getMonth() + 1, now.value.getFullYear())
    if (!data || data.status === 'NO_DATA' || !data.budgetId) {
      emptyBudgetMessage.value = planningSharingDisabledNotice.value
        ? t('planning.budget.generate_real_sharing_disabled')
        : t('planning.budget.generate_real_no_data')
      return
    }
    await loadCurrentBudget()
    bannerMessage.value = t('planning.budget.real_baseline_activated', {
      income: formatCurrency(data.incomeTotal),
      expense: formatCurrency(data.expenseTotal),
      net: formatCurrency(data.netAmount),
    })
  } catch (error) {
    console.error(error)
    emptyBudgetMessage.value = t('planning.budget.generate_real_error')
  } finally {
    isGeneratingRealBaseline.value = false
  }
}

const cancelSuggestion = () => {
  showSuggestionEditor.value = false
}

const useSuggestedPlan = async () => {
  if (!suggestion.value) return
  isUsingSuggestedPlan.value = true
  try {
    const { data } = await BudgetService.createFromSuggestion({
      month: suggestion.value.month,
      year: suggestion.value.year,
      lines: editableSuggestionLines.value.map((line) => ({
        ...line,
        suggestedAmount: Number(line.suggestedAmount || 0),
      })).filter((line) => Number(line.suggestedAmount || 0) > 0),
    })
    if (data?.id) {
      await BudgetService.activate(data.id)
    }
    await loadCurrentBudget()
    showSuggestionEditor.value = false
    bannerMessage.value = t('planning.budget.suggested_budget_activated')
  } catch (error) {
    console.error(error)
  } finally {
    isUsingSuggestedPlan.value = false
  }
}

const startManualBudget = () => {
  showSuggestionEditor.value = false
  showManualEditor.value = true
  manualMode.value = 'quick'
  quickBaselineAmount.value = null
}

const startDetailedManualBudget = () => {
  manualMode.value = 'detailed'
  editableManualLines.value = [
    createManualLine({ category: t('planning.budget.default_income_category'), type: 'INCOME' }),
    createManualLine({ category: t('planning.budget.default_expense_category'), type: 'EXPENSE' }),
  ]
}

const addManualLine = () => {
  editableManualLines.value.push(createManualLine())
}

const removeManualLine = (index: number) => {
  if (editableManualLines.value.length === 1) return
  editableManualLines.value.splice(index, 1)
}

const cancelManualBudget = () => {
  showManualEditor.value = false
  manualMode.value = 'quick'
  quickBaselineAmount.value = null
  editableManualLines.value = []
}

const createQuickBaselineBudget = async () => {
  const baselineAmount = Number(quickBaselineAmount.value || 0)

  if (baselineAmount === 0) {
    emptyBudgetMessage.value = t('planning.budget.quick_baseline_required')
    return
  }

  isCreatingManualBudget.value = true
  try {
    const { data: createdBudget } = await BudgetService.create({
      periodMonth: now.value.getMonth() + 1,
      periodYear: now.value.getFullYear(),
      status: 'DRAFT',
    })

    if (!createdBudget?.id) {
      return
    }

    await BudgetService.addLine(createdBudget.id, {
      category: 'Manual net baseline',
      type: baselineAmount > 0 ? 'INCOME' : 'EXPENSE',
      plannedAmount: Math.abs(baselineAmount),
    })

    await BudgetService.activate(createdBudget.id)
    await loadCurrentBudget()
    showManualEditor.value = false
    bannerMessage.value = t('planning.budget.quick_baseline_activated')
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingManualBudget.value = false
  }
}

const activateExistingBudget = async (budget: Budget) => {
  activatingBudgetId.value = budget.id
  try {
    await BudgetService.activate(budget.id)
    await loadCurrentBudget()
    bannerMessage.value = t('planning.budget.existing_baseline_activated', { name: baselineTitle(budget) })
  } catch (error) {
    console.error(error)
  } finally {
    activatingBudgetId.value = null
  }
}

const createManualBudget = async () => {
  const lines = editableManualLines.value
    .map((line) => ({
      category: line.category.trim(),
      type: line.type,
      plannedAmount: Number(line.plannedAmount || 0),
    }))
    .filter((line) => line.category.length > 0 && line.plannedAmount > 0)

  if (!lines.length) {
    emptyBudgetMessage.value = t('planning.budget.manual_budget_required')
    return
  }

  isCreatingManualBudget.value = true
  try {
    const { data: createdBudget } = await BudgetService.create({
      periodMonth: now.value.getMonth() + 1,
      periodYear: now.value.getFullYear(),
      status: 'DRAFT',
    })

    if (!createdBudget?.id) {
      return
    }

    await Promise.all(lines.map((line) => BudgetService.addLine(createdBudget.id, line)))

    await BudgetService.activate(createdBudget.id)
    await loadCurrentBudget()
    showManualEditor.value = false
    bannerMessage.value = t('planning.budget.manual_budget_activated')
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingManualBudget.value = false
  }
}

const goToScenarioCreation = async () => {
  await router.push({ name: 'planning-scenarios-new' })
}

const confidenceColor = (confidence?: string) => {
  if (confidence === 'HIGH') return 'success'
  if (confidence === 'MEDIUM') return 'warning'
  return 'default'
}

const isQuickManualBudget = (budget: Budget): boolean =>
  (budget.lines || []).length === 1 &&
  String(budget.lines[0]?.category || '').toLowerCase() === 'manual net baseline'

const isOpenFinanceAggregatedBaseline = (budget: Budget): boolean => {
  const categories = (budget.lines || []).map((line) => String(line.category || '').toLowerCase())
  return categories.includes('openfinance aggregated income') || categories.includes('openfinance aggregated expense')
}

const baselineSourceLabel = (budget: Budget): string => {
  if (isOpenFinanceAggregatedBaseline(budget)) return t('planning.budget.source_openfinance')
  if (isQuickManualBudget(budget)) return t('planning.budget.source_quick_manual')
  if ((budget.lines || []).length > 1) return t('planning.budget.source_detailed_budget')
  return t('planning.budget.source_manual_budget')
}

const baselineTitle = (budget: Budget): string => {
  if (isOpenFinanceAggregatedBaseline(budget)) return t('planning.budget.title_openfinance_baseline')
  if (isQuickManualBudget(budget)) return t('planning.budget.title_quick_manual_baseline')
  if (budget.status === 'ACTIVE') return t('planning.budget.title_current_baseline')
  return t('planning.budget.title_budget_baseline')
}

onMounted(async () => {
  await Promise.all([loadCurrentBudget(), loadOpenFinancePlanningContext()])
})
</script>

<style scoped>
.planning-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .planning-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1200px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.08);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  color: #1a1a1a;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
  display: grid;
  gap: 16px;
}

.baseline-section {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.12);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.72);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-heading h3 {
  margin: 0;
  color: #0f172a;
}

.section-kicker {
  margin: 0 0 3px;
  color: #667eea;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.baseline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.baseline-meta span:not(:last-child)::after {
  content: "·";
  margin-left: 8px;
  color: #94a3b8;
}

.baseline-option-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.baseline-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 12px;
  background: #fff;
}

.baseline-option--muted {
  background: rgba(248, 250, 252, 0.7);
}

.baseline-option h4,
.baseline-row h4 {
  margin: 0 0 3px;
  color: #0f172a;
}

.baseline-option p,
.baseline-row p {
  margin: 0;
  color: #64748b;
}

.baseline-list {
  display: grid;
  gap: 10px;
}

.baseline-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(120px, auto) auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  background: #fff;
}

.baseline-row__numbers {
  display: grid;
  gap: 2px;
}

.baseline-row__numbers span {
  color: #64748b;
  font-size: 0.82rem;
}

.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.summary-card {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  background: rgba(102, 126, 234, 0.05);
  display: grid;
  gap: 6px;
}

.summary-card span {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.summary-card strong {
  font-size: 1.15rem;
  color: #0f172a;
}

.helper-text {
  color: #64748b;
  font-size: 0.92rem;
}

.flow-action {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  padding: 12px 0;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.empty-title {
  font-weight: 600;
  color: #0f172a !important;
}

.suggestion-header {
  display: grid;
  gap: 4px;
  text-align: left;
  width: 100%;
}

.suggestion-header h3 {
  margin: 0;
  color: #0f172a;
}

.suggestion-header p {
  margin: 0;
  color: #64748b;
}

.suggestion-table {
  width: 100%;
}

.quick-baseline-panel {
  display: grid;
  grid-template-columns: minmax(240px, 420px) minmax(180px, 260px);
  gap: 12px;
  align-items: stretch;
  justify-content: center;
  width: 100%;
}

.quick-baseline-summary {
  min-height: 78px;
}

.manual-lines {
  display: grid;
  gap: 12px;
  width: 100%;
}

.manual-line {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(160px, 0.7fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.04);
}

.line-type {
  margin-left: 6px;
  font-size: 0.72rem;
  color: #64748b;
}

.empty-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.negative-value {
  color: #dc2626;
}

@media (max-width: 760px) {
  .section-heading,
  .baseline-option,
  .baseline-row {
    grid-template-columns: 1fr;
  }

  .section-heading {
    display: grid;
  }

  .quick-baseline-panel {
    grid-template-columns: 1fr;
  }

  .manual-line {
    grid-template-columns: 1fr;
  }

  .manual-line :deep(.v-btn-toggle) {
    width: 100%;
  }

  .manual-line :deep(.v-btn-toggle .v-btn) {
    flex: 1 1 0;
  }
}
</style>
