<template>
  <div class="planning-page">
    <v-container class="modern-container scenario-wizard">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('planning.scenarios.title') }}</h1>
          <p class="page-subtitle">{{ t('planning.scenarios.subtitle') }}</p>
        </div>
      </div>

      <div class="wizard-shell">
        <div class="wizard-steps">
          <span class="wizard-step">Step {{ step }} of 4</span>
          <v-progress-linear :model-value="(step / 4) * 100" color="#667eea" height="8" rounded></v-progress-linear>
        </div>

        <div v-if="isBudgetLoading" class="empty-results">
          <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
          <p>{{ t('planning.scenarios.loading_budget_baseline') }}</p>
        </div>

        <div v-else-if="!activeBudget" class="empty-results">
          <v-icon color="#94a3b8" size="28">mdi-wallet-plus-outline</v-icon>
          <p>{{ t('planning.scenarios.empty_no_budget_title') }}</p>
          <v-btn color="#667eea" variant="tonal" @click="router.push({ name: 'planning-budget' })">
            <v-icon start>mdi-wallet-outline</v-icon>
            {{ t('planning.scenarios.empty_no_budget_cta') }}
          </v-btn>
        </div>

        <template v-else>
          <section v-show="step === 1" class="wizard-panel">
            <h2>Current budget context</h2>
            <p>Use this as a baseline. Changes are configured in the next steps.</p>
            <div class="metrics-grid">
              <div class="metric-card">
                <span>Total income</span>
                <strong>{{ formatCurrency(activeBudget.totalIncome) }}</strong>
              </div>
              <div class="metric-card">
                <span>Total expense</span>
                <strong>{{ formatCurrency(activeBudget.totalExpense) }}</strong>
              </div>
              <div class="metric-card">
                <span>Net</span>
                <strong :class="{ 'negative-value': activeBudget.net < 0 }">{{ formatCurrency(activeBudget.net) }}</strong>
              </div>
            </div>
          </section>

          <section v-show="step === 2" class="wizard-panel">
            <h2>Choose your intent</h2>
            <p>Pick one template to pre-fill your scenario.</p>
            <div class="template-grid">
              <button
                v-for="template in templates"
                :key="template.key"
                type="button"
                class="template-card"
                :class="{ 'template-card--active': selectedTemplate === template.key }"
                @click="selectTemplate(template.key)"
              >
                <div class="template-card__header">
                  <v-icon color="#667eea">{{ template.icon }}</v-icon>
                  <span>{{ template.title }}</span>
                </div>
                <p>{{ template.description }}</p>
              </button>
            </div>
          </section>

          <section v-show="step === 3" class="wizard-panel">
            <h2>Simple adjustments</h2>
            <p>Set only what changes. No technical fields required.</p>

            <v-text-field
              v-model="snapshot.scenarioName"
              :label="t('planning.scenarios.name')"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />

            <v-text-field
              v-model.number="snapshot.months"
              :label="t('planning.scenarios.months')"
              type="number"
              min="1"
              max="24"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />

            <div class="adjustments-list">
              <div v-for="adjustment in snapshot.adjustments" :key="adjustment.id" class="adjustment-card">
                <div class="adjustment-row">
                  <v-text-field
                    v-model="adjustment.label"
                    label="Label (optional)"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                  <v-btn-toggle v-model="adjustment.flow" mandatory divided color="#667eea">
                    <v-btn value="INCOME">Income</v-btn>
                    <v-btn value="EXPENSE">Expense</v-btn>
                  </v-btn-toggle>
                </div>

                <div class="adjustment-row adjustment-row--numbers">
                  <v-text-field
                    v-model.number="adjustment.monthlyChange"
                    label="Monthly change"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                  <v-text-field
                    v-model.number="adjustment.oneTimeChange"
                    label="One-time change"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                  <v-btn icon variant="text" color="error" @click="removeAdjustment(adjustment.id)">
                    <v-icon>mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="wizard-inline-actions">
              <v-btn variant="tonal" color="#667eea" @click="addAdjustment">
                <v-icon start>mdi-plus</v-icon>
                Add change
              </v-btn>
              <div class="impact-estimate">
                <span>Estimated monthly impact</span>
                <strong :class="{ 'positive-value': estimatedImpact > 0, 'negative-value': estimatedImpact < 0 }">
                  {{ formatSignedCurrency(estimatedImpact) }}
                </strong>
              </div>
            </div>
          </section>

          <section v-show="step === 4" class="wizard-panel">
            <h2>Ready to simulate</h2>
            <p>We will run your scenario and show the decision-focused result.</p>

            <div class="review-box">
              <div>
                <span>Scenario</span>
                <strong>{{ snapshot.scenarioName || t('planning.scenarios.default_name') }}</strong>
              </div>
              <div>
                <span>Time horizon</span>
                <strong>{{ snapshot.months }} months</strong>
              </div>
              <div>
                <span>Active changes</span>
                <strong>{{ activeChangesCount }}</strong>
              </div>
            </div>

            <v-btn
              color="#667eea"
              size="large"
              :loading="isSimulating"
              :disabled="isSimulating || !canSimulate"
              @click="simulate"
            >
              <v-icon start>mdi-chart-line-variant</v-icon>
              Simulate scenario
            </v-btn>
          </section>

          <div class="wizard-footer">
            <v-btn variant="text" :disabled="step === 1 || isSimulating" @click="step = Math.max(1, step - 1)">
              <v-icon start>mdi-arrow-left</v-icon>
              Back
            </v-btn>
            <v-btn
              color="#667eea"
              variant="tonal"
              :disabled="step === 4 || isSimulating"
              @click="step = Math.min(4, step + 1)"
            >
              Next
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </template>
      </div>

      <div class="saved-scenarios-panel">
        <div class="saved-scenarios-panel__header">
          <div>
            <h3>{{ t('planning.scenarios.saved_title') }}</h3>
            <p>{{ t('planning.scenarios.saved_subtitle') }}</p>
          </div>
        </div>

        <div v-if="isLoadingSavedScenarios" class="empty-results">
          <v-icon color="#94a3b8">mdi-timer-sand</v-icon>
          <p>{{ t('planning.scenarios.comparing') }}</p>
        </div>

        <div v-else-if="savedScenarios.length" class="saved-scenarios-list">
          <button
            v-for="scenario in savedScenarios"
            :key="scenario.id"
            type="button"
            class="saved-scenario-card"
            @click="openResult(scenario.id)"
          >
            <div class="saved-scenario-card__header">
              <strong>{{ scenario.name }}</strong>
              <span :class="['status-chip', scenarioTone(scenario)]">{{ scenarioLabel(scenario) }}</span>
            </div>

            <p>{{ scenario.summary || scenario.description || t('planning.scenarios.saved_no_summary') }}</p>

            <div class="saved-scenario-card__meta">
              <span>{{ t('planning.scenarios.monthly_impact') }}: {{ formatCurrency(Number(scenario.scenarioMonthlyImpact || 0)) }}</span>
            </div>

            <div class="saved-scenario-card__actions">
              <v-btn
                variant="text"
                density="comfortable"
                size="small"
                @click.stop="editScenario(scenario)"
              >
                <v-icon start>mdi-pencil-outline</v-icon>
                {{ t('planning.scenarios.edit_action') }}
              </v-btn>
              <v-btn
                variant="text"
                density="comfortable"
                size="small"
                color="error"
                @click.stop="deleteScenario(scenario)"
              >
                <v-icon start>mdi-delete-outline</v-icon>
                {{ t('planning.scenarios.delete_action') }}
              </v-btn>
            </div>
          </button>
        </div>

        <div v-else class="empty-results">
          <v-icon color="#94a3b8">mdi-content-save-outline</v-icon>
          <p>{{ t('planning.scenarios.saved_placeholder') }}</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BudgetService, { type Budget } from '@/services/BudgetService'
