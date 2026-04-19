<template>
  <div class="planning-page">
    <v-container class="modern-container scenario-editor">
      <div class="page-header">
        <div>
          <h1 class="page-title">Edit scenario</h1>
          <p class="page-subtitle">Update assumptions and re-run the simulation for this saved scenario.</p>
        </div>
        <v-btn variant="text" color="#667eea" @click="openScenarioResult">
          <v-icon start>mdi-arrow-left</v-icon>
          Back to results
        </v-btn>
      </div>

      <div class="editor-shell">
        <div v-if="isLoading" class="empty-results">
          <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
          <p>{{ t('planning.scenarios.comparing') }}</p>
        </div>

        <template v-else-if="snapshot.currentScenarioId">
          <div class="summary-strip">
            <div class="summary-item">
              <span>Scenario</span>
              <strong>{{ snapshot.scenarioName || t('planning.scenarios.default_name') }}</strong>
            </div>
            <div class="summary-item">
              <span>Horizon</span>
              <strong>{{ snapshot.months }} months</strong>
            </div>
            <div class="summary-item">
              <span>Estimated monthly impact</span>
              <strong :class="{ 'positive-value': estimatedImpact > 0, 'negative-value': estimatedImpact < 0 }">
                {{ formatSignedCurrency(estimatedImpact) }}
              </strong>
            </div>
          </div>

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

          <div class="section-header">
            <h3>Changes</h3>
            <p>Keep only the adjustments that matter for this scenario.</p>
          </div>

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

          <div class="editor-actions-inline">
            <v-btn variant="tonal" color="#667eea" @click="addAdjustment">
              <v-icon start>mdi-plus</v-icon>
              Add change
            </v-btn>
            <span class="hint-text">You can simulate without saving. Save is optional on result page.</span>
          </div>

          <div class="editor-footer">
            <v-btn variant="text" @click="router.push({ name: 'planning-scenarios' })">
              <v-icon start>mdi-layers-triple-outline</v-icon>
              Scenario list
            </v-btn>
            <v-btn
              color="#667eea"
              size="large"
              :loading="isSimulating"
              :disabled="isSimulating || !canSimulate"
              @click="simulate"
            >
              <v-icon start>mdi-chart-line-variant</v-icon>
              Simulate updates
            </v-btn>
          </div>
        </template>

        <div v-else class="empty-results">
          <v-icon color="#94a3b8" size="28">mdi-alert-circle-outline</v-icon>
          <p>Scenario not found.</p>
          <v-btn color="#667eea" variant="tonal" @click="router.push({ name: 'planning-scenarios' })">
            <v-icon start>mdi-arrow-left</v-icon>
            Back to scenarios
          </v-btn>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>
    </v-container>

    <v-dialog v-model="previewDialogOpen" max-width="820">
      <v-card v-if="previewResult">
        <v-card-title>Simulation preview</v-card-title>
        <v-card-text>
          <div class="preview-hero">
            <span>Monthly impact</span>
            <strong :class="{ 'positive-value': previewResult.scenarioMonthlyImpact > 0, 'negative-value': previewResult.scenarioMonthlyImpact < 0 }">
              {{ formatSignedCurrency(previewResult.scenarioMonthlyImpact) }}
            </strong>
            <p>{{ previewResult.summary || previewSummary }}</p>
          </div>

          <div class="preview-metrics">
            <div class="summary-item">
              <span>Projected final balance</span>
              <strong :class="{ 'negative-value': previewResult.projectedFinalBalance < 0 }">
                {{ formatCurrency(previewResult.projectedFinalBalance) }}
              </strong>
            </div>
            <div class="summary-item">
              <span>Status</span>
              <strong>{{ previewStatusLabel }}</strong>
            </div>
            <div class="summary-item">
              <span>Available for goals</span>
              <strong>{{ formatCurrency(previewResult.availableForGoals) }}</strong>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="previewDialogOpen = false">Continue editing</v-btn>
          <v-spacer />
          <v-btn variant="tonal" color="#667eea" :loading="isSaving" @click="saveScenarioFromPreview">
            <v-icon start>mdi-content-save-outline</v-icon>
            Save scenario
          </v-btn>
          <v-btn variant="tonal" color="#4f46e5" :loading="isCreatingDecision" @click="createDecisionFromPreview">
            <v-icon start>mdi-lightbulb-outline</v-icon>
            Save and create decision
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BudgetService from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'
import {
  buildScenarioPayload,
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  createAdjustment,
  hasAnyScenarioChange,
  monthlyImpactEstimate,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  type ScenarioWizardSnapshot,
} from '@/utils/scenarioWizard'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const isLoading = ref(false)
const isSimulating = ref(false)
const isSaving = ref(false)
const isCreatingDecision = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const previewDialogOpen = ref(false)
const previewResult = ref<Awaited<ReturnType<typeof ScenarioService.simulate>>['data'] | null>(null)

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [createAdjustment()],
  scenarioLines: [],
})

