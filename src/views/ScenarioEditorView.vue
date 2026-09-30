<template>
  <div class="cb-page">
    <div class="cb-container scenario-editor">
      <page-header
        :title="t('decisionJourney.form.editTitle')"
        :meta="t('decisionJourney.form.editHelp')"
      >
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" @click="openScenarioResult">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('decisionJourney.form.backToResults') }}
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
              <span>{{ t('decisionJourney.form.name') }}</span>
              <strong>{{ snapshot.scenarioName || t('planning.scenarios.default_name') }}</strong>
            </div>
            <div class="summary-item">
              <span>{{ t('decisionJourney.form.horizon') }}</span>
              <strong>{{ t('contentExperience.planning.scenarioBuilder.monthsLabel', { count: snapshot.months }) }}</strong>
            </div>
            <div class="summary-item">
              <span>{{ t('decisionJourney.form.changeCount') }}</span>
              <strong>{{ reviewDeltas.length }}</strong>
            </div>
          </div>

          <div class="section-header">
            <h3>{{ t('decisionJourney.form.changesTitle') }}</h3>
            <p>{{ t('decisionJourney.form.changesHelp') }}</p>
          </div>

          <div class="adjustments-list">
            <ScenarioChangeCard
              v-for="(adjustment, idx) in snapshot.adjustments"
              :key="adjustment.id"
              :adjustment="adjustment"
              @update:label="(val) => (snapshot.adjustments[idx].label = val)"
              @update:flow="(val) => (snapshot.adjustments[idx].flow = val)"
              @update:originalDeltaType="(val) => (snapshot.adjustments[idx].originalDeltaType = val)"
              @update:valueMode="(val) => (snapshot.adjustments[idx].valueMode = val)"
              @update:temporalType="(val) => (snapshot.adjustments[idx].temporalType = val)"
              @update:amount="(val) => (snapshot.adjustments[idx].amount = Number(val || 0))"
              @update:percentage="(val) => (snapshot.adjustments[idx].percentage = Number(val || 0))"
              @update:startMonthOffset="(val) => (snapshot.adjustments[idx].startMonthOffset = Number(val || 0))"
              @update:endMonthOffset="(val) => (snapshot.adjustments[idx].endMonthOffset = val == null || val === '' ? null : Number(val))"
              @update:monthlyChange="(val) => (snapshot.adjustments[idx].monthlyChange = val)"
              @update:oneTimeChange="(val) => (snapshot.adjustments[idx].oneTimeChange = val)"
              @remove="removeAdjustment(adjustment.id)"
            />
          </div>

          <div class="editor-actions-inline">
            <v-btn variant="tonal" color="var(--cb-primary)" @click="addAdjustment">
              <v-icon start>mdi-plus</v-icon>
              {{ t('decisionJourney.form.addChange') }}
            </v-btn>
            <span class="hint-text">{{ t('decisionJourney.form.reviewHelp') }}</span>
          </div>

          <ScenarioAdvancedFields :snapshot="snapshot"
            @update:name="snapshot.scenarioName = $event" @update:months="snapshot.months = $event"
            @update:line="(index, value) => snapshot.scenarioLines[index].adjustedAmount = value" />
          <details>
            <summary>{{ t('decisionJourney.form.reviewTitle') }}</summary>
            <ul><ScenarioDeltaSummary v-for="(delta, index) in reviewDeltas" :key="index" :delta="delta" /></ul>
          </details>

          <div class="editor-footer">
            <v-btn variant="text" @click="router.push({ name: 'planning-scenarios' })">
              <v-icon start>mdi-layers-triple-outline</v-icon>
              {{ t('decisionJourney.form.list') }}
            </v-btn>
            <v-btn
              color="var(--cb-primary)"
              size="large"
              :loading="isSimulating"
              :disabled="isSimulating || !canSimulate"
              @click="simulate"
            >
              <v-icon start>mdi-chart-line-variant</v-icon>
              {{ t('decisionJourney.form.simulate') }}
            </v-btn>
          </div>
        </template>

        <div v-else class="empty-results">
          <v-icon color="var(--cb-ink-muted)" size="28">mdi-alert-circle-outline</v-icon>
          <p>{{ t('decisionJourney.form.notFound') }}</p>
          <v-btn color="var(--cb-primary)" variant="tonal" @click="router.push({ name: 'planning-scenarios' })">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('decisionJourney.form.list') }}
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
import ScenarioChangeCard from '@/components/ScenarioChangeCard.vue'
import ScenarioAdvancedFields from '@/components/ScenarioAdvancedFields.vue'
import ScenarioDeltaSummary from '@/components/ScenarioDeltaSummary.vue'
import BudgetService from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'
import { useDecisionJourneySession } from '@/composables/useDecisionJourneySession'
import { writeJourneyResult } from '@/utils/decisionJourneySession'
import {
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  createAdjustment,
  hasAnyScenarioChange,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  type ScenarioWizardSnapshot,
} from '@/utils/scenarioWizard'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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
const journey = useDecisionJourneySession(() => {
  Object.assign(snapshot, { scenarioName: '', months: 6, currentScenarioId: null, budgetId: undefined,
    periodMonth: undefined, periodYear: undefined, adjustments: [createAdjustment()], scenarioLines: [] })
  isLoading.value = false
  isSimulating.value = false
})

const reviewDeltas = computed(() => buildSimulationPayload(snapshot).deltas)
const canSimulate = computed(() => hasAnyScenarioChange(snapshot))

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
  Object.assign(snapshot, { scenarioName: '', months: 6, currentScenarioId: null, budgetId: undefined,
    periodMonth: undefined, periodYear: undefined, adjustments: [createAdjustment()], scenarioLines: [] })
  const operation = journey.start('BUDGET_BASED', String(route.params.id || '') || null)
  if (!operation) return
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
    if (!journey.isCurrent(operation)) return
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
    if (!journey.isCurrent(operation)) return
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    if (journey.isCurrent(operation)) isLoading.value = false
  }
}

const simulate = async () => {
  const operation = journey.session.value
  if (!journey.isCurrent(operation) || isSimulating.value || isLoading.value) return
  isSimulating.value = true
  errorMessage.value = ''
  try {
    const submitted = JSON.parse(JSON.stringify(snapshot)) as ScenarioWizardSnapshot
    journey.linkScenario(submitted.currentScenarioId)
    const { data } = await ScenarioService.simulate(buildSimulationPayload(submitted))
    if (!journey.isCurrent(operation)) return
    saveWizardSnapshot(submitted)
    const routeId = String(route.params.id || '')
    const targetScenarioId = submitted.currentScenarioId || routeId || 'preview'
    writeJourneyResult(operation, targetScenarioId, data)
    await router.push({
      name: 'planning-scenarios-result',
      params: { id: targetScenarioId },
      query: { simulatedAt: String(Date.now()) },
    })
  } catch (e) {
    if (!journey.isCurrent(operation)) return
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    if (journey.isCurrent(operation)) isSimulating.value = false
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
    if (journey.isCurrent() && !isLoading.value) saveWizardSnapshot(snapshot)
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

@media (max-width: 600px) {
  :deep(.cb-page-header) { flex-direction: column; align-items: stretch; }
  .scenario-editor { padding-inline: 0; }
  .editor-shell { padding: 16px; }
}
</style>
