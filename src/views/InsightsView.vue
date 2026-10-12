<template>
  <div class="cb-page experience-page experience-page--insights">
    <div class="cb-container">
      <page-header :title="t('insights.title')" :meta="t('insights.page_intro')" />

      <!-- Scope note -->
      <div class="cb-scope-note">
        <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
        <span>{{ t('transactionVisibility.insightsScopeNote') }}</span>
      </div>

      <alert-strip v-if="error" :variant="accessDenied ? 'info' : 'warning'" :title="accessDenied ? t('insights.access_denied_title') : t('insights.error_title')" :description="error">
        <template v-if="!accessDenied" #actions>
          <v-btn variant="text" @click="loadInsights">{{ t('insights.retry') }}</v-btn>
        </template>
      </alert-strip>

      <!-- Loading state -->
      <div v-if="isLoading" class="cb-empty-state" role="status">
        <v-icon size="40">mdi-timer-sand</v-icon>
        <p>{{ t('insights.loading') }}</p>
      </div>

      <div v-else-if="error" class="insights-footer-actions">
        <v-btn variant="text" @click="goToDecisions">{{ t('insights.back_to_decisions') }}</v-btn>
      </div>

      <div v-else-if="!insightCards.length" class="cb-empty-state insights-empty-state">
        <v-icon size="40">mdi-lightbulb-auto-outline</v-icon>
        <h2>{{ t('insights.empty_title') }}</h2>
        <p>{{ t('insights.empty') }}</p>
        <v-btn class="cb-btn-primary" @click="goToScenarios">{{ t('insights.create_scenario') }}</v-btn>
      </div>

      <div v-else class="insights-content">
        <p class="insights-origin">{{ t('insights.simulation_scope') }} {{ selectionSourceNote }}</p>
        <section v-if="leadInsight" class="cb-insight-card cb-insight-card--lead" :aria-label="t('insights.main_signal')">
          <span class="cb-insight-card__eyebrow">{{ t('insights.main_signal') }} · {{ themeLabel(leadInsight.theme) }}</span>
          <div class="cb-insight-card__header">
            <v-icon :color="leadInsight.iconColor" size="24">{{ leadInsight.icon }}</v-icon>
            <h2 class="cb-insight-card__title">{{ leadInsight.title }}</h2>
          </div>
          <p class="cb-insight-card__description">{{ leadInsight.description }}</p>
          <p v-if="leadInsight.supporting" class="cb-insight-card__supporting">{{ leadInsight.supporting }}</p>
          <div class="cb-insight-card__provenance">
            <span>{{ leadInsight.scenarioLabel }}</span>
            <span>{{ leadInsight.sourceLabel }}</span>
          </div>
          <v-btn class="cb-btn-primary" @click="openScenario(leadInsight.scenarioId)">{{ t('insights.open_scenario') }}</v-btn>
        </section>

        <section v-if="additionalInsights.length" class="insights-additional" :aria-label="t('insights.other_signals')">
          <h2>{{ t('insights.other_signals') }}</h2>
          <div class="cb-insights-grid">
            <article v-for="insight in additionalInsights" :key="`${insight.scenarioId}-${insight.theme}`" class="cb-insight-card">
              <span class="cb-insight-card__eyebrow">{{ themeLabel(insight.theme) }}</span>
              <div class="cb-insight-card__header">
                <v-icon :color="insight.iconColor" size="20">{{ insight.icon }}</v-icon>
                <h3 class="cb-insight-card__title">{{ insight.title }}</h3>
              </div>
              <p class="cb-insight-card__description">{{ insight.description }}</p>
              <p v-if="insight.supporting" class="cb-insight-card__supporting">{{ insight.supporting }}</p>
              <div class="cb-insight-card__provenance">
                <span>{{ insight.scenarioLabel }}</span>
                <span>{{ insight.sourceLabel }}</span>
              </div>
              <v-btn variant="text" color="var(--cb-primary)" size="small" @click="openScenario(insight.scenarioId)">{{ t('insights.open_scenario') }}</v-btn>
            </article>
          </div>
        </section>
        <div class="insights-footer-actions">
          <v-btn variant="text" @click="goToDecisions">{{ t('insights.back_to_decisions') }}</v-btn>
          <v-btn variant="tonal" color="var(--cb-primary)" @click="goToScenarios">{{ t('insights.review_in_scenarios') }}</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario, type ScenarioSimulationResponse } from '@/services/ScenarioService'
