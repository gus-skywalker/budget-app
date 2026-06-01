<template>
  <div class="cb-page">
    <div class="cb-container scenario-editor">
      <page-header
        :title="t('contentExperience.planning.scenarioEditor.title', 'Edit scenario')"
        :meta="t('contentExperience.planning.scenarioEditor.subtitle', 'Update assumptions and re-run the simulation for this saved scenario.')"
      >
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" @click="openScenarioResult">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('contentExperience.planning.scenarioEditor.backToResults', 'Back to results') }}
          </v-btn>
        </template>
      </page-header>

      <div class="editor-shell">
        <div v-if="isLoading" class="empty-results">
          <v-icon color="var(--cb-ink-muted)" size="28">mdi-timer-sand</v-icon>
          <p>{{ t('planning.scenarios.comparing') }}</p>
        </div>

        <template v-else-if="snapshot.currentScenarioId">
          <div class="summary-strip">
            <div class="summary-item">
              <span>{{ t('contentExperience.planning.scenarioEditor.scenarioLabel', 'Scenario') }}</span>
              <strong>{{ snapshot.scenarioName || t('planning.scenarios.default_name') }}</strong>
            </div>
            <div class="summary-item">
              <span>{{ t('contentExperience.planning.scenarioEditor.horizonLabel', 'Horizon') }}</span>
              <strong>{{ t('contentExperience.planning.scenarioEditor.monthsValue', '{n} months', { n: snapshot.months }) }}</strong>
            </div>
            <div class="summary-item">
              <span>{{ t('contentExperience.planning.scenarioEditor.estimatedImpact', 'Estimated monthly impact') }}</span>
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
            <h3>{{ t('contentExperience.planning.scenarioEditor.changesTitle', 'Changes') }}</h3>
            <p>{{ t('contentExperience.planning.scenarioEditor.changesDescription', 'Keep only the adjustments that matter for this scenario.') }}</p>
          </div>

          <div class="adjustments-list">
            <div v-for="adjustment in snapshot.adjustments" :key="adjustment.id" class="adjustment-card">
              <div class="adjustment-row">
                <v-text-field
                  v-model="adjustment.label"
                  :label="t('contentExperience.planning.scenarioEditor.labelField', 'Label (optional)')"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-btn-toggle v-model="adjustment.flow" mandatory divided color="var(--cb-primary)">
                  <v-btn value="INCOME">{{ t('common.income', 'Income') }}</v-btn>
                  <v-btn value="EXPENSE">{{ t('common.expense', 'Expense') }}</v-btn>
                </v-btn-toggle>
              </div>

              <div class="adjustment-row adjustment-row--numbers">
                <v-text-field
                  v-model.number="adjustment.monthlyChange"
                  :label="t('contentExperience.planning.scenarioEditor.monthlyChangeField', 'Monthly change')"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="adjustment.oneTimeChange"
                  :label="t('contentExperience.planning.scenarioEditor.oneTimeChangeField', 'One-time change')"
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
            <v-btn variant="tonal" color="var(--cb-primary)" @click="addAdjustment">
              <v-icon start>mdi-plus</v-icon>
              {{ t('contentExperience.planning.scenarioEditor.addChange', 'Add change') }}
            </v-btn>
            <span class="hint-text">{{ t('contentExperience.planning.scenarioEditor.saveHint', 'You can simulate without saving. Save is optional on result page.') }}</span>
          </div>

          <div class="editor-footer">
            <v-btn variant="text" @click="router.push({ name: 'planning-scenarios' })">
              <v-icon start>mdi-layers-triple-outline</v-icon>
              {{ t('contentExperience.planning.scenarioEditor.scenarioList', 'Scenario list') }}
            </v-btn>
            <v-btn
              color="var(--cb-primary)"
              size="large"
              :loading="isSimulating"
              :disabled="isSimulating || !canSimulate"
              @click="simulate"
            >
              <v-icon start>mdi-chart-line-variant</v-icon>
              {{ t('contentExperience.planning.scenarioEditor.simulateUpdates', 'Simulate updates') }}
            </v-btn>
          </div>
        </template>

        <div v-else class="empty-results">
          <v-icon color="var(--cb-ink-muted)" size="28">mdi-alert-circle-outline</v-icon>
          <p>{{ t('contentExperience.planning.scenarioEditor.notFound', 'Scenario not found.') }}</p>
          <v-btn color="var(--cb-primary)" variant="tonal" @click="router.push({ name: 'planning-scenarios' })">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('contentExperience.planning.scenarioEditor.backToScenarios', 'Back to scenarios') }}
          </v-btn>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import BudgetService from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'
import {
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

const isLoading = ref(false)
const isSimulating = ref(false)
const errorMessage = ref('')

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [createAdjustment()],
  scenarioLines: [],
})

const estimatedImpact = computed(() => monthlyImpactEstimate(snapshot))
const canSimulate = computed(() => hasAnyScenarioChange(snapshot))

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
    const routeId = String(route.params.id || '')
    const targetScenarioId = snapshot.currentScenarioId || routeId || 'preview'
    window.sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        scenarioId: targetScenarioId,
        result: data,
      }),
    )
    await router.push({
      name: 'planning-scenarios-result',
      params: { id: targetScenarioId },
      query: { simulatedAt: String(Date.now()) },
    })
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isSimulating.value = false
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
  background: var(--cb-surface);
  border-radius: 16px;
  border: 1px solid var(--cb-border-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 4px;
}

.summary-item {
  border: 1px solid var(--cb-border-card);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item span {
  color: var(--cb-ink-muted);
  font-size: 0.84rem;
}

.summary-item strong {
  font-size: 1.06rem;
  color: var(--cb-ink);
}

.section-header h3 {
  margin: 0;
}

.section-header p {
  margin: 4px 0 0;
  color: var(--cb-ink-muted);
}

.adjustments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adjustment-card {
  border: 1px solid var(--cb-border-card);
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
  color: var(--cb-ink-muted);
  font-size: 0.88rem;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.positive-value { color: var(--cb-positive); }
.negative-value { color: var(--cb-risk); }

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--cb-ink-muted);
  padding: 40px 16px;
  text-align: center;
}

@media (max-width: 900px) {
  .adjustment-row,
  .adjustment-row--numbers {
    grid-template-columns: 1fr;
  }

  .editor-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
