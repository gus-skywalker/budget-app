<template>
  <div class="cb-page">
    <div class="cb-container">
      <!-- Page header with summary strip (shows when active budget exists) -->
      <page-header :title="t('planning.budget.title')" :summary-items="budgetSummaryItems">
        <template #actions>
          <v-btn
            v-if="activeBudget"
            class="cb-btn-primary"
            @click="goToScenarioCreation"
          >
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            {{ t('planning.budget.create_scenario') }}
          </v-btn>
        </template>
      </page-header>

      <!-- Alerts -->
      <alert-strip v-if="emptyBudgetMessage" variant="info" :description="emptyBudgetMessage" />
      <alert-strip v-if="bannerMessage" variant="info" :description="bannerMessage" />

      <!-- Loading -->
      <div v-if="isLoading" class="cb-empty-state">
        <v-icon size="40">mdi-timer-sand</v-icon>
        <p>{{ t('planning.budget.loading_baselines') }}</p>
      </div>

      <template v-else>
        <!-- Active budget card -->
        <div v-if="activeBudget" class="cb-card cb-active-budget-card">
          <div class="cb-active-budget-card__kicker">{{ t('planning.budget.active_baseline') }}</div>
          <div class="cb-active-budget-card__head">
            <h2 class="cb-active-budget-card__title">{{ baselineTitle(activeBudget) }}</h2>
            <v-chip color="success" variant="tonal" size="small">{{ t('planning.budget.used_by_scenarios') }}</v-chip>
          </div>
          <div class="cb-active-budget-card__meta">
            <span>{{ activeBudget.periodMonth }}/{{ activeBudget.periodYear }}</span>
            <span>{{ t('planning.budget.lines_count', { count: activeBudget.lines?.length || 0 }) }}</span>
            <span>{{ baselineSourceLabel(activeBudget) }}</span>
          </div>
          <div class="cb-active-budget-card__baseline">
            <span>{{ t('planning.budget.scenario_starting_point') }}</span>
            <strong :class="activeBudget.net < 0 ? 'cb-summary-item__value--negative' : 'cb-summary-item__value--positive'">
              {{ formatCurrency(activeBudget.net) }}/{{ t('planning.budget.month_short') }}
            </strong>
          </div>
          <alert-strip v-if="activeBaselineNotice" variant="info" :description="activeBaselineNotice" />
        </div>

        <!-- Empty state — no active budget, no editors open -->
        <div v-else-if="!showSuggestionEditor && !showManualEditor" class="cb-empty-state">
          <v-icon size="40">mdi-wallet-plus-outline</v-icon>
          <p class="cb-empty-state__title">{{ t('planning.budget.empty_start_title') }}</p>
          <p>{{ t('planning.budget.empty_start_description') }}</p>
          <p v-if="!canManageBudget">{{ t('planning.budget.manage_permission_hint') }}</p>
        </div>

        <!-- Create baseline options (always shown when admin and no editor open) -->
        <div v-if="canManageBudget && !showSuggestionEditor && !showManualEditor" class="cb-baseline-options">
          <div class="cb-baseline-option cb-card">
            <v-icon color="var(--cb-positive)" size="26">mdi-bank-transfer-in</v-icon>
            <div class="cb-baseline-option__body">
              <span class="cb-baseline-option__tag">{{ t('planning.budget.source_tag_suggested') }}</span>
              <h4>{{ t('planning.budget.suggested_from_transactions') }}</h4>
              <p>{{ suggestionMessage }}</p>
            </div>
            <v-btn
              class="cb-btn-primary"
              :loading="isGeneratingSuggestion"
              :disabled="isGeneratingSuggestion"
              @click="generateSuggestion"
            >
              <v-icon start>mdi-auto-fix</v-icon>
              {{ t('planning.budget.generate_suggested_budget') }}
            </v-btn>
          </div>

          <div class="cb-baseline-option cb-card">
            <v-icon color="var(--cb-accent)" size="26">mdi-finance</v-icon>
            <div class="cb-baseline-option__body">
              <span class="cb-baseline-option__tag">{{ t('planning.budget.source_tag_real') }}</span>
              <h4>{{ t('planning.budget.real_baseline_openfinance') }}</h4>
              <p>{{ consolidatedBaselineMessage }}</p>
            </div>
            <v-btn
              class="cb-btn-accent"
              :loading="isGeneratingRealBaseline"
              :disabled="isGeneratingRealBaseline"
              @click="generateRealBaseline"
            >
              <v-icon start>mdi-chart-box-outline</v-icon>
              {{ t('planning.budget.generate_real_baseline') }}
            </v-btn>
          </div>

          <div class="cb-baseline-option cb-card">
            <v-icon color="var(--cb-primary)" size="26">mdi-pencil-outline</v-icon>
            <div class="cb-baseline-option__body">
              <span class="cb-baseline-option__tag">{{ t('planning.budget.source_tag_manual') }}</span>
              <h4>{{ t('planning.budget.quick_manual_baseline') }}</h4>
              <p>{{ t('planning.budget.quick_manual_description') }}</p>
            </div>
            <v-btn :variant="hasSuggestionData ? 'tonal' : 'flat'" class="cb-btn-secondary" @click="startManualBudget">
              <v-icon start>mdi-plus-circle-outline</v-icon>
              {{ t('planning.budget.create_manually') }}
            </v-btn>
          </div>
        </div>

        <!-- Alternative budgets -->
        <div v-if="canManageBudget && usableAlternativeBudgets.length" class="cb-card cb-alt-budgets">
          <p class="cb-alt-budgets__kicker">{{ t('planning.budget.available_baselines') }}</p>
          <h3 class="cb-alt-budgets__title">{{ t('planning.budget.other_versions_for_period', { month: now.getMonth() + 1, year: now.getFullYear() }) }}</h3>
          <div class="cb-alt-budgets__list">
            <div
              v-for="budget in usableAlternativeBudgets"
              :key="budget.id"
              class="cb-alt-budget-row"
            >
              <div class="cb-alt-budget-row__info">
                <h4>{{ baselineTitle(budget) }}</h4>
                <p>{{ baselineSourceLabel(budget) }} · {{ t('planning.budget.lines_count', { count: budget.lines?.length || 0 }) }}</p>
              </div>
              <div class="cb-alt-budget-row__numbers">
                <span>{{ t('planning.budget.net') }}</span>
                <strong :class="{ 'cb-summary-item__value--negative': budget.net < 0 }">{{ formatCurrency(budget.net) }}</strong>
              </div>
              <v-btn
                class="cb-btn-secondary"
                variant="tonal"
                :loading="activatingBudgetId === budget.id"
                :disabled="Boolean(activatingBudgetId)"
                @click="activateExistingBudget(budget)"
              >
                {{ t('planning.budget.set_active') }}
              </v-btn>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Editor drawer (right side) -->
    <v-navigation-drawer
      :model-value="showSuggestionEditor || showManualEditor"
      location="right"
      width="480"
      temporary
      @update:model-value="(v) => { if (!v) closeEditor() }"
    >
      <div class="cb-drawer-header">
        <div class="cb-drawer-header__title">
          {{ showSuggestionEditor ? t('planning.budget.suggested_budget') : t('planning.budget.quick_baseline') }}
        </div>
        <v-btn icon variant="text" @click="closeEditor">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Suggestion editor -->
      <div v-if="showSuggestionEditor && suggestion" class="cb-editor-body">
        <p class="cb-editor-body__note">{{ t('planning.budget.suggestion_lookback', { count: suggestion.lookbackMonths || 3 }) }}</p>

        <div class="cb-budget-summary-grid">
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.suggested_income') }}</span>
            <strong class="cb-summary-item__value--positive">{{ formatCurrency(suggestedIncomeTotal) }}</strong>
          </div>
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.suggested_expense') }}</span>
            <strong class="cb-summary-item__value--negative">{{ formatCurrency(suggestedExpenseTotal) }}</strong>
          </div>
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.net') }}</span>
            <strong :class="suggestedNetTotal < 0 ? 'cb-summary-item__value--negative' : 'cb-summary-item__value--positive'">{{ formatCurrency(suggestedNetTotal) }}</strong>
          </div>
        </div>

        <v-table density="comfortable" class="cb-suggestion-table">
          <thead>
            <tr>
              <th>{{ t('planning.budget.category') }}</th>
              <th>{{ t('planning.budget.suggested') }}</th>
              <th>{{ t('planning.budget.confidence') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in editableSuggestionLines" :key="`${line.type}-${line.category}-${index}`">
              <td>{{ line.category }} <span class="cb-line-type">{{ line.type }}</span></td>
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

        <div class="cb-editor-actions">
          <v-btn
            class="cb-btn-primary"
            :loading="isUsingSuggestedPlan"
            :disabled="isUsingSuggestedPlan || !hasSuggestedBudgetValues"
            @click="useSuggestedPlan"
          >
            <v-icon start>mdi-check-circle-outline</v-icon>
            {{ t('planning.budget.activate_this_plan') }}
          </v-btn>
          <v-btn variant="text" color="var(--cb-ink-muted)" @click="cancelSuggestion">
            {{ t('common.cancel') }}
          </v-btn>
        </div>
      </div>

      <!-- Manual editor — quick mode -->
      <div v-else-if="showManualEditor && manualMode === 'quick'" class="cb-editor-body">
        <p class="cb-editor-body__note">{{ t('planning.budget.quick_baseline_description') }}</p>
        <div class="cb-quick-baseline-row">
          <v-text-field
            v-model.number="quickBaselineAmount"
            :label="t('planning.budget.monthly_net_cashflow')"
            type="number"
            density="comfortable"
            variant="outlined"
            prefix="R$"
            hide-details
          />
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.baseline') }}</span>
            <strong :class="Number(quickBaselineAmount || 0) < 0 ? 'cb-summary-item__value--negative' : 'cb-summary-item__value--positive'">
              {{ formatCurrency(Number(quickBaselineAmount || 0)) }}
            </strong>
          </div>
        </div>
        <div class="cb-editor-actions">
          <v-btn
            class="cb-btn-primary"
            :loading="isCreatingManualBudget"
            :disabled="isCreatingManualBudget || !hasQuickBaselineValue"
            @click="createQuickBaselineBudget"
          >
            <v-icon start>mdi-check-circle-outline</v-icon>
            {{ t('planning.budget.activate_quick_baseline') }}
          </v-btn>
          <v-btn variant="tonal" color="var(--cb-primary)" @click="startDetailedManualBudget">
            <v-icon start>mdi-format-list-bulleted</v-icon>
            {{ t('planning.budget.use_detailed_budget') }}
          </v-btn>
          <v-btn variant="text" color="var(--cb-ink-muted)" @click="cancelManualBudget">
            {{ t('common.cancel') }}
          </v-btn>
        </div>
      </div>

      <!-- Manual editor — detailed mode -->
      <div v-else-if="showManualEditor" class="cb-editor-body">
        <p class="cb-editor-body__note">{{ t('planning.budget.detailed_manual_description') }}</p>

        <div class="cb-budget-summary-grid">
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.income') }}</span>
            <strong class="cb-summary-item__value--positive">{{ formatCurrency(manualIncomeTotal) }}</strong>
          </div>
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.expense') }}</span>
            <strong class="cb-summary-item__value--negative">{{ formatCurrency(manualExpenseTotal) }}</strong>
          </div>
          <div class="cb-budget-summary-item">
            <span>{{ t('planning.budget.net') }}</span>
            <strong :class="manualNetTotal < 0 ? 'cb-summary-item__value--negative' : 'cb-summary-item__value--positive'">{{ formatCurrency(manualNetTotal) }}</strong>
          </div>
        </div>

        <div class="cb-manual-lines">
          <div
            v-for="(line, index) in editableManualLines"
            :key="line.id"
            class="cb-manual-line"
          >
            <v-text-field
              v-model="line.category"
              :label="t('planning.budget.category')"
              density="comfortable"
              variant="outlined"
              hide-details
            />
            <v-btn-toggle v-model="line.type" mandatory divided color="var(--cb-primary)">
              <v-btn value="INCOME">{{ t('planning.budget.income') }}</v-btn>
              <v-btn value="EXPENSE">{{ t('planning.budget.expense') }}</v-btn>
            </v-btn-toggle>
            <v-text-field
              v-model.number="line.plannedAmount"
              :label="t('planning.budget.monthly_amount')"
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

        <div class="cb-editor-actions">
          <v-btn variant="tonal" color="var(--cb-primary)" @click="addManualLine">
            <v-icon start>mdi-plus</v-icon>
            {{ t('planning.budget.add_line') }}
          </v-btn>
          <v-btn
            class="cb-btn-primary"
            :loading="isCreatingManualBudget"
            :disabled="isCreatingManualBudget || !hasManualBudgetValues"
            @click="createManualBudget"
          >
            <v-icon start>mdi-check-circle-outline</v-icon>
            {{ t('planning.budget.activate_detailed_budget') }}
          </v-btn>
          <v-btn variant="text" color="var(--cb-ink-muted)" @click="startManualBudget">
            {{ t('planning.budget.quick_baseline') }}
          </v-btn>
          <v-btn variant="text" color="var(--cb-ink-muted)" @click="cancelManualBudget">
            {{ t('common.cancel') }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>
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
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

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
const hasVisibleOpenFinanceConnection = computed(() =>
  visibleOpenFinanceConnections.value.some(isConnectedOpenFinanceConnection)
)
const hasVisiblePlanningSharedConnection = computed(() =>
  visibleOpenFinanceConnections.value.some(isPlanningSharedConnection)
)
const hasVisiblePrivateOnlyPlanningSource = computed(() =>
  visibleOpenFinanceConnections.value.some(isPrivateOnlyPlanningSource)
)
const planningSharingDisabledNotice = computed(() =>
  hasVisiblePrivateOnlyPlanningSource.value && !hasVisiblePlanningSharedConnection.value
)
const suggestionMessage = computed(() =>
  hasSuggestionData.value
    ? t('planning.budget.suggestion_message_ready')
    : planningSharingDisabledNotice.value
      ? t('planning.budget.suggestion_message_sharing_disabled')
      : hasVisibleOpenFinanceConnection.value
        ? t('planning.budget.suggestion_message_synced_no_data')
        : t('planning.budget.suggestion_message_unavailable')
)
const consolidatedBaselineMessage = computed(() =>
  planningSharingDisabledNotice.value
    ? t('planning.budget.consolidated_message_sharing_disabled')
    : hasVisibleOpenFinanceConnection.value
      ? t('planning.budget.consolidated_message_ready')
      : t('planning.budget.consolidated_message_connect')
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

const budgetSummaryItems = computed(() => {
  if (!activeBudget.value) return []
  const b = activeBudget.value
  return [
    { label: t('planning.budget.total_income'), value: formatCurrency(b.totalIncome), valueClass: 'cb-summary-item__value--positive' },
    { divider: true },
    { label: t('planning.budget.total_expense'), value: formatCurrency(b.totalExpense), valueClass: 'cb-summary-item__value--negative' },
    { divider: true },
    { label: t('planning.budget.net'), value: formatCurrency(b.net), valueClass: b.net < 0 ? 'cb-summary-item__value--negative' : 'cb-summary-item__value--positive' },
  ]
})

const closeEditor = () => {
  showSuggestionEditor.value = false
  showManualEditor.value = false
}

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

const isConnectedOpenFinanceConnection = (connection: OpenFinanceConnection): boolean =>
  connection.status === 'CONNECTED' || connection.status === 'ERROR'

const isPlanningSharedConnection = (connection: OpenFinanceConnection): boolean => {
  if (!isConnectedOpenFinanceConnection(connection)) return false
  if (connection.payerDocumentType === 'CNPJ') {
    return connection.sharingPolicy === 'BUSINESS_SHARED' || connection.accessScope === 'WORKSPACE_SHARED'
  }
  return connection.planningSharingLevel === 'PLANNING_IMPACT_ONLY' || connection.sharingPolicy === 'PLANNING_IMPACT_ONLY'
}

const isPrivateOnlyPlanningSource = (connection: OpenFinanceConnection): boolean =>
  isConnectedOpenFinanceConnection(connection) &&
  connection.payerDocumentType === 'CPF' &&
  (connection.planningSharingLevel === 'PRIVATE' || connection.sharingPolicy === 'PRIVATE_ONLY')

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
        : hasVisibleOpenFinanceConnection.value
          ? t('planning.budget.generate_real_no_data')
          : t('planning.budget.generate_real_no_connection')
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
/* Active budget card */
.cb-active-budget-card {
  margin-bottom: 24px;
}

.cb-active-budget-card__kicker {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cb-ink-muted);
  margin-bottom: 6px;
}

.cb-active-budget-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.cb-active-budget-card__title {
  font-family: var(--cb-font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cb-ink);
  margin: 0;
}

.cb-active-budget-card__meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 12px;
}

.cb-active-budget-card__baseline {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--cb-border, rgba(23,32,51,.08));
  border-radius: 8px;
  background: rgba(255,255,255,.72);
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 12px;
}

.cb-active-budget-card__baseline strong {
  font-family: var(--cb-font-heading);
  font-size: .95rem;
}

/* Baseline option cards */
.cb-baseline-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.cb-baseline-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.cb-baseline-option__body {
  flex: 1;
}

.cb-baseline-option__body h4 {
  font-family: var(--cb-font-heading);
  font-size: .95rem;
  font-weight: 700;
  color: var(--cb-ink);
  margin: 0 0 4px;
}

.cb-baseline-option__tag {
  display: inline-block;
  margin-bottom: 5px;
  font-size: .68rem;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cb-ink-muted);
}