import { buildSavedScenarioSimulationRequest } from '@/utils/savedScenarioSimulation'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const INSIGHTS_STORAGE_KEY = 'insights-scenarios'

const isLoading = ref(false)
const error = ref('')
const accessDenied = ref(false)
const selectedScenarioIds = ref<string[]>([])
const selectionOrigin = ref<'selected' | 'saved' | 'recent'>('recent')
const autoSelectedQuery = ref('')
let loadRequestId = 0
const simulations = ref<Array<{ scenario: SavedScenario; result: ScenarioSimulationResponse }>>([])

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const getSavedScenarioPayload = (scenario: SavedScenario) =>
  buildSavedScenarioSimulationRequest(scenario, (category) => t('planning.scenarios.baseline_adjustment_label', { category }))

const resolveSelectedIds = () => {
  const fromQuery = typeof route.query.scenarios === 'string' ? route.query.scenarios : ''
  const fromInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY) || ''
  const raw = fromQuery || fromInsights
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2)
  return { ids, origin: fromQuery ? 'selected' as const : fromInsights ? 'saved' as const : 'recent' as const }
}

const selectionSourceNote = computed(() => t(`insights.source_${selectionOrigin.value}`))

type InsightTheme = 'cashflow' | 'goals' | 'spending'

interface InsightCard {
  scenarioId: string
  scenarioLabel: string
  title: string
  description: string
  supporting: string
  sourceLabel: string
  icon: string
  iconColor: string
  theme: InsightTheme
  priority: number
}