import ScenarioService, { type SavedScenario } from '@/services/ScenarioService'
import {
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  createAdjustment,
  hasAnyScenarioChange,
  loadWizardSnapshot,
  mapDeltasToSimpleAdjustments,
  monthlyImpactEstimate,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  templateDeltas,
  type ScenarioWizardSnapshot,
} from '@/utils/scenarioWizard'

const { t, locale } = useI18n()
const router = useRouter()

const step = ref(1)
const isBudgetLoading = ref(false)
const isSimulating = ref(false)
const isLoadingSavedScenarios = ref(false)
const errorMessage = ref('')
const activeBudget = ref<Budget | null>(null)
const selectedTemplate = ref<keyof typeof templateDeltas | null>(null)
const savedScenarios = ref<SavedScenario[]>([])

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [createAdjustment()],
  scenarioLines: [],
})

const templates = computed(() => [
  {
    key: 'reduce_costs' as const,
    icon: 'mdi-scissors-cutting',
    title: 'Reduce costs',
    description: 'Lower recurring and operational expenses.',
  },
  {
    key: 'increase_revenue' as const,
    icon: 'mdi-chart-line',
    title: 'Increase revenue',
    description: 'Test growth initiatives and expected uplift.',
  },
  {
    key: 'hiring' as const,
    icon: 'mdi-account-plus-outline',
    title: 'Hiring',
    description: 'Add team capacity and evaluate budget pressure.',
  },
  {
    key: 'investment' as const,
    icon: 'mdi-rocket-launch-outline',
    title: 'Investment',
    description: 'Simulate upfront investment and expected return.',
  },
])

