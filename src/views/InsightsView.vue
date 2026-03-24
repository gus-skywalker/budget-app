<template>
  <div class="insights-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('insights.title') }}</h1>
          <p class="page-subtitle">{{ $t('insights.subtitle') }}</p>
        </div>
      </div>

      <div class="scope-badge-row">
        <v-chip size="small" color="#667eea" variant="outlined">
          <v-icon start size="14">mdi-account-group-outline</v-icon>
          {{ $t('transactionVisibility.insightsBadge') }}
        </v-chip>
        <span class="scope-badge-note">{{ $t('transactionVisibility.insightsScopeNote') }}</span>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-brain</v-icon>
            {{ $t('insights.list_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div class="insights-toolbar">
            <p class="insights-note">{{ insightsSourceNote }}</p>
            <div class="insights-toolbar__actions">
              <v-btn variant="text" color="#667eea" @click="goToDecisions">
                <v-icon start>mdi-arrow-left</v-icon>
                {{ $t('insights.back_to_decisions') }}
              </v-btn>
              <v-btn
                v-if="selectedScenarioIds.length"
                variant="tonal"
                color="#667eea"
                @click="goToScenarios"
              >
                <v-icon start>mdi-chart-timeline-variant</v-icon>
                {{ $t('insights.review_in_scenarios') }}
              </v-btn>
            </div>
          </div>

          <div v-if="isLoading" class="empty-state">
            <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
            <p>{{ $t('insights.loading') }}</p>
          </div>

          <div v-else-if="error" class="empty-state empty-state--error">
            <v-icon color="#ef4444" size="28">mdi-alert-circle-outline</v-icon>
            <p>{{ error }}</p>
          </div>

          <div v-else-if="groupedInsightSections.length" class="insights-sections">
            <section
              v-for="section in groupedInsightSections"
              :key="section.key"
              class="insights-section"
            >
              <div class="insights-section__header">
                <div>
                  <h3 class="insights-section__title">{{ section.title }}</h3>
                  <p class="insights-section__subtitle">{{ section.subtitle }}</p>
                </div>
                <v-chip size="x-small" variant="tonal" color="#667eea">
                  {{ section.countLabel }}
                </v-chip>
              </div>

              <div class="insights-grid">
                <div v-for="insight in section.items" :key="`${insight.scenarioId}-${insight.title}`" class="insight-card">
                  <div class="insight-card__header">
                    <v-icon :color="insight.iconColor">{{ insight.icon }}</v-icon>
                    <div class="insight-card__title-wrap">
                      <h3 class="insight-card__title">{{ insight.title }}</h3>
                      <p class="insight-card__scenario">{{ insight.scenarioLabel }}</p>
                    </div>
                  </div>
                  <p class="insight-card__description">{{ insight.description }}</p>
                  <div class="insight-card__meta">
                    <span>{{ insight.supporting }}</span>
                    <span class="insight-card__source">{{ insight.sourceLabel }}</span>
                  </div>
                  <div class="insight-card__actions">
                    <v-btn variant="text" color="#667eea" @click="openScenario(insight.scenarioId)">
                      <v-icon start>mdi-pencil-outline</v-icon>
                      {{ $t('insights.open_scenario') }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div v-else class="empty-state">
            <v-icon color="#94a3b8" size="28">mdi-lightbulb-auto-outline</v-icon>
            <p>{{ $t('insights.empty') }}</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario, type ScenarioSimulationResponse } from '@/services/ScenarioService'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const INSIGHTS_STORAGE_KEY = 'insights-scenarios'
const DECISIONS_STORAGE_KEY = 'decisions-scenarios'

const isLoading = ref(false)
const error = ref('')
const selectedScenarioIds = ref<string[]>([])
const simulations = ref<Array<{ scenario: SavedScenario; result: ScenarioSimulationResponse }>>([])

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const getSavedScenarioPayload = (scenario: SavedScenario) => ({
  id: scenario.id,
  name: scenario.name,
  months: scenario.months || 6,
  deltas: (scenario.deltas || []).map((delta) => ({
    label: delta.label,
    type: delta.type,
    amount: Number(delta.amount || 0),
    startMonthOffset: Number(delta.startMonthOffset || 0),
  })),
})

const resolveSelectedIds = () => {
  const fromQuery = typeof route.query.scenarios === 'string' ? route.query.scenarios : ''
  const fromInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY) || ''
  const fromDecisions = window.localStorage.getItem(DECISIONS_STORAGE_KEY) || ''
  const raw = fromQuery || fromInsights || fromDecisions
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2)
}

const insightsSourceNote = computed(() =>
  selectedScenarioIds.value.length
    ? t('insights.source_selected', { count: selectedScenarioIds.value.length })
    : t('insights.source_recent')
)

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
}

