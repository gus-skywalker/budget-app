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
                <v-btn color="#667eea" :loading="isUsingSuggestedPlan" @click="useSuggestedPlan">
                  <v-icon start>mdi-check-circle-outline</v-icon>
                  Use This Plan
                </v-btn>
                <v-btn variant="text" color="#64748b" @click="cancelSuggestion">
                  Cancel
                </v-btn>
              </div>
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
                <v-btn variant="text" color="#667eea" :loading="isCreatingMinimalBudget" @click="createMinimalBudget">
                  <v-icon start>mdi-pencil-outline</v-icon>
                  Create Budget Manually
                </v-btn>
              </div>
            </template>

            <template v-else>
              <v-icon color="#94a3b8" size="28">mdi-wallet-plus-outline</v-icon>
              <p class="empty-title">Start your financial plan</p>
              <div class="empty-actions">
                <v-btn color="#667eea" :loading="isCreatingMinimalBudget" @click="createMinimalBudget">
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
import BudgetService, { type Budget, type BudgetSuggestion, type BudgetSuggestionLine } from '@/services/BudgetService'

const router = useRouter()
const { locale } = useI18n()

const isLoading = ref(false)
const isCreatingMinimalBudget = ref(false)
const isGeneratingSuggestion = ref(false)
const isUsingSuggestedPlan = ref(false)
const activeBudget = ref<Budget | null>(null)
const suggestion = ref<BudgetSuggestion | null>(null)
const hasSuggestionData = ref(false)
const showSuggestionEditor = ref(false)
const bannerMessage = ref('')
const editableSuggestionLines = ref<BudgetSuggestionLine[]>([])

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

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const loadCurrentBudget = async () => {
  isLoading.value = true
  try {
    const { data, status } = await BudgetService.getCurrent(now.value.getMonth() + 1, now.value.getFullYear())
    if (status === 204 || !data || typeof data !== 'object' || !('id' in data)) {
      activeBudget.value = null
      await preloadSuggestionAvailability()
      return
    }
    activeBudget.value = data as Budget
    suggestion.value = null
    hasSuggestionData.value = false
    showSuggestionEditor.value = false
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
      })),
    })
    activeBudget.value = data
    showSuggestionEditor.value = false
    bannerMessage.value = 'Review and activate your plan'
  } catch (error) {
    console.error(error)
  } finally {
    isUsingSuggestedPlan.value = false
  }
}

const createMinimalBudget = async () => {
  isCreatingMinimalBudget.value = true
  try {
    const { data: createdBudget } = await BudgetService.create({
      periodMonth: now.value.getMonth() + 1,
      periodYear: now.value.getFullYear(),
      status: 'ACTIVE',
    })

    if (!createdBudget?.id) {
      await goToScenarioCreation()
      return
    }

    await Promise.all([
      BudgetService.addLine(createdBudget.id, { category: 'Revenue', type: 'INCOME', plannedAmount: 0 }),
      BudgetService.addLine(createdBudget.id, { category: 'Operations', type: 'EXPENSE', plannedAmount: 0 }),
    ])

    await BudgetService.activate(createdBudget.id)
    await loadCurrentBudget()
    await goToScenarioCreation()
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingMinimalBudget.value = false
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
</style>