const estimatedImpact = computed(() => monthlyImpactEstimate(snapshot))
const canSimulate = computed(() => hasAnyScenarioChange(snapshot))
const activeChangesCount = computed(() =>
  snapshot.adjustments.filter((item) => Number(item.monthlyChange || 0) > 0 || Number(item.oneTimeChange || 0) > 0).length,
)

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' },
  )

const formatSignedCurrency = (value: number) => {
  const absolute = formatCurrency(Math.abs(value))
  return value > 0 ? `+${absolute}` : value < 0 ? `-${absolute}` : absolute
}

const addAdjustment = () => {
  snapshot.adjustments.push(createAdjustment())
}

const removeAdjustment = (id: string) => {
  if (snapshot.adjustments.length === 1) {
    snapshot.adjustments = [createAdjustment()]
    return
  }
  snapshot.adjustments = snapshot.adjustments.filter((item) => item.id !== id)
}

const selectTemplate = (templateKey: keyof typeof templateDeltas) => {
  selectedTemplate.value = templateKey
  snapshot.currentScenarioId = null
  if (!snapshot.scenarioName.trim()) {
    const template = templates.value.find((item) => item.key === templateKey)
    snapshot.scenarioName = template?.title || t('planning.scenarios.default_name')
  }
  snapshot.adjustments = mapDeltasToSimpleAdjustments(templateDeltas[templateKey])
}

const loadBudget = async () => {
  isBudgetLoading.value = true
  try {
    const now = new Date()
    const { data, status } = await BudgetService.getCurrent(now.getMonth() + 1, now.getFullYear())
    if (status === 204 || !data || typeof data !== 'object' || !('id' in data)) {
      activeBudget.value = null
      return
    }

    activeBudget.value = data
    const restored = loadWizardSnapshot()
    if (restored?.budgetId && restored.budgetId === data.id) {
      Object.assign(snapshot, restored)
      return
    }

    snapshot.budgetId = data.id
    snapshot.periodMonth = data.periodMonth
    snapshot.periodYear = data.periodYear
    snapshot.scenarioLines = buildScenarioLinesFromBudget(data)
  } catch (e) {
    console.error(e)
    activeBudget.value = null
  } finally {
    isBudgetLoading.value = false
  }
}

