<template>
  <div class="cb-page">
    <div class="cb-container scenario-wizard">
      <page-header :title="t(isGuided ? 'decisionJourney.form.title' : 'planning.scenarios.title')" :meta="t(isGuided ? 'decisionJourney.form.subtitle' : 'planning.scenarios.subtitle')">
        <template #actions>
          <v-btn
            v-if="cameFromHub"
            variant="text"
            color="var(--cb-primary)"
            @click="router.push({ name: 'planning-scenarios' })"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('contentExperience.planning.scenarioBuilder.backToList') }}
          </v-btn>
          <v-btn variant="tonal" color="var(--cb-primary)" @click="startNewScenario()">
            <v-icon start>mdi-file-plus-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </template>
      </page-header>

      <div class="wizard-shell">
        <v-alert v-if="showImmutableNotice" type="info" variant="tonal" density="comfortable">
          {{ t('contentExperience.planning.scenarioBuilder.immutableNotice') }}
        </v-alert>

        <div class="wizard-steps">
          <span class="wizard-step">{{
            t('decisionJourney.form.step', { step: visibleStep, total: steps.length })
          }}</span>
          <v-progress-linear
            :model-value="(visibleStep / steps.length) * 100"
            color="var(--cb-primary)"
            height="8"
            rounded
          ></v-progress-linear>
        </div>

        <div v-if="isBudgetLoading" class="empty-results">
          <v-icon color="var(--cb-ink-muted)" size="28">mdi-timer-sand</v-icon>
          <p>{{ t('planning.scenarios.loading_budget_baseline') }}</p>
        </div>

        <div v-else-if="budgetLoadFailed" class="empty-results" role="alert">
          <p>{{ t('decisionJourney.base.loadError') }}</p>
          <v-btn @click="loadBudget(true)">{{ t('decisionJourney.retry') }}</v-btn>
        </div>

        <div v-else-if="!activeBudget" class="empty-results">
          <v-icon color="var(--cb-ink-muted)" size="28">mdi-wallet-plus-outline</v-icon>
          <p>{{ t('planning.scenarios.empty_no_budget_title') }}</p>
          <p>{{ t('decisionJourney.base.manualHelp') }}</p>
          <v-btn color="var(--cb-primary)" variant="tonal" @click="prepareBudget">
            <v-icon start>mdi-wallet-outline</v-icon>
            {{ t('decisionJourney.base.prepare') }}
          </v-btn>
        </div>

        <template v-else>
          <section v-show="step === 1" class="wizard-panel">
            <h2 ref="baseHeading" tabindex="-1">{{ t('contentExperience.planning.scenarioBuilder.currentBudgetTitle') }}</h2>
            <p>{{ t('contentExperience.planning.scenarioBuilder.currentBudgetDescription') }}</p>
            <p>{{ t('decisionJourney.base.period', { month: activeBudget.periodMonth, year: activeBudget.periodYear }) }}</p>
            <p>{{ t('decisionJourney.base.notBankBalance') }}</p>
            <div class="metrics-grid">
              <div class="metric-card">
                <span>{{ t('contentExperience.planning.scenarioBuilder.totalIncome') }}</span>
                <strong>{{ formatCurrency(activeBudget.totalIncome) }}</strong>
              </div>
              <div class="metric-card">
                <span>{{ t('contentExperience.planning.scenarioBuilder.totalExpense') }}</span>
                <strong>{{ formatCurrency(activeBudget.totalExpense) }}</strong>
              </div>
              <div class="metric-card">
                <span>{{ t('contentExperience.planning.scenarioBuilder.net') }}</span>
                <strong :class="{ 'negative-value': activeBudget.net < 0 }">{{
                  formatCurrency(activeBudget.net)
                }}</strong>
              </div>
            </div>
          </section>

          <section v-if="!isGuided" v-show="step === 2" class="wizard-panel">
            <h2>{{ t('contentExperience.planning.scenarioBuilder.chooseIntentTitle') }}</h2>
            <p>{{ t('contentExperience.planning.scenarioBuilder.chooseIntentDescription') }}</p>
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
                  <v-icon color="var(--cb-primary)">{{ template.icon }}</v-icon>
                  <span>{{ template.title }}</span>
                </div>
                <p>{{ template.description }}</p>
              </button>
            </div>
          </section>

          <section v-show="step === 3" class="wizard-panel">
            <h2 ref="changesHeading" tabindex="-1">{{ t('decisionJourney.form.changesTitle') }}</h2>
            <p>{{ t('decisionJourney.form.changesHelp') }}</p>

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

            <div class="wizard-inline-actions new-layout">
              <div>
                <v-btn
                  variant="tonal"
                  color="var(--cb-primary)"
                  @click="addAdjustment"
                  class="add-change-btn"
                >
                  <v-icon start>mdi-plus</v-icon>
                  {{ t('contentExperience.planning.scenarioBuilder.addChange') }}
                </v-btn>
              </div>
              <p>{{ t('decisionJourney.form.impactHelp') }}</p>
            </div>
            <ScenarioAdvancedFields :snapshot="snapshot"
              @update:name="snapshot.scenarioName = $event" @update:months="snapshot.months = $event"
              @update:line="(index, value) => snapshot.scenarioLines[index].adjustedAmount = value" />
          </section>

          <section v-show="step === 4" class="wizard-panel">
            <h2 ref="reviewHeading" tabindex="-1">{{ t('decisionJourney.form.reviewTitle') }}</h2>
            <p>{{ t('decisionJourney.form.reviewHelp') }}</p>

            <div class="review-box">
              <div>
                <span>{{ t('decisionJourney.form.name') }}</span>
                <strong>{{ snapshot.scenarioName || t('planning.scenarios.default_name') }}</strong>
              </div>
              <div>
                <span>{{ t('contentExperience.planning.scenarioBuilder.reviewTimeHorizon') }}</span>
                <strong>{{
                  t('contentExperience.planning.scenarioBuilder.monthsLabel', {
                    count: snapshot.months
                  })
                }}</strong>
              </div>
              <div>
                <span>{{ t('decisionJourney.form.changeCount') }}</span>
                <strong>{{ activeChangesCount }}</strong>
              </div>
            </div>
            <ul class="review-changes" :aria-label="t('decisionJourney.form.changesTitle')">
              <ScenarioDeltaSummary v-for="(delta, index) in reviewDeltas" :key="index" :delta="delta" />
            </ul>
            <p v-if="!canSimulate">{{ t('decisionJourney.form.noChanges') }}</p>

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
          </section>

          <div class="wizard-footer">
            <v-btn
              variant="text"
              :disabled="step === 1 || isSimulating"
              @click="moveStep(-1)"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              {{ t('contentExperience.planning.scenarioBuilder.back') }}
            </v-btn>
            <v-btn
              v-if="step !== 4"
              color="var(--cb-primary)"
              variant="tonal"
              :disabled="step === 4 || isSimulating"
              @click="moveStep(1)"
            >
              {{ t('contentExperience.planning.scenarioBuilder.next') }}
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import BudgetService, { type Budget } from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import {
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  clearWizardSnapshot,
  createAdjustment,
  hasAnyScenarioChange,
  loadWizardSnapshot,
  mapDeltasToSimpleAdjustments,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  templateDeltas,
  type ScenarioWizardSnapshot
} from '@/utils/scenarioWizard'

