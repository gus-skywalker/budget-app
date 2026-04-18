<template>
  <div class="planning-page">
    <v-container class="modern-container scenario-result">
      <div class="page-header">
        <div>
          <h1 class="page-title">Scenario results</h1>
          <p class="page-subtitle">Decision-focused outcome from your simulation</p>
        </div>
      </div>

      <div class="result-shell" v-if="result">
        <div class="hero-card">
          <span class="hero-card__label">Monthly impact</span>
          <strong :class="{ 'positive-value': result.scenarioMonthlyImpact > 0, 'negative-value': result.scenarioMonthlyImpact < 0 }">
            {{ formatSignedCurrency(result.scenarioMonthlyImpact) }}
          </strong>
          <p>{{ result.summary || consequenceMessage }}</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span>{{ t('planning.scenarios.final_balance') }}</span>
            <strong :class="{ 'negative-value': result.projectedFinalBalance < 0 }">{{ formatCurrency(result.projectedFinalBalance) }}</strong>
          </div>
          <div class="metric-card">
            <span>{{ t('planning.scenarios.status') }}</span>
            <strong :class="decisionTone">{{ decisionLabel }}</strong>
          </div>
          <div class="metric-card">
            <span>{{ t('planning.scenarios.available_for_goals') }}</span>
            <strong>{{ formatCurrency(result.availableForGoals) }}</strong>
          </div>
        </div>

        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>Forecast details</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="forecast-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('planning.scenarios.table_month') }}</th>
                      <th>{{ t('planning.scenarios.table_baseline') }}</th>
                      <th>{{ t('planning.scenarios.table_scenario') }}</th>
                      <th>{{ t('planning.scenarios.table_delta') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in result.forecast" :key="item.month">
                      <td>{{ item.month }}</td>
                      <td>{{ formatCurrency(item.baselineProjectedBalance) }}</td>
                      <td>{{ formatCurrency(item.scenarioProjectedBalance) }}</td>
                      <td :class="{ 'negative-value': item.deltaImpact < 0 }">{{ formatCurrency(item.deltaImpact) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>Impacted goals</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="result.impactedGoalNames?.length" class="goal-tags">
                <v-chip
                  v-for="goal in result.impactedGoalNames"
                  :key="goal"
                  size="small"
                  variant="tonal"
                  color="warning"
                  class="mr-2 mb-2"
                >
                  {{ goal }}
                </v-chip>
              </div>
              <p v-else>No impacted goals found for this simulation.</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div class="result-actions">
          <v-btn variant="tonal" color="#667eea" :loading="isSaving" @click="saveScenario">
            <v-icon start>mdi-content-save-outline</v-icon>
            {{ t('planning.scenarios.save') }}
          </v-btn>
          <v-btn color="#4f46e5" :loading="isCreatingDecision" :disabled="!scenarioId" @click="createDecisionFromScenario">
            <v-icon start>mdi-lightbulb-outline</v-icon>
            Create decision
          </v-btn>
          <v-btn variant="text" @click="editScenario">
            <v-icon start>mdi-pencil-outline</v-icon>
            Edit previous step
          </v-btn>
          <v-btn variant="text" @click="newScenario">
            <v-icon start>mdi-file-plus-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <div class="empty-results" v-else>
        <v-icon color="#94a3b8" size="28">mdi-chart-timeline-variant</v-icon>
        <p>{{ t('planning.scenarios.results_placeholder') }}</p>
        <v-btn color="#667eea" variant="tonal" @click="router.push({ name: 'planning-scenarios-new' })">
          Build scenario
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DecisionService from '@/services/DecisionService'
import ScenarioService, { type SavedScenario, type ScenarioSimulationResponse } from '@/services/ScenarioService'
import BudgetService from '@/services/BudgetService'
import {
  buildScenarioPayload,
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  clearWizardSnapshot,
  loadWizardSnapshot,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  type ScenarioWizardSnapshot,
} from '@/utils/scenarioWizard'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const result = ref<ScenarioSimulationResponse | null>(null)
const scenarioId = ref<string | null>(null)
const isSaving = ref(false)
const isCreatingDecision = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [],
  scenarioLines: [],
})

const decisionTone = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED') return 'negative-value'
  if (result.value?.decisionStatus === 'WATCH') return 'warning-value'
  return 'positive-value'
})

const decisionLabel = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (result.value?.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (result.value?.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
})

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' },
  )

const formatSignedCurrency = (value: number) => {
  const absolute = formatCurrency(Math.abs(value))
  return value > 0 ? `+${absolute}` : value < 0 ? `-${absolute}` : absolute
}

