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
            Current Financial Plan
          </h2>
        </div>
        <div class="card-content">
          <div v-if="isLoading" class="helper-text">Loading active budget...</div>

          <div v-else-if="!activeBudget" class="empty-state">
            <v-alert
              v-if="emptyBudgetMessage"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-2"
            >
              {{ emptyBudgetMessage }}
            </v-alert>

            <template v-if="showSuggestionEditor && suggestion">
              <div class="suggestion-header">
                <h3>Suggested Budget</h3>
                <p>This suggestion is based on your last {{ suggestion.lookbackMonths || 3 }} months average.</p>
              </div>

              <div class="summary-grid">
                <div class="summary-card">
                  <span>Suggested income</span>
                  <strong>{{ formatCurrency(suggestedIncomeTotal) }}</strong>
                </div>
                <div class="summary-card">
                  <span>Suggested expense</span>
                  <strong>{{ formatCurrency(suggestedExpenseTotal) }}</strong>
                </div>
                <div class="summary-card">
                  <span>Net</span>
                  <strong :class="{ 'negative-value': suggestedNetTotal < 0 }">{{ formatCurrency(suggestedNetTotal) }}</strong>
                </div>
              </div>

              <v-table density="comfortable" class="suggestion-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Suggested</th>
                    <th>Confidence</th>
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
                  Activate This Plan
                </v-btn>
                <v-btn variant="text" color="#64748b" @click="cancelSuggestion">
                  Cancel
                </v-btn>
              </div>
            </template>

            <template v-else-if="showManualEditor">
              <template v-if="manualMode === 'quick'">
                <div class="suggestion-header">
                  <h3>Quick Baseline</h3>
                  <p>Enter the expected monthly net cashflow. Use a positive value for surplus or a negative value for shortfall.</p>
                </div>

                <div class="quick-baseline-panel">
                  <v-text-field
                    v-model.number="quickBaselineAmount"
                    label="Monthly net cashflow"
                    type="number"
                    density="comfortable"
                    variant="outlined"
                    prefix="R$"
                    hide-details
                  />
                  <div class="summary-card quick-baseline-summary">
                    <span>Baseline</span>
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
                    Activate Quick Baseline
                  </v-btn>
                  <v-btn variant="tonal" color="#667eea" @click="startDetailedManualBudget">
                    <v-icon start>mdi-format-list-bulleted</v-icon>
                    Use Detailed Budget
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="cancelManualBudget">
                    Cancel
                  </v-btn>
                </div>
              </template>

              <template v-else>
                <div class="suggestion-header">
                  <h3>Detailed Manual Budget</h3>
                  <p>Add real income and expense lines. This becomes the active baseline for scenarios.</p>
                </div>

                <div class="summary-grid">
                  <div class="summary-card">
                    <span>Income</span>
                    <strong>{{ formatCurrency(manualIncomeTotal) }}</strong>
                  </div>
                  <div class="summary-card">
                    <span>Expense</span>
                    <strong>{{ formatCurrency(manualExpenseTotal) }}</strong>
                  </div>
                  <div class="summary-card">
                    <span>Net</span>
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
                      label="Category"
                      density="comfortable"
                      variant="outlined"
                      hide-details
                    />
                    <v-btn-toggle v-model="line.type" mandatory divided color="#667eea">
                      <v-btn value="INCOME">Income</v-btn>
                      <v-btn value="EXPENSE">Expense</v-btn>
                    </v-btn-toggle>
                    <v-text-field
                      v-model.number="line.plannedAmount"
                      label="Monthly amount"
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
                    Add Line
                  </v-btn>
                  <v-btn
                    color="#667eea"
                    :loading="isCreatingManualBudget"
                    :disabled="isCreatingManualBudget || !hasManualBudgetValues"
                    @click="createManualBudget"
                  >
                    <v-icon start>mdi-check-circle-outline</v-icon>
                    Activate Detailed Budget
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="startManualBudget">
                    Quick Baseline
                  </v-btn>
                  <v-btn variant="text" color="#64748b" @click="cancelManualBudget">
                    Cancel
                  </v-btn>
                </div>
              </template>
            </template>

            <template v-else-if="hasSuggestionData">
              <v-icon color="#10b981" size="28">mdi-chart-line-variant</v-icon>
              <p class="empty-title">Start from your real data</p>
              <p class="helper-text">We found financial activity. We can suggest a plan based on your recent transactions.</p>
              <div class="empty-actions">
                <v-btn color="#667eea" :loading="isGeneratingSuggestion" @click="generateSuggestion">
                  <v-icon start>mdi-auto-fix</v-icon>
                  Generate Suggested Budget
                </v-btn>
                <v-btn variant="text" color="#667eea" @click="startManualBudget">
                  <v-icon start>mdi-pencil-outline</v-icon>
                  Create Budget Manually
                </v-btn>
              </div>
            </template>

            <template v-else>
              <v-icon color="#94a3b8" size="28">mdi-wallet-plus-outline</v-icon>
              <p class="empty-title">Start your financial plan</p>
              <div class="empty-actions">
                <v-btn color="#667eea" @click="startManualBudget">
                  <v-icon start>mdi-plus-circle-outline</v-icon>
                  Create Budget Manually
                </v-btn>
              </div>
            </template>
          </div>

          <template v-else>
            <v-alert
              v-if="bannerMessage"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-3"
            >
              {{ bannerMessage }}
            </v-alert>
            <div class="summary-grid">
              <div class="summary-card">
                <span>Total income</span>
                <strong>{{ formatCurrency(activeBudget.totalIncome) }}</strong>
              </div>
              <div class="summary-card">
                <span>Total expense</span>
                <strong>{{ formatCurrency(activeBudget.totalExpense) }}</strong>
              </div>
              <div class="summary-card">
                <span>Net</span>
                <strong :class="{ 'negative-value': activeBudget.net < 0 }">{{ formatCurrency(activeBudget.net) }}</strong>
              </div>
            </div>

            <div class="helper-text">
              Baseline period: {{ activeBudget.periodMonth }}/{{ activeBudget.periodYear }} · {{ activeBudget.lines?.length || 0 }} lines
            </div>

            <div class="flow-action">
              <v-btn color="#667eea" size="large" @click="goToScenarioCreation">
                <v-icon start>mdi-chart-timeline-variant</v-icon>
                Create Scenario
              </v-btn>
            </div>
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