import ScenarioChangeCard from '@/components/ScenarioChangeCard.vue'
import ScenarioAdvancedFields from '@/components/ScenarioAdvancedFields.vue'
import ScenarioDeltaSummary from '@/components/ScenarioDeltaSummary.vue'
import { useDecisionJourneySession } from '@/composables/useDecisionJourneySession'
import { writeJourneyResult } from '@/utils/decisionJourneySession'
import { prepareBudgetReturn } from '@/utils/decisionBudgetReturn'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const step = ref(1)
const isGuided = computed(() => route.query.guided === '1' && !route.query.template && !route.query.cloneFrom)
const steps = computed(() => isGuided.value ? [1, 3, 4] : [1, 2, 3, 4])
const visibleStep = computed(() => steps.value.indexOf(step.value) + 1)
const baseHeading = ref<HTMLElement | null>(null)
const changesHeading = ref<HTMLElement | null>(null)
const reviewHeading = ref<HTMLElement | null>(null)
const moveStep = async (direction: number) => {
  const index = Math.max(0, Math.min(steps.value.length - 1, steps.value.indexOf(step.value) + direction))
  step.value = steps.value[index]
  await nextTick()
  ;({ 1: baseHeading, 3: changesHeading, 4: reviewHeading }[step.value])?.value?.focus()
}
const isBudgetLoading = ref(false)
const budgetLoadFailed = ref(false)
const isSimulating = ref(false)
const errorMessage = ref('')
const activeBudget = ref<Budget | null>(null)
const selectedTemplate = ref<keyof typeof templateDeltas | null>(null)

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [createAdjustment()],
  scenarioLines: []
})
const journey = useDecisionJourneySession(() => {
  budgetLoadFailed.value = false
  activeBudget.value = null
  selectedTemplate.value = null
  step.value = 1
  Object.assign(snapshot, { scenarioName: '', months: 6, currentScenarioId: null, budgetId: undefined,
    periodMonth: undefined, periodYear: undefined, adjustments: [createAdjustment()], scenarioLines: [] })
  isBudgetLoading.value = false
  isSimulating.value = false
})