const buildScenarioInsights = (scenario: SavedScenario, result: ScenarioSimulationResponse): InsightCard[] => {
  const scenarioLabel = t('insights.scenario_label', { name: scenario.name })
  if (result.decisionStatus === 'NO_DATA' || !['ACTION_NEEDED', 'WATCH', 'STABLE'].includes(result.decisionStatus)) {
    return [{
      scenarioId: scenario.id,
      scenarioLabel,
      title: t('insights.data_missing_title'),
      description: t('insights.data_missing_desc'),
      supporting: '',
      sourceLabel: t('insights.source_simulation'),
      icon: 'mdi-information-outline',
      iconColor: 'var(--cb-accent)',
      theme: 'cashflow',
      priority: 0,
    }]
  }
  const expenseDeltas = (scenario.deltas || []).filter((delta) =>
    delta.type === 'MONTHLY_EXPENSE' || delta.type === 'ONE_TIME_EXPENSE'
  )
  const largestExpenseDelta = expenseDeltas
    .slice()
    .sort((left, right) => Math.abs(Number(right.amount || 0)) - Math.abs(Number(left.amount || 0)))[0]
  const cards: InsightCard[] = [
    {
      scenarioId: scenario.id,
      scenarioLabel,
      title:
        result.decisionStatus === 'ACTION_NEEDED'
          ? t('insights.cash_pressure_title')
          : result.decisionStatus === 'WATCH'
            ? t('insights.cash_watch_title')
            : t('insights.cash_stability_title'),
      description:
        result.decisionStatus === 'ACTION_NEEDED'
          ? result.firstRiskMonth
            ? t('insights.cash_pressure_desc', { month: result.firstRiskMonth, amount: formatCurrency(result.projectedFinalBalance) })
            : t('insights.cash_pressure_no_month', { amount: formatCurrency(result.projectedFinalBalance) })
          : result.decisionStatus === 'WATCH'
            ? t('insights.cash_watch_desc')
            : t('insights.cash_stability_desc', { amount: formatCurrency(result.projectedFinalBalance) }),
      supporting: Number.isFinite(result.scenarioMonthlyImpact)
        ? t('insights.supporting_monthly_impact', { amount: formatCurrency(result.scenarioMonthlyImpact) })
        : '',
      sourceLabel:
        result.decisionStatus === 'ACTION_NEEDED'
          ? t('insights.source_cashflow_risk')
          : result.decisionStatus === 'WATCH'
            ? t('insights.source_simulation')
            : t('insights.source_cashflow_stable'),
      icon: result.decisionStatus === 'ACTION_NEEDED' ? 'mdi-alert-outline' : result.decisionStatus === 'WATCH' ? 'mdi-eye-outline' : 'mdi-check-circle-outline',
      iconColor: result.decisionStatus === 'ACTION_NEEDED' ? 'var(--cb-risk)' : result.decisionStatus === 'WATCH' ? 'var(--cb-warning)' : 'var(--cb-positive)',
      theme: 'cashflow' as const,
      priority: result.decisionStatus === 'ACTION_NEEDED' ? 0 : result.decisionStatus === 'WATCH' ? 1 : 4,
    },
  ]

  if (result.impactedGoalsCount > 0 || Number.isFinite(result.availableForGoals)) {
    cards.push({
      scenarioId: scenario.id,
      scenarioLabel,
      title:
        result.impactedGoalsCount > 0
          ? t('insights.goals_pressure_title')
          : t('insights.goals_room_title'),
      description:
        result.impactedGoalsCount > 0
          ? t('insights.goals_pressure_desc', {
              count: result.impactedGoalsCount,
              goal: result.impactedGoalNames?.[0] || t('insights.no_goal_name'),
            })
          : t('insights.goals_room_desc', {
              amount: formatCurrency(result.availableForGoals),
            }),
      supporting: Number.isFinite(result.availableForGoals)
        ? t('insights.supporting_available_for_goals', { amount: formatCurrency(result.availableForGoals) })
        : '',
      sourceLabel:
        result.impactedGoalsCount > 0
          ? t('insights.source_goals_pressure')
          : t('insights.source_goals_room'),
      icon: result.impactedGoalsCount > 0 ? 'mdi-flag-outline' : 'mdi-piggy-bank-outline',
      iconColor: result.impactedGoalsCount > 0 ? 'var(--cb-warning)' : 'var(--cb-primary)',
      theme: 'goals' as const,
      priority: result.impactedGoalsCount > 0 ? 1 : 4,
    })
  }

  if (largestExpenseDelta) {
    const isRecurringExpense = largestExpenseDelta.type === 'MONTHLY_EXPENSE'
    cards.push({
      scenarioId: scenario.id,
      scenarioLabel,
      title: isRecurringExpense
        ? t('insights.spending_pressure_title')
        : t('insights.spending_one_time_title'),
      description: isRecurringExpense
        ? t('insights.spending_pressure_desc', {
            label: largestExpenseDelta.label || t('insights.no_change_label'),
            amount: formatCurrency(largestExpenseDelta.amount),
          })
        : t('insights.spending_one_time_desc', {
            label: largestExpenseDelta.label || t('insights.no_change_label'),
            amount: formatCurrency(largestExpenseDelta.amount),
            month: result.firstRiskMonth || t('insights.no_risk_month'),
          }),
      supporting: t('insights.supporting_spending_change', {
        count: expenseDeltas.length,
      }),
      sourceLabel: t('insights.source_spending_changes'),
      icon: isRecurringExpense ? 'mdi-cash-minus' : 'mdi-calendar-alert-outline',
      iconColor: isRecurringExpense ? '#f97316' : '#7c3aed',
      theme: 'spending' as const,
      priority: isRecurringExpense ? 2 : 3,
    })
  }

  return cards
}

const insightCards = computed(() => simulations.value
  .flatMap(({ scenario, result }) => buildScenarioInsights(scenario, result))
  .sort((left, right) => left.priority - right.priority))
const leadInsight = computed(() => insightCards.value[0] || null)
const additionalInsights = computed(() => insightCards.value.slice(1))
const themeLabel = (theme: InsightTheme) => t(`insights.section_${theme}_title`)