const consequenceMessage = computed(() => {
  if (!result.value) return ''
  if (result.value.scenarioMonthlyImpact < 0) {
    return t('planning.scenarios.consequence_negative', {
      amount: formatCurrency(Math.abs(result.value.scenarioMonthlyImpact)),
    })
  }
  if (result.value.scenarioMonthlyImpact > 0) {
    return t('planning.scenarios.consequence_positive', {
      amount: formatCurrency(result.value.scenarioMonthlyImpact),
    })
  }
  return t('planning.scenarios.consequence_neutral')
})

const loadResult = async () => {
  const routeId = String(route.params.id || '')
  const latestResult = window.sessionStorage.getItem('planning-scenario-latest-result')
  const restored = loadWizardSnapshot()

  if (restored) {
    Object.assign(snapshot, restored)
    scenarioId.value = restored.currentScenarioId
  }

  if (routeId === 'preview' && latestResult) {
    result.value = JSON.parse(latestResult) as ScenarioSimulationResponse
    return
  }

  if (!routeId) return

  try {
    const [{ data: scenarios }, { data: budget, status }] = await Promise.all([
      ScenarioService.list(),
      BudgetService.getCurrent(new Date().getMonth() + 1, new Date().getFullYear()),
    ])

    const saved = (Array.isArray(scenarios) ? scenarios : []).find((item) => item.id === routeId)
    if (!saved) return

    scenarioId.value = saved.id

    const currentBudget = status !== 204 && budget && typeof budget === 'object' && 'id' in budget ? budget : null
    const rebuilt = snapshotFromSavedScenario(saved as SavedScenario, currentBudget || undefined)
    if (currentBudget && !rebuilt.scenarioLines.length) {
      rebuilt.scenarioLines = buildScenarioLinesFromBudget(currentBudget)
    }

    Object.assign(snapshot, rebuilt)
    const { data } = await ScenarioService.simulate(buildSimulationPayload(snapshot))
    result.value = data
    saveWizardSnapshot(snapshot)
    window.sessionStorage.setItem('planning-scenario-latest-result', JSON.stringify(data))
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  }
}

const saveScenario = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true
  try {
    const { data } = await ScenarioService.save({
      ...buildScenarioPayload(snapshot),
      id: snapshot.currentScenarioId || undefined,
    })
    snapshot.currentScenarioId = data.id
    scenarioId.value = data.id
    saveWizardSnapshot(snapshot)
    successMessage.value = t('planning.scenarios.save_success', { name: data.name })
    if (route.params.id !== data.id) {
      await router.replace({ name: 'planning-scenarios-result', params: { id: data.id } })
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.save_error')
  } finally {
    isSaving.value = false
  }
}

const createDecisionFromScenario = async () => {
  if (!scenarioId.value) {
    errorMessage.value = 'Save scenario before creating decision.'
    return
  }

  isCreatingDecision.value = true
  errorMessage.value = ''
  try {
    const { data } = await DecisionService.createFromScenario(scenarioId.value)
    // Redireciona para a tela de detalhe da decisão (privada). Se não existir, pode usar a pública como fallback.
    if (data && data.id) {
      await router.push({ name: 'decision-detail', params: { id: data.id } })
    } else {
      // fallback: vai para lista de decisões
      await router.push({ name: 'decisions', query: { scenarios: scenarioId.value } })
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isCreatingDecision.value = false
  }
}

const editScenario = async () => {
  saveWizardSnapshot(snapshot)
  await router.push({ name: 'planning-scenarios-new' })
}

const newScenario = async () => {
  clearWizardSnapshot()
  window.sessionStorage.removeItem('planning-scenario-latest-result')
  await router.push({ name: 'planning-scenarios-new' })
}

onMounted(() => {
  void loadResult()
})
</script>

<style scoped>
.scenario-result {
  max-width: 1080px;
}

.result-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.hero-card {
  border-radius: 14px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.1), rgba(79, 70, 229, 0.04));
  border: 1px solid rgba(79, 70, 229, 0.25);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-card__label {
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 0.75rem;
  color: #4338ca;
  font-weight: 700;
}

.hero-card strong {
  font-size: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.metric-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card span {
  color: #64748b;
  font-size: 0.86rem;
}

.metric-card strong {
  font-size: 1.2rem;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.forecast-table {
  overflow-x: auto;
}

.forecast-table table {
  width: 100%;
  border-collapse: collapse;
}

.forecast-table th,
.forecast-table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
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

.warning-value {
  color: #b45309;
}
</style>