const templates = computed(() => [
  {
    key: 'reduce_costs' as const,
    icon: 'mdi-scissors-cutting',
    title: t('planning.scenarios.template_cost_cut_title'),
    description: t('planning.scenarios.template_cost_cut_desc'),
    months: 6
  },
  {
    key: 'increase_revenue' as const,
    icon: 'mdi-chart-line',
    title: t('planning.scenarios.template_marketing_title'),
    description: t('planning.scenarios.template_marketing_desc'),
    months: 6
  },
  {
    key: 'hiring' as const,
    icon: 'mdi-account-plus-outline',
    title: t('planning.scenarios.template_hiring_title'),
    description: t('planning.scenarios.template_hiring_desc'),
    months: 12
  },
  {
    key: 'investment' as const,
    icon: 'mdi-rocket-launch-outline',
    title: t('planning.scenarios.template_investment_title'),
    description: t('planning.scenarios.template_investment_desc'),
    months: 9
  }
])
const showImmutableNotice = computed(() => String(route.query.locked || '') === '1')
const cameFromHub = computed(() => String(route.query.from || '') === 'hub')
const requestedTemplate = computed(() =>
  String(route.query.template || '')
    .trim()
    .toLowerCase()
)

const canSimulate = computed(() => hasAnyScenarioChange(snapshot))
const reviewDeltas = computed(() => buildSimulationPayload(snapshot).deltas)
const activeChangesCount = computed(() => reviewDeltas.value.length)

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en'
      ? 'en-US'
      : locale.value === 'fr'
        ? 'fr-FR'
        : locale.value === 'es'
          ? 'es-ES'
          : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

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
  const template = templates.value.find((item) => item.key === templateKey)
  snapshot.scenarioName = template?.title || t('planning.scenarios.default_name')
  snapshot.months = Number(template?.months || 6)
  snapshot.adjustments = mapDeltasToSimpleAdjustments(templateDeltas[templateKey])
}

const applyRouteTemplate = () => {
  const templateMap: Record<string, keyof typeof templateDeltas> = {
    hire: 'hiring',
    hiring: 'hiring',
    reduce_costs: 'reduce_costs',
    increase_revenue: 'increase_revenue',
    investment: 'investment'
  }
  const templateKey = templateMap[requestedTemplate.value]
  if (!templateKey) return false
  selectTemplate(templateKey)
  step.value = Math.max(step.value, 3)
  return true
}

const startNewScenario = (budgetOverride?: Budget | null, persist = true, newSession = true) => {
  const budget = budgetOverride || activeBudget.value
  if (!budget) return
  if (newSession) journey.start('BUDGET_BASED')
  if (!journey.isCurrent()) return
  isSimulating.value = false

  snapshot.scenarioName = ''
  snapshot.months = 6
  snapshot.currentScenarioId = null
  snapshot.budgetId = budget.id
  snapshot.periodMonth = budget.periodMonth
  snapshot.periodYear = budget.periodYear
  snapshot.adjustments = [createAdjustment()]
  snapshot.scenarioLines = buildScenarioLinesFromBudget(budget)
  selectedTemplate.value = null
  step.value = 1

  if (persist) {
    saveWizardSnapshot(snapshot)
  }
}

const prepareBudget = async () => {
  const session = journey.session.value
  if (!journey.isCurrent(session)) return
  await router.push(route.query.guided === '1'
    ? prepareBudgetReturn(session, route.query.intent)
    : { name: 'planning-budget' })
}