const loadInsights = async () => {
  const requestId = ++loadRequestId
  isLoading.value = true
  error.value = ''
  accessDenied.value = false
  simulations.value = []
  selectedScenarioIds.value = []

  try {
    const { data } = await ScenarioService.list()
    if (!Array.isArray(data)) throw new Error('Unexpected scenarios response')
    const savedScenarios = data

    const preferred = resolveSelectedIds()
    const preferredScenarios = preferred.ids.length
      ? preferred.ids
          .map((id) => savedScenarios.find((scenario) => scenario.id === id))
          .filter((scenario): scenario is SavedScenario => Boolean(scenario))
      : []
    const picked = preferredScenarios.length ? preferredScenarios : savedScenarios.slice(0, 2)
    if (requestId !== loadRequestId) return

    selectedScenarioIds.value = picked.map((scenario) => scenario.id)
    selectionOrigin.value = preferredScenarios.length ? preferred.origin : 'recent'

    if (selectedScenarioIds.value.length && !route.query.scenarios) {
      const joined = selectedScenarioIds.value.join(',')
      autoSelectedQuery.value = joined
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, joined)
      await router.replace({
        query: {
          ...route.query,
          scenarios: joined,
        },
      })
    }

    const responses = await Promise.all(
      picked.map(async (scenario) => {
        const { data: simulation } = await ScenarioService.simulate(getSavedScenarioPayload(scenario))
        if (!simulation || typeof simulation.decisionStatus !== 'string') throw new Error('Unexpected simulation response')
        if (['ACTION_NEEDED', 'STABLE'].includes(simulation.decisionStatus) && !Number.isFinite(simulation.projectedFinalBalance)) {
          throw new Error('Missing projected balance in simulation response')
        }
        return { scenario, result: simulation }
      })
    )

    if (requestId !== loadRequestId) return
    simulations.value = responses
  } catch (loadError) {
    if (requestId !== loadRequestId) return
    console.error(loadError)
    accessDenied.value = (loadError as { response?: { status?: number } })?.response?.status === 403
    error.value = t(accessDenied.value ? 'insights.access_denied' : 'insights.load_error')
    simulations.value = []
  } finally {
    if (requestId === loadRequestId) isLoading.value = false
  }
}

const goToDecisions = async () => {
  const query = selectedScenarioIds.value.length
    ? { scenarios: selectedScenarioIds.value.join(',') }
    : undefined
  await router.push({ path: '/decisions', query })
}

const goToScenarios = async () => {
  const scenarioId = selectedScenarioIds.value[0]
  if (scenarioId) {
    await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
    return
  }
  await router.push({ name: 'planning-scenarios' })
}

const openScenario = async (scenarioId: string) => {
  window.localStorage.setItem(INSIGHTS_STORAGE_KEY, scenarioId)
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

watch(
  () => route.query.scenarios,
  async (query) => {
    if (query === autoSelectedQuery.value) {
      autoSelectedQuery.value = ''
      return
    }
    await loadInsights()
  }
)

onMounted(async () => {
  await loadInsights()
})
</script>

<style scoped>
.cb-page {
  min-width: 0;
}

.cb-scope-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 20px;
}

.insights-content {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.insights-origin {
  color: var(--cb-ink-secondary);
  font-size: .88rem;
  line-height: 1.5;
  margin: 0;
  max-width: 70ch;
}

.insights-empty-state h2,
.insights-additional h2 {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1.2rem;
  margin: 0 0 12px;
}

.insights-empty-state .v-btn {
  margin-top: 12px;
}

.cb-insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
}

.cb-insight-card {
  border-radius: var(--cb-radius-card, 12px);
  padding: clamp(18px, 3vw, 26px);
  background: var(--cb-surface);
  border: 1px solid var(--cb-border-card);
  box-shadow: var(--cb-shadow-card, 0 2px 8px rgba(23,32,51,.06));
  display: grid;
  gap: 12px;
  min-width: 0;
}

.cb-insight-card--lead {
  background: var(--cb-surface-soft);
  gap: 16px;
}

.cb-insight-card--lead .cb-insight-card__title {
  font-size: clamp(1.25rem, 3vw, 1.65rem);
}

.cb-insight-card--lead > .v-btn {
  justify-self: start;
}

.cb-insight-card__eyebrow {
  color: var(--cb-ink-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.cb-insight-card__header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.cb-insight-card__title {
  margin: 0;
  font-family: var(--cb-font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--cb-ink);
}

.cb-insight-card__description {
  margin: 0;
  font-size: .92rem;
  color: var(--cb-ink-secondary);
  line-height: 1.5;
}

.cb-insight-card__supporting {
  margin: 0;
  font-size: .86rem;
  font-weight: 600;
  color: var(--cb-ink-secondary);
}

.cb-insight-card__provenance {
  border-top: 1px solid var(--cb-border-card);
  color: var(--cb-ink-muted);
  display: grid;
  font-size: .8rem;
  gap: 4px;
  line-height: 1.4;
  padding-top: 12px;
}

.insights-footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 600px) {
  .insights-footer-actions .v-btn {
    max-width: 100%;
  }
}
</style>