type ManualBudgetLine = {
  id: string
  category: string
  type: BudgetLineType
  plannedAmount: number
}

type ManualBudgetMode = 'quick' | 'detailed'

const router = useRouter()
const { locale } = useI18n()

const isLoading = ref(false)
const isCreatingManualBudget = ref(false)
const isGeneratingSuggestion = ref(false)
const isUsingSuggestedPlan = ref(false)
const activeBudget = ref<Budget | null>(null)
const suggestion = ref<BudgetSuggestion | null>(null)
const hasSuggestionData = ref(false)
const showSuggestionEditor = ref(false)
const showManualEditor = ref(false)
const bannerMessage = ref('')
const emptyBudgetMessage = ref('')
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

const loadCurrentBudget = async () => {
  isLoading.value = true
  emptyBudgetMessage.value = ''
  try {
    const { data, status } = await BudgetService.getCurrent(now.value.getMonth() + 1, now.value.getFullYear())
    if (status === 204 || !data || typeof data !== 'object' || !('id' in data)) {
      activeBudget.value = null
      await preloadSuggestionAvailability()
      return
    }
    const currentBudget = data as Budget
    if (!hasUsableBudgetBaseline(currentBudget)) {
      activeBudget.value = null
      emptyBudgetMessage.value = 'Your current plan is empty. Add real baseline values or generate a plan from recent financial activity before creating scenarios.'
      await preloadSuggestionAvailability()
      return
    }

    activeBudget.value = currentBudget
    suggestion.value = null
    hasSuggestionData.value = false
    showSuggestionEditor.value = false
    showManualEditor.value = false
  } catch (error) {
    console.error(error)
    activeBudget.value = null
  } finally {
    isLoading.value = false
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
  try {
    const { data } = await BudgetService.getSuggestions(now.value.getMonth() + 1, now.value.getFullYear())
    suggestion.value = data
    editableSuggestionLines.value = (data?.lines || []).map((line) => ({
      ...line,
      suggestedAmount: Number(line.suggestedAmount || 0),
    }))
    showSuggestionEditor.value = editableSuggestionLines.value.length > 0
    hasSuggestionData.value = editableSuggestionLines.value.length > 0
  } catch (error) {
    console.error(error)
  } finally {
    isGeneratingSuggestion.value = false
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
    bannerMessage.value = 'Budget activated from recent financial activity.'
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
    createManualLine({ category: 'Revenue', type: 'INCOME' }),
    createManualLine({ category: 'Operations', type: 'EXPENSE' }),
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
    emptyBudgetMessage.value = 'Add a monthly net cashflow different from zero.'
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
    bannerMessage.value = 'Quick baseline activated. You can now create scenarios from this baseline.'
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingManualBudget.value = false
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
    emptyBudgetMessage.value = 'Add at least one income or expense line with a value greater than zero.'
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
    bannerMessage.value = 'Manual budget activated. You can now create scenarios from this baseline.'
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

onMounted(async () => {
  await loadCurrentBudget()
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