const loadBudget = async (retry = false) => {
  activeBudget.value = null
  budgetLoadFailed.value = false
  const cloneFromId = typeof route.query.cloneFrom === 'string' ? route.query.cloneFrom : ''
  const resuming = retry && journey.isCurrent() ? journey.session.value
    : !cloneFromId && String(route.query.resume || '') === '1' ? journey.restore('BUDGET_BASED') : null
  const operation = resuming || journey.start('BUDGET_BASED')
  if (!operation) return
  isBudgetLoading.value = true
  try {
    const now = new Date()
    const { data, status } = await BudgetService.getCurrent(now.getMonth() + 1, now.getFullYear())
    if (!journey.isCurrent(operation)) return
    if (status === 204 || data == null) {
      activeBudget.value = null
      return
    }
    if (typeof data !== 'object' || !('id' in data)) throw new Error('Invalid budget response')

    activeBudget.value = data

    if (cloneFromId) {
      const { data: scenarios } = await ScenarioService.list()
      if (!journey.isCurrent(operation)) return
      const source = (Array.isArray(scenarios) ? scenarios : []).find(
        (item) => item.id === cloneFromId
      )
      if (source) {
        Object.assign(snapshot, snapshotFromSavedScenario(source, data))
        snapshot.currentScenarioId = null
        snapshot.scenarioName = source.name
          ? t('planning.scenarios.versioned_name', { name: source.name })
          : t('planning.scenarios.default_name')
        step.value = 3
        saveWizardSnapshot(snapshot)
        return
      }
    }

    // "/planning/scenarios/new" must always start a clean scenario unless resume is explicit.
    const shouldStartFresh = !resuming
    if (shouldStartFresh) {
      clearWizardSnapshot()
      startNewScenario(data, true, false)
      applyRouteTemplate()
      return
    }

    const restored = loadWizardSnapshot()
    if (restored?.budgetId && restored.budgetId === data.id && restored.currentScenarioId === operation.scenarioId) {
      Object.assign(snapshot, restored)
      applyRouteTemplate()
      return
    }

    journey.linkScenario(null)
    startNewScenario(data, true, false)
    applyRouteTemplate()
  } catch (e) {
    if (!journey.isCurrent(operation)) return
    console.error(e)
    activeBudget.value = null
    budgetLoadFailed.value = true
  } finally {
    if (journey.isCurrent(operation)) isBudgetLoading.value = false
  }
}

const simulate = async () => {
  const operation = journey.session.value
  if (!journey.isCurrent(operation) || isSimulating.value || isBudgetLoading.value) return
  errorMessage.value = ''
  isSimulating.value = true

  try {
    const submitted = JSON.parse(JSON.stringify(snapshot)) as ScenarioWizardSnapshot
    journey.linkScenario(submitted.currentScenarioId)
    const payload = buildSimulationPayload(submitted)
    const { data } = await ScenarioService.simulate(payload)
    if (!journey.isCurrent(operation)) return
    saveWizardSnapshot(submitted)
    writeJourneyResult(operation, submitted.currentScenarioId || 'preview', data)
    await router.push({
      name: 'planning-scenarios-result',
      params: { id: submitted.currentScenarioId || 'preview' },
      query: { simulatedAt: String(Date.now()) }
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
  snapshot,
  () => {
    if (!activeBudget.value || !journey.isCurrent()) return
    saveWizardSnapshot(snapshot)
  },
  { deep: true }
)

onMounted(() => {
  void loadBudget()
})

watch(
  () => [route.query.cloneFrom, route.query.resume, route.query.guided, route.query.intent, route.query.template],
  () => { void loadBudget() }
)
</script>

<style scoped>
.scenario-wizard {
  max-width: 1080px;
}

.wizard-shell {
  background: var(--cb-surface);
  border-radius: 16px;
  border: 1px solid var(--cb-border-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.wizard-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wizard-step {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--cb-ink-secondary);
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
  min-width: 0;
}

.metric-card,
.review-box > div {
  border: 1px solid var(--cb-border-card);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card span,
.review-box span {
  color: var(--cb-ink-muted);
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
  min-width: 0;
}

.template-card {
  border: 1px solid var(--cb-border-card);
  border-radius: 12px;
  text-align: left;
  background: var(--cb-surface);
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;
  overflow-wrap: anywhere;
}

.template-card:hover,
.template-card--active {
  border-color: var(--cb-primary);
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
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
  gap: 24px;
  margin-bottom: 24px;
}

.wizard-inline-actions.new-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.add-change-btn {
  border-radius: 10px;
}

.wizard-input {
  border-radius: 8px;
  margin-bottom: 12px;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--cb-ink-muted);
  padding: 40px 16px;
  text-align: center;
}

.positive-value { color: var(--cb-positive); }
.negative-value { color: var(--cb-risk); }

@media (max-width: 960px) {
  .wizard-inline-actions.new-layout {
    gap: 16px;
  }

  .impact-estimate {
    min-width: 0;
  }
}

@media (max-width: 600px) {
  :deep(.cb-page-header) {
    flex-direction: column;
    align-items: stretch;
  }

  .scenario-wizard {
    padding-inline: 0;
  }

  .wizard-shell {
    padding: 16px;
  }

  .metrics-grid,
  .review-box,
  .template-grid,
  .adjustment-row,
  .adjustment-row--numbers {
    grid-template-columns: 1fr;
  }

  .wizard-inline-actions.new-layout,
  .wizard-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .wizard-inline-actions.new-layout :deep(.v-btn),
  .wizard-footer :deep(.v-btn) {
    width: 100%;
  }

  .impact-estimate {
    width: 100%;
  }
}

@media (max-width: 430px) {
  .wizard-step {
    font-size: 0.78rem;
  }

  .metric-card strong,
  .review-box strong {
    font-size: 1.08rem;
  }
}
</style>