.cb-baseline-option__body p {
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin: 0;
}

/* Alternative budgets */
.cb-alt-budgets {
  margin-top: 24px;
}

.cb-alt-budgets__kicker {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cb-ink-muted);
  margin: 0 0 4px;
}

.cb-alt-budgets__title {
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--cb-ink);
  margin: 0 0 16px;
}

.cb-alt-budgets__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cb-alt-budget-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--cb-border, rgba(23,32,51,.08));
}

.cb-alt-budget-row__info {
  flex: 1;
}

.cb-alt-budget-row__info h4 {
  font-family: var(--cb-font-heading);
  font-size: .9rem;
  font-weight: 700;
  color: var(--cb-ink);
  margin: 0 0 2px;
}

.cb-alt-budget-row__info p {
  font-size: .8rem;
  color: var(--cb-ink-muted);
  margin: 0;
}

.cb-alt-budget-row__numbers {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: .8rem;
  color: var(--cb-ink-muted);
}

.cb-alt-budget-row__numbers strong {
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  color: var(--cb-ink);
}

/* Editor drawer */
.cb-editor-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.cb-editor-body__note {
  font-size: .875rem;
  color: var(--cb-ink-secondary);
  margin: 0;
  line-height: 1.5;
}

.cb-budget-summary-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cb-budget-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
}

.cb-budget-summary-item strong {
  font-family: var(--cb-font-heading);
  font-size: 1.1rem;
  color: var(--cb-ink);
}

.cb-suggestion-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--cb-border, rgba(23,32,51,.08));
}

.cb-line-type {
  font-size: .75rem;
  color: var(--cb-ink-muted);
  margin-left: 4px;
}

.cb-quick-baseline-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cb-manual-lines {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cb-manual-line {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 8px;
  align-items: center;
}

.cb-editor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--cb-border, rgba(23,32,51,.08));
}

@media (max-width: 600px) {
  .cb-baseline-option {
    flex-direction: column;
    align-items: flex-start;
  }

  .cb-manual-line {
    grid-template-columns: 1fr;
  }

  .cb-alt-budget-row {
    flex-wrap: wrap;
  }
}
</style>