const refreshSavedScenarios = async () => {
  isLoadingSavedScenarios.value = true
  try {
    const { data } = await ScenarioService.list()
    savedScenarios.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    savedScenarios.value = []
  } finally {
    isLoadingSavedScenarios.value = false
  }
}

const scenarioTone = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return 'status-chip--danger'
  if (scenario.decisionStatus === 'WATCH') return 'status-chip--warning'
  return 'status-chip--success'
}

const scenarioLabel = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (scenario.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (scenario.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
}

const openResult = async (scenarioId: string) => {
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

const editScenario = async (scenario: SavedScenario) => {
  const rebuilt = snapshotFromSavedScenario(scenario, activeBudget.value || undefined)
  Object.assign(snapshot, rebuilt)
  step.value = 3
  selectedTemplate.value = null
  saveWizardSnapshot(snapshot)
}

const deleteScenario = async (scenario: SavedScenario) => {
  const confirmed = window.confirm(t('planning.scenarios.delete_confirm', { name: scenario.name }))
  if (!confirmed) return

  errorMessage.value = ''
  try {
    await ScenarioService.remove(scenario.id)
    await refreshSavedScenarios()
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.delete_error')
  }
}

const simulate = async () => {
  errorMessage.value = ''
  isSimulating.value = true

  try {
    const payload = buildSimulationPayload(snapshot)
    const { data } = await ScenarioService.simulate(payload)
    saveWizardSnapshot(snapshot)
    window.sessionStorage.setItem('planning-scenario-latest-result', JSON.stringify(data))
    await router.push({ name: 'planning-scenarios-result', params: { id: snapshot.currentScenarioId || 'preview' } })
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isSimulating.value = false
  }
}

watch(
  snapshot,
  () => {
    if (!activeBudget.value) return
    saveWizardSnapshot(snapshot)
  },
  { deep: true },
)

onMounted(() => {
  void loadBudget()
  void refreshSavedScenarios()
})
</script>

<style scoped>
.scenario-wizard {
  max-width: 1080px;
}

.wizard-shell {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wizard-step {
  font-size: 0.84rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.wizard-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metrics-grid,
.review-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.metric-card,
.review-box > div {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card span,
.review-box span {
  color: #64748b;
  font-size: 0.86rem;
}

.metric-card strong,
.review-box strong {
  font-size: 1.2rem;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.template-card {
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  text-align: left;
  background: #fff;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover,
.template-card--active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}

.template-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 6px;
}

.adjustments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adjustment-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adjustment-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.adjustment-row--numbers {
  grid-template-columns: 1fr 1fr auto;
}

.wizard-inline-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.impact-estimate {
  display: flex;
  flex-direction: column;
  text-align: right;
  color: #475569;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.saved-scenarios-panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 20px;
  margin-top: 16px;
}

.saved-scenarios-panel__header h3 {
  margin: 0;
}

.saved-scenarios-panel__header p {
  color: #64748b;
  margin-top: 4px;
}

.saved-scenarios-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 12px;
}

.saved-scenario-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-scenario-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.saved-scenario-card__meta {
  color: #64748b;
  font-size: 0.86rem;
}

.saved-scenario-card__actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-chip {
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-chip--danger {
  color: #991b1b;
  background: rgba(185, 28, 28, 0.15);
}

.status-chip--warning {
  color: #92400e;
  background: rgba(217, 119, 6, 0.15);
}

.status-chip--success {
  color: #166534;
  background: rgba(22, 163, 74, 0.16);
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  padding: 40px 16px;
  text-align: center;
}

.positive-value {
  color: #0f766e;
}

.negative-value {
  color: #b91c1c;
}

@media (max-width: 720px) {
  .adjustment-row,
  .adjustment-row--numbers {
    grid-template-columns: 1fr;
  }
}
</style>