const buildScenarioInsights = (scenario: SavedScenario, result: ScenarioSimulationResponse): InsightCard[] => {
  const scenarioLabel = t('insights.scenario_label', { name: scenario.name })
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
          : t('insights.cash_stability_title'),
      description:
        result.decisionStatus === 'ACTION_NEEDED'
          ? t('insights.cash_pressure_desc', {
              month: result.firstRiskMonth || t('insights.no_risk_month'),
              amount: formatCurrency(result.projectedFinalBalance),
            })
          : t('insights.cash_stability_desc', {
              amount: formatCurrency(result.projectedFinalBalance),
            }),
      supporting: t('insights.supporting_monthly_impact', {
        amount: formatCurrency(result.scenarioMonthlyImpact),
      }),
      sourceLabel:
        result.decisionStatus === 'ACTION_NEEDED'
          ? t('insights.source_cashflow_risk')
          : t('insights.source_cashflow_stable'),
      icon: result.decisionStatus === 'ACTION_NEEDED' ? 'mdi-alert-outline' : 'mdi-check-circle-outline',
      iconColor: result.decisionStatus === 'ACTION_NEEDED' ? '#ef4444' : '#16a34a',
      theme: 'cashflow' as const,
    },
    {
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
      supporting: t('insights.supporting_available_for_goals', {
        amount: formatCurrency(result.availableForGoals),
      }),
      sourceLabel:
        result.impactedGoalsCount > 0
          ? t('insights.source_goals_pressure')
          : t('insights.source_goals_room'),
      icon: result.impactedGoalsCount > 0 ? 'mdi-flag-outline' : 'mdi-piggy-bank-outline',
      iconColor: result.impactedGoalsCount > 0 ? '#f59e0b' : '#667eea',
      theme: 'goals' as const,
    },
  ]

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
    })
  }

  return cards
}

const insightCards = computed(() =>
  simulations.value.flatMap(({ scenario, result }) => buildScenarioInsights(scenario, result))
)

const groupedInsightSections = computed(() => {
  const themeMeta: Record<InsightTheme, { title: string; subtitle: string }> = {
    cashflow: {
      title: t('insights.section_cashflow_title'),
      subtitle: t('insights.section_cashflow_subtitle'),
    },
    goals: {
      title: t('insights.section_goals_title'),
      subtitle: t('insights.section_goals_subtitle'),
    },
    spending: {
      title: t('insights.section_spending_title'),
      subtitle: t('insights.section_spending_subtitle'),
    },
  }

  return (Object.keys(themeMeta) as InsightTheme[])
    .map((theme) => {
      const items = insightCards.value.filter((insight) => insight.theme === theme)
      if (!items.length) return null
      return {
        key: theme,
        title: themeMeta[theme].title,
        subtitle: themeMeta[theme].subtitle,
        countLabel: t('insights.section_count', { count: items.length }),
        items,
      }
    })
    .filter((section): section is NonNullable<typeof section> => Boolean(section))
})

const loadInsights = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const { data } = await ScenarioService.list()
    const savedScenarios = Array.isArray(data) ? data : []

    const preferredIds = resolveSelectedIds()
    const picked = preferredIds.length
      ? preferredIds
          .map((id) => savedScenarios.find((scenario) => scenario.id === id))
          .filter((scenario): scenario is SavedScenario => Boolean(scenario))
      : savedScenarios.slice(0, 2)

    selectedScenarioIds.value = picked.map((scenario) => scenario.id)

    if (selectedScenarioIds.value.length) {
      const joined = selectedScenarioIds.value.join(',')
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, joined)
      window.localStorage.setItem(DECISIONS_STORAGE_KEY, joined)
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
        return { scenario, result: simulation }
      })
    )

    simulations.value = responses
  } catch (loadError) {
    console.error(loadError)
    error.value = t('insights.load_error')
    simulations.value = []
  } finally {
    isLoading.value = false
  }
}

const goToDecisions = async () => {
  const query = selectedScenarioIds.value.length
    ? { scenarios: selectedScenarioIds.value.join(',') }
    : undefined
  await router.push({ path: '/decisions', query })
}

const goToScenarios = async () => {
  const query = selectedScenarioIds.value.length
    ? { scenarios: selectedScenarioIds.value.join(',') }
    : undefined
  await router.push({ path: '/planning/scenarios', query })
}

const openScenario = async (scenarioId: string) => {
  window.localStorage.setItem(INSIGHTS_STORAGE_KEY, scenarioId)
  await router.push({
    path: '/planning/scenarios',
    query: { scenarios: scenarioId },
  })
}

watch(
  () => route.query.scenarios,
  async () => {
    await loadInsights()
  }
)

onMounted(async () => {
  await loadInsights()
})
</script>

<style scoped>
.insights-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .insights-page {
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

.scope-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.scope-badge-note {
  color: #64748b;
  font-size: 0.92rem;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

.v-theme--dark .scope-badge-note {
  color: #cbd5e1;
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
  gap: 18px;
}

.insights-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.insights-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.insights-note {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
  max-width: 720px;
}

.insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.insights-sections {
  display: grid;
  gap: 20px;
}

.insights-section {
  display: grid;
  gap: 14px;
}

.insights-section__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.insights-section__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.insights-section__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.insight-card {
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.12);
  display: grid;
  gap: 12px;
}

.v-theme--dark .insight-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
}

.insight-card__header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.insight-card__title-wrap {
  display: grid;
  gap: 4px;
}

.insight-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .insight-card__title {
  color: #ffffff;
}

.insight-card__scenario {
  margin: 0;
  color: #667085;
  font-size: 0.9rem;
}

.insight-card__description {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.v-theme--dark .insight-card__description,
.v-theme--dark .insight-card__scenario {
  color: #cbd5e1;
}

.insight-card__meta {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
  color: #4a4a4a;
}

.insight-card__source {
  color: #667085;
  font-size: 0.84rem;
}

.insight-card__actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
  padding: 32px 18px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.35);
  color: #64748b;
}

.empty-state--error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .insights-toolbar {
    flex-direction: column;
  }

  .insights-toolbar__actions {
    justify-content: flex-start;
  }
}
</style>