const estimatedImpact = computed(() => monthlyImpactEstimate(snapshot))
const canSimulate = computed(() => hasAnyScenarioChange(snapshot))
const previewStatusLabel = computed(() => {
  if (previewResult.value?.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (previewResult.value?.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (previewResult.value?.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
})
const previewSummary = computed(() => {
  if (!previewResult.value) return ''
  if (previewResult.value.scenarioMonthlyImpact > 0) {
    return t('planning.scenarios.consequence_positive', {
      amount: formatCurrency(previewResult.value.scenarioMonthlyImpact),
    })
  }
  if (previewResult.value.scenarioMonthlyImpact < 0) {
    return t('planning.scenarios.consequence_negative', {
      amount: formatCurrency(Math.abs(previewResult.value.scenarioMonthlyImpact)),
    })
  }
  return t('planning.scenarios.consequence_neutral')
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

const extractErrorStatus = (error: unknown): number =>
  Number((error as { response?: { status?: number } })?.response?.status || 0)

const buildVersionedScenarioName = (name?: string): string => {
  const base = String(name || '').trim() || t('planning.scenarios.default_name')
  if (!/\(new\)$/i.test(base)) return `${base} (new)`
  return `${base} ${new Date().toISOString().slice(11, 19)}`
}

const openScenarioResult = async () => {
  const id = String(route.params.id || '')
  await router.push({ name: 'planning-scenarios-result', params: { id } })
}

const loadScenario = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const routeId = String(route.params.id || '')
    if (!routeId) return

    const [{ data: scenarios }, { data: budget, status }, { data: decisions }] = await Promise.all([
      ScenarioService.list(),
      BudgetService.getCurrent(new Date().getMonth() + 1, new Date().getFullYear()),
      DecisionService.list(),
    ])
    const scenario = (Array.isArray(scenarios) ? scenarios : []).find((item) => item.id === routeId)
    if (!scenario) {
      errorMessage.value = t('planning.scenarios.error')
      return
    }

    const linkedDecision = (Array.isArray(decisions) ? decisions : []).find((decision) => decision.scenarioId === routeId)
    const totalVotes = Number(linkedDecision?.approveVotes || 0) + Number(linkedDecision?.rejectVotes || 0)
    const decisionStatus = String(linkedDecision?.status || '').toUpperCase()
    if (totalVotes > 0 || Boolean(decisionStatus && decisionStatus !== 'OPEN')) {
      await router.replace({ name: 'planning-scenarios-new', query: { cloneFrom: routeId, locked: '1' } })
      return
    }

    const currentBudget = status !== 204 && budget && typeof budget === 'object' && 'id' in budget ? budget : null
    const restored = snapshotFromSavedScenario(scenario, currentBudget || undefined)
    if (currentBudget && !restored.scenarioLines.length) {
      restored.scenarioLines = buildScenarioLinesFromBudget(currentBudget)
    }
    Object.assign(snapshot, restored)
    saveWizardSnapshot(snapshot)
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isLoading.value = false
  }
}

const simulate = async () => {
  isSimulating.value = true
  errorMessage.value = ''
  try {
    const { data } = await ScenarioService.simulate(buildSimulationPayload(snapshot))
    saveWizardSnapshot(snapshot)
    previewResult.value = data
    previewDialogOpen.value = true
    window.sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        scenarioId: snapshot.currentScenarioId || String(route.params.id || ''),
        result: data,
      }),
    )
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isSimulating.value = false
  }
}

