<template>
  <div class="cb-page">
    <div class="cb-container">
      <!-- Page header with summary strip -->
      <page-header :title="t('insights.title')" :summary-items="insightSummaryItems">
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" @click="goToDecisions">
            <v-icon start>mdi-arrow-left</v-icon>
            {{ t('insights.back_to_decisions') }}
          </v-btn>
          <v-btn
            v-if="selectedScenarioIds.length"
            variant="tonal"
            color="var(--cb-primary)"
            @click="goToScenarios"
          >
            <v-icon start>mdi-chart-timeline-variant</v-icon>
            {{ t('insights.review_in_scenarios') }}
          </v-btn>
        </template>
      </page-header>

      <!-- Scope note -->
      <div class="cb-scope-note">
        <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
        <span>{{ t('transactionVisibility.insightsScopeNote') }}</span>
      </div>

      <!-- Error alert -->
      <alert-strip v-if="error" variant="risk" :title="t('insights.error_title', 'Erro ao carregar insights')" :description="error" />

      <!-- Loading state -->
      <div v-if="isLoading" class="cb-empty-state">
        <v-icon size="40">mdi-timer-sand</v-icon>
        <p>{{ t('insights.loading') }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isLoading && !error && !groupedInsightSections.length" class="cb-empty-state">
        <v-icon size="40">mdi-lightbulb-auto-outline</v-icon>
        <p>{{ t('insights.empty') }}</p>
      </div>

      <!-- Insights grouped by theme (collapsible) -->
      <v-expansion-panels
        v-else-if="groupedInsightSections.length"
        variant="accordion"
        class="cb-insights-panels"
        multiple
        :model-value="groupedInsightSections.map((s) => s.key)"
      >
        <v-expansion-panel
          v-for="section in groupedInsightSections"
          :key="section.key"
          :value="section.key"
        >
          <v-expansion-panel-title>
            <div class="cb-insights-panel-title">
              <span>{{ section.title }}</span>
              <v-chip size="x-small" variant="tonal" color="var(--cb-primary)" class="ml-2">{{ section.countLabel }}</v-chip>
            </div>
            <p class="cb-insights-panel-subtitle">{{ section.subtitle }}</p>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="cb-insights-grid">
              <div
                v-for="insight in section.items"
                :key="`${insight.scenarioId}-${insight.title}`"
                class="cb-insight-card"
              >
                <div class="cb-insight-card__header">
                  <v-icon :color="insight.iconColor" size="20">{{ insight.icon }}</v-icon>
                  <div class="cb-insight-card__title-wrap">
                    <h3 class="cb-insight-card__title">{{ insight.title }}</h3>
                    <p class="cb-insight-card__scenario">{{ insight.scenarioLabel }}</p>
                  </div>
                </div>
                <p class="cb-insight-card__description">{{ insight.description }}</p>
                <div class="cb-insight-card__meta">
                  <span>{{ insight.supporting }}</span>
                  <span class="cb-insight-card__source">{{ insight.sourceLabel }}</span>
                </div>
                <div class="cb-insight-card__actions">
                  <v-btn variant="text" color="var(--cb-primary)" size="small" @click="openScenario(insight.scenarioId)">
                    <v-icon start>mdi-pencil-outline</v-icon>
                    {{ t('insights.open_scenario') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario, type ScenarioSimulationResponse } from '@/services/ScenarioService'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const INSIGHTS_STORAGE_KEY = 'insights-scenarios'

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
  scenarioType: scenario.scenarioType,
  sourceType: scenario.sourceType,
  months: scenario.months || 6,
  debtInput: scenario.debtInput || undefined,
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
  const raw = fromQuery || fromInsights
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
      iconColor: result.impactedGoalsCount > 0 ? '#f59e0b' : 'var(--cb-primary)',
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

const insightSummaryItems = computed(() => {
  const total = insightCards.value.length
  const sections = groupedInsightSections.value
  return [
    { label: t('insights.total_insights', 'Total de insights'), value: String(total) },
    ...sections.flatMap((s, i) => [
      { divider: true },
      { label: s.title, value: String(s.items.length) },
    ]),
  ]
})

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
  async () => {
    await loadInsights()
  }
)

onMounted(async () => {
  await loadInsights()
})
</script>

<style scoped>
/* Scope note */
.cb-scope-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 20px;
}

/* Expansion panels */
.cb-insights-panels {
  border-radius: var(--cb-radius-card, 12px);
  overflow: hidden;
  border: 1px solid var(--cb-border-card);
}

.cb-insights-panel-title {
  display: flex;
  align-items: center;
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--cb-ink);
}

.cb-insights-panel-subtitle {
  margin: 2px 0 0;
  font-size: .82rem;
  color: var(--cb-ink-muted);
}

/* Insights grid */
.cb-insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  padding-top: 8px;
}

/* Insight card */
.cb-insight-card {
  border-radius: var(--cb-radius-card, 12px);
  padding: 18px;
  background: var(--cb-surface);
  border: 1px solid var(--cb-border-card);
  box-shadow: var(--cb-shadow-card, 0 2px 8px rgba(23,32,51,.06));
  display: grid;
  gap: 10px;
}

.cb-insight-card__header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.cb-insight-card__title-wrap {
  display: grid;
  gap: 3px;
}

.cb-insight-card__title {
  margin: 0;
  font-family: var(--cb-font-heading);
  font-size: .95rem;
  font-weight: 700;
  color: var(--cb-ink);
}

.cb-insight-card__scenario {
  margin: 0;
  font-size: .8rem;
  color: var(--cb-ink-muted);
}

.cb-insight-card__description {
  margin: 0;
  font-size: .875rem;
  color: var(--cb-ink-secondary);
  line-height: 1.5;
}

.cb-insight-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: .82rem;
  color: var(--cb-ink-secondary);
}

.cb-insight-card__source {
  font-size: .78rem;
  color: var(--cb-ink-muted);
}

.cb-insight-card__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