const persistScenario = async (): Promise<string> => {
  const payload = {
    ...buildScenarioPayload(snapshot),
    id: snapshot.currentScenarioId || undefined,
  }

  try {
    const { data } = await ScenarioService.save(payload)
    snapshot.currentScenarioId = data.id
    snapshot.scenarioName = data.name || snapshot.scenarioName
    saveWizardSnapshot(snapshot)
    return data.id
  } catch (error) {
    if (extractErrorStatus(error) !== 409) {
      throw error
    }

    // Conflict-safe fallback: save as a new scenario version instead of overwriting.
    const conflictSafeName = buildVersionedScenarioName(snapshot.scenarioName)
    const { data } = await ScenarioService.save({
      ...payload,
      id: undefined,
      name: conflictSafeName,
    })
    snapshot.currentScenarioId = data.id
    snapshot.scenarioName = data.name || conflictSafeName
    saveWizardSnapshot(snapshot)
    return data.id
  }
}

const saveScenarioFromPreview = async () => {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const id = await persistScenario()
    successMessage.value = t('planning.scenarios.save_success', {
      name: snapshot.scenarioName || t('planning.scenarios.default_name'),
    })
    const routeId = String(route.params.id || '')
    if (routeId !== id) {
      await router.replace({ name: 'planning-scenarios-edit', params: { id } })
    }
    previewDialogOpen.value = false
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.save_error')
  } finally {
    isSaving.value = false
  }
}

const createDecisionFromPreview = async () => {
  isCreatingDecision.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const persistedScenarioId = await persistScenario()
    await DecisionService.createFromScenario(persistedScenarioId)
    window.sessionStorage.setItem(
      DECISIONS_FLASH_SUCCESS_KEY,
      JSON.stringify({ scenarioName: snapshot.scenarioName || t('planning.scenarios.default_name') }),
    )
    previewDialogOpen.value = false
    await router.push({ name: 'decisions', query: { scenarios: persistedScenarioId } })
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isCreatingDecision.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    void loadScenario()
  },
)

watch(
  snapshot,
  () => {
    saveWizardSnapshot(snapshot)
  },
  { deep: true },
)

onMounted(() => {
  void loadScenario()
})
</script>

<style scoped>
.scenario-editor {
  max-width: 1080px;
}

.editor-shell {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 4px;
}

.summary-item {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item span {
  color: #64748b;
  font-size: 0.84rem;
}

.summary-item strong {
  font-size: 1.06rem;
  color: #0f172a;
}

.section-header h3 {
  margin: 0;
}

.section-header p {
  margin: 4px 0 0;
  color: #64748b;
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

.editor-actions-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hint-text {
  color: #64748b;
  font-size: 0.88rem;
}

.success-message {
  color: #166534;
  margin: 0;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.preview-hero {
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 14px;
  background: rgba(79, 70, 229, 0.08);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.preview-hero span {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #4f46e5;
  font-weight: 700;
}

.preview-hero strong {
  font-size: 2rem;
}

.preview-hero p {
  margin: 0;
  color: #334155;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .adjustment-row {
    grid-template-columns: 1fr;
  }

  .adjustment-row--numbers {
    grid-template-columns: 1fr;
  }

  .editor-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
