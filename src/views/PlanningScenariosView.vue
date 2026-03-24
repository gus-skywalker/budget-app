<template>
  <div class="planning-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('planning.scenarios.title') }}</h1>
          <p class="page-subtitle">{{ $t('planning.scenarios.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-layers-triple-outline</v-icon>
            {{ $t('planning.scenarios.card_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div class="scenario-layout">
            <section class="scenario-builder">
              <div class="scenario-intro">
                <h3>{{ $t('planning.scenarios.builder_title') }}</h3>
                <p>{{ $t('planning.scenarios.builder_subtitle') }}</p>
              </div>

              <div class="scenario-templates">
                <div class="scenario-templates__header">
                  <div>
                    <h4>{{ $t('planning.scenarios.templates_title') }}</h4>
                    <p>{{ $t('planning.scenarios.templates_subtitle') }}</p>
                  </div>
                </div>

                <div class="scenario-templates__grid">
                  <button
                    v-for="template in scenarioTemplates"
                    :key="template.key"
                    type="button"
                    class="scenario-template-card"
                    @click="applyTemplate(template.key)"
                  >
                    <div class="scenario-template-card__header">
                      <v-icon color="#667eea">{{ template.icon }}</v-icon>
                      <span class="scenario-template-card__badge">
                        {{ $t('planning.scenarios.template_badge') }}
                      </span>
                    </div>
                    <strong>{{ template.title }}</strong>
                    <p>{{ template.description }}</p>
                  </button>
                </div>
              </div>

              <v-text-field
                v-model="scenarioName"
                :label="$t('planning.scenarios.name')"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <v-text-field
                v-model.number="months"
                :label="$t('planning.scenarios.months')"
                type="number"
                min="1"
                max="24"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />

              <div class="delta-section">
                <div class="delta-section__header">
                  <div>
                    <h4>{{ $t('planning.scenarios.deltas_title') }}</h4>
                    <p>{{ $t('planning.scenarios.deltas_subtitle') }}</p>
                  </div>
                  <v-btn color="#667eea" variant="tonal" @click="addDelta">
                    <v-icon start>mdi-plus</v-icon>
                    {{ $t('planning.scenarios.add_delta') }}
                  </v-btn>
                </div>

                <div v-if="deltas.length" class="delta-list">
                  <div v-for="(delta, index) in deltas" :key="index" class="delta-card">
                    <div class="delta-card__fields">
                      <v-text-field
                        v-model="delta.label"
                        :label="$t('planning.scenarios.delta_label')"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                      <v-select
                        v-model="delta.type"
                        :items="deltaTypeOptions"
                        item-title="title"
                        item-value="value"
                        :label="$t('planning.scenarios.delta_type')"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                      <v-text-field
                        v-model.number="delta.amount"
                        :label="$t('planning.scenarios.delta_amount')"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                      <v-text-field
                        v-model.number="delta.startMonthOffset"
                        :label="$t('planning.scenarios.delta_start_month')"
                        type="number"
                        min="0"
                        max="23"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </div>
                    <div class="delta-card__actions">
                      <span class="delta-card__hint">{{ deltaTypeDescription(delta.type) }}</span>
                      <v-btn icon variant="text" color="error" @click="removeDelta(index)">
                        <v-icon>mdi-delete-outline</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-deltas">
                  <v-icon color="#94a3b8">mdi-playlist-plus</v-icon>
                  <p>{{ $t('planning.scenarios.empty_deltas') }}</p>
                </div>

                <div class="scenario-tip">
                  <div class="scenario-tip__header">
                    <v-icon color="#667eea">mdi-lightbulb-on-outline</v-icon>
                    <strong>{{ $t('planning.scenarios.tip_title') }}</strong>
                  </div>
                  <p>{{ $t('planning.scenarios.tip_subtitle') }}</p>
                  <ul class="scenario-tip__examples">
                    <li>{{ $t('planning.scenarios.tip_example_marketing') }}</li>
                    <li>{{ $t('planning.scenarios.tip_example_hiring') }}</li>
                    <li>{{ $t('planning.scenarios.tip_example_cutting') }}</li>
                  </ul>
                </div>
              </div>

              <div class="builder-actions">
                <div class="builder-actions__buttons">
                  <v-btn
                    color="#667eea"
                    size="large"
                    :disabled="isLoading || !canSimulate"
                    @click="simulateScenario"
                  >
                    <v-icon start>mdi-chart-line-variant</v-icon>
                    {{ isLoading ? $t('planning.scenarios.simulating') : $t('planning.scenarios.simulate') }}
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    size="large"
                    :disabled="isSaving || !canSimulate"
                    @click="saveScenario()"
                  >
                    <v-icon start>mdi-content-save-outline</v-icon>
                    {{ isSaving ? $t('planning.scenarios.saving') : $t('planning.scenarios.save') }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    size="large"
                    :disabled="isLoading || isSaving"
                    @click="resetScenarioBuilder"
                  >
                    <v-icon start>mdi-file-plus-outline</v-icon>
                    {{ $t('planning.scenarios.new_scenario') }}
                  </v-btn>
                  <v-btn
                    v-if="currentScenarioId"
                    variant="text"
                    size="large"
                    :disabled="isSaving || !canSimulate"
                    @click="saveScenario(true)"
                  >
                    <v-icon start>mdi-content-copy</v-icon>
                    {{ $t('planning.scenarios.save_as_new') }}
                  </v-btn>
                </div>
                <span v-if="currentScenarioId" class="builder-actions__context">
                  {{ $t('planning.scenarios.editing_saved', { name: scenarioName || $t('planning.scenarios.default_name') }) }}
                </span>
                <span v-if="error" class="error-message">{{ error }}</span>
                <span v-if="successMessage" class="success-message">{{ successMessage }}</span>
              </div>
            </section>

            <section class="scenario-results">
              <div class="scenario-intro">
                <h3>{{ $t('planning.scenarios.results_title') }}</h3>
                <p>{{ predictionSubtitle }}</p>
              </div>

              <div v-if="result" class="results-content">
                <div class="results-grid">
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.current_balance') }}</span>
                    <strong>{{ formatCurrency(result.currentBalance) }}</strong>
                  </div>
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.monthly_impact') }}</span>
                    <strong :class="{ 'negative-value': result.scenarioMonthlyImpact < 0 }">
                      {{ formatCurrency(result.scenarioMonthlyImpact) }}
                    </strong>
                  </div>
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.final_balance') }}</span>
                    <strong :class="{ 'negative-value': result.projectedFinalBalance < 0 }">
                      {{ formatCurrency(result.projectedFinalBalance) }}
                    </strong>
                  </div>
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.status') }}</span>
                    <strong :class="['decision-pill', decisionTone]">{{ decisionLabel }}</strong>
                  </div>
                </div>

                <div class="summary-callout">
                  <v-icon color="#667eea">mdi-lightbulb-outline</v-icon>
                  <span>{{ result.summary }}</span>
                </div>

                <div class="results-grid results-grid--secondary">
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.available_for_goals') }}</span>
                    <strong>{{ formatCurrency(result.availableForGoals) }}</strong>
                  </div>
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.risk_month') }}</span>
                    <strong>{{ result.firstRiskMonth || $t('planning.scenarios.no_risk_month') }}</strong>
                  </div>
                  <div class="result-card">
                    <span>{{ $t('planning.scenarios.impacted_goals') }}</span>
                    <strong>{{ result.impactedGoalsCount }}</strong>
                  </div>
                </div>

                <div v-if="result.impactedGoalNames?.length" class="goal-tags">
                  <span class="goal-tags__label">{{ $t('planning.scenarios.impacted_goals_list') }}</span>
                  <v-chip
                    v-for="goal in result.impactedGoalNames"
                    :key="goal"
                    size="small"
                    variant="tonal"
                    color="warning"
                  >
                    {{ goal }}
                  </v-chip>
                </div>

                <div class="forecast-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{{ $t('planning.scenarios.table_month') }}</th>
                        <th>{{ $t('planning.scenarios.table_baseline') }}</th>
                        <th>{{ $t('planning.scenarios.table_scenario') }}</th>
                        <th>{{ $t('planning.scenarios.table_delta') }}</th>
                        <th>{{ $t('planning.scenarios.table_status') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in result.forecast" :key="item.month">
                        <td>{{ item.month }}</td>
                        <td>{{ formatCurrency(item.baselineProjectedBalance) }}</td>
                        <td>{{ formatCurrency(item.scenarioProjectedBalance) }}</td>
                        <td :class="{ 'negative-value': item.deltaImpact < 0 }">
                          {{ formatCurrency(item.deltaImpact) }}
                        </td>
                        <td>
                          <span :class="['status-chip', item.status === 'deficit' ? 'status-chip--danger' : 'status-chip--success']">
                            {{ item.status === 'deficit' ? $t('planning.scenarios.status_deficit') : $t('planning.scenarios.status_surplus') }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else class="empty-results">
                <v-icon color="#94a3b8" size="28">mdi-chart-timeline-variant</v-icon>
                <p>{{ $t('planning.scenarios.results_placeholder') }}</p>
              </div>

              <div class="saved-scenarios">
                <div class="saved-scenarios__header">
                  <div>
                    <h3>{{ $t('planning.scenarios.saved_title') }}</h3>
                    <p>{{ $t('planning.scenarios.saved_subtitle') }}</p>
                  </div>
                  <div class="saved-scenarios__header-actions">
                    <v-btn
                      v-if="selectedScenarioIds.length"
                      variant="text"
                      color="#667eea"
                      @click="openInDecisions(selectedScenarioIds)"
                    >
                      <v-icon start>mdi-arrow-top-right</v-icon>
                      {{ $t('planning.scenarios.open_in_decisions') }}
                    </v-btn>
                    <v-btn
                      variant="tonal"
                      color="#667eea"
                      :disabled="selectedScenarioIds.length !== 2 || isComparing"
                      @click="compareSelectedScenarios"
                    >
                      <v-icon start>mdi-compare</v-icon>
                      {{ isComparing ? $t('planning.scenarios.comparing') : $t('planning.scenarios.compare_action') }}
                    </v-btn>
                  </div>
                </div>
                <p class="saved-scenarios__selection-note">
                  {{ $t('planning.scenarios.compare_hint', { count: selectedScenarioIds.length }) }}
                </p>

                <div v-if="comparisonEntries.length" class="comparison-panel">
                  <div class="comparison-panel__header">
                    <div>
                      <h3>{{ $t('planning.scenarios.compare_title') }}</h3>
                      <p>{{ $t('planning.scenarios.compare_subtitle') }}</p>
                    </div>
                    <div class="comparison-panel__actions">
                      <v-btn
                        variant="text"
                        color="#667eea"
                        @click="copyComparisonLink"
                      >
                        <v-icon start>mdi-link-variant</v-icon>
                        {{ $t('planning.scenarios.copy_compare_link') }}
                      </v-btn>
                      <v-btn
                        variant="tonal"
                        color="#667eea"
                        @click="saveCurrentComparison"
                      >
                        <v-icon start>mdi-content-save-outline</v-icon>
                        {{ $t('planning.scenarios.compare_save_action') }}
                      </v-btn>
                    </div>
                  </div>

                  <div class="comparison-grid">
                    <div v-for="entry in comparisonEntries" :key="entry.saved.id" class="comparison-card">
                      <div class="comparison-card__header">
                        <strong>{{ entry.saved.name }}</strong>
                        <span :class="['status-chip', savedScenarioTone(entry.saved)]">
                          {{ savedScenarioLabel(entry.saved) }}
                        </span>
                      </div>
                      <div class="comparison-card__metrics">
                        <div class="comparison-metric" :class="{ 'comparison-metric--winner': winnerFor('finalBalance') === entry.saved.id }">
                          <span>{{ $t('planning.scenarios.final_balance') }}</span>
                          <strong>{{ formatCurrency(entry.result.projectedFinalBalance) }}</strong>
                        </div>
                        <div class="comparison-metric" :class="{ 'comparison-metric--winner': winnerFor('availableForGoals') === entry.saved.id }">
                          <span>{{ $t('planning.scenarios.available_for_goals') }}</span>
                          <strong>{{ formatCurrency(entry.result.availableForGoals) }}</strong>
                        </div>
                        <div class="comparison-metric" :class="{ 'comparison-metric--winner': winnerFor('impactedGoals') === entry.saved.id }">
                          <span>{{ $t('planning.scenarios.impacted_goals') }}</span>
                          <strong>{{ entry.result.impactedGoalsCount }}</strong>
                        </div>
                        <div class="comparison-metric" :class="{ 'comparison-metric--winner': winnerFor('riskMonth') === entry.saved.id }">
                          <span>{{ $t('planning.scenarios.risk_month') }}</span>
                          <strong>{{ entry.result.firstRiskMonth || $t('planning.scenarios.no_risk_month') }}</strong>
                        </div>
                      </div>
                      <p class="comparison-card__summary">{{ entry.result.summary }}</p>
                    </div>
                  </div>

                  <div class="comparison-highlights">
                    <div class="summary-callout summary-callout--comparison">
                      <v-icon color="#7c3aed">mdi-star-four-points-outline</v-icon>
                      <span>{{ comparisonHighlights.overall }}</span>
                    </div>
                    <div class="summary-callout summary-callout--comparison">
                      <v-icon color="#667eea">mdi-trophy-outline</v-icon>
                      <span>{{ comparisonHighlights.finalBalance }}</span>
                    </div>
                    <div class="summary-callout summary-callout--comparison">
                      <v-icon color="#16a34a">mdi-piggy-bank-outline</v-icon>
                      <span>{{ comparisonHighlights.goals }}</span>
                    </div>
                    <div class="summary-callout summary-callout--comparison">
                      <v-icon color="#f59e0b">mdi-timer-sand</v-icon>
                      <span>{{ comparisonHighlights.risk }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="savedComparisons.length" class="saved-comparisons">
                  <div class="saved-comparisons__header">
                    <div>
                      <h3>{{ $t('planning.scenarios.saved_comparisons_title') }}</h3>
                      <p>{{ $t('planning.scenarios.saved_comparisons_subtitle') }}</p>
                    </div>
                  </div>

                  <div class="saved-comparisons__list">
                    <button
                      v-for="comparison in savedComparisons"
                      :key="comparison.id"
                      type="button"
                      class="saved-comparison-card"
                      @click="loadSavedComparison(comparison)"
                    >
                      <div class="saved-comparison-card__header">
                        <strong>{{ comparison.name }}</strong>
                        <div class="saved-comparison-card__actions">
                          <v-btn
                            variant="text"
                            density="comfortable"
                            size="small"
                            @click.stop="loadSavedComparison(comparison)"
                          >
                            <v-icon start>mdi-compare</v-icon>
                            {{ $t('planning.scenarios.compare_open_saved') }}
                          </v-btn>
                          <v-btn
                            variant="text"
                            density="comfortable"
                            size="small"
                            color="error"
                            @click.stop="deleteSavedComparison(comparison)"
                          >
                            <v-icon start>mdi-delete-outline</v-icon>
                            {{ $t('planning.scenarios.delete_action') }}
                          </v-btn>
                        </div>
                      </div>
                      <p>
                        {{ comparison.leftScenarioName || comparison.leftScenarioId }}
                        <span class="saved-comparison-card__vs">vs</span>
                        {{ comparison.rightScenarioName || comparison.rightScenarioId }}
                      </p>
                    </button>
                  </div>
                </div>

                <div v-if="savedScenarios.length" class="saved-scenarios__list">
                  <button
                    v-for="scenario in savedScenarios"
                    :key="scenario.id"
                    type="button"
                    class="saved-scenario-card"
                    @click="loadSavedScenario(scenario)"
                  >
                    <div class="saved-scenario-card__header">
                      <strong>{{ scenario.name }}</strong>
                      <div class="saved-scenario-card__header-actions">
                        <span :class="['status-chip', savedScenarioTone(scenario)]">
                          {{ savedScenarioLabel(scenario) }}
                        </span>
                        <div class="saved-scenario-card__quick-actions">
                          <v-btn
                            variant="text"
                            density="comfortable"
                            size="small"
                            @click.stop="openInDecisions([scenario.id])"
                          >
                            <v-icon start>mdi-arrow-top-right</v-icon>
                            {{ $t('planning.scenarios.open_in_decisions') }}
                          </v-btn>
                          <v-btn
                            variant="text"
                            density="comfortable"
                            size="small"
                            @click.stop="loadSavedScenario(scenario)"
                          >
                            <v-icon start>mdi-pencil-outline</v-icon>
                            {{ $t('planning.scenarios.edit_action') }}
                          </v-btn>
                          <v-btn
                            variant="text"
                            density="comfortable"
                            size="small"
                            color="error"
                            @click.stop="deleteScenario(scenario)"
                          >
                            <v-icon start>mdi-delete-outline</v-icon>
                            {{ $t('planning.scenarios.delete_action') }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                    <div class="saved-scenario-card__compare">
                      <v-checkbox-btn
                        :model-value="selectedScenarioIds.includes(scenario.id)"
                        :disabled="!selectedScenarioIds.includes(scenario.id) && selectedScenarioIds.length >= 2"
                        @click.stop
                        @update:model-value="toggleScenarioSelection(scenario.id, $event)"
                      />
                      <span>{{ $t('planning.scenarios.compare_select') }}</span>
                    </div>
                    <p>{{ scenario.summary || scenario.description || $t('planning.scenarios.saved_no_summary') }}</p>
                    <div class="saved-scenario-card__meta">
                      <span v-if="scenario.scenarioMonthlyImpact !== undefined && scenario.scenarioMonthlyImpact !== null">
                        {{ formatCurrency(scenario.scenarioMonthlyImpact) }}
                      </span>
                      <span v-if="scenario.impactedGoalsCount">
                        {{ $t('planning.scenarios.saved_impacted_goals', { count: scenario.impactedGoalsCount }) }}
                      </span>
                    </div>
                  </button>
                </div>
                <div v-else class="empty-deltas">
                  <v-icon color="#94a3b8">mdi-content-save-outline</v-icon>
                  <p>{{ $t('planning.scenarios.saved_placeholder') }}</p>
                </div>
              </div>
            </section>
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
import ScenarioService, { type SavedScenario, type SavedScenarioComparison, type ScenarioDeltaInput, type ScenarioDeltaType, type ScenarioSimulationResponse } from '@/services/ScenarioService'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const COMPARISON_STORAGE_KEY = 'planning-scenarios-compare'
const DECISIONS_STORAGE_KEY = 'decisions-scenarios'

const scenarioName = ref('')
const currentScenarioId = ref<string | null>(null)
const months = ref(6)
const isLoading = ref(false)
const isSaving = ref(false)
const isComparing = ref(false)
const error = ref('')
const successMessage = ref('')
const result = ref<ScenarioSimulationResponse | null>(null)
const savedScenarios = ref<SavedScenario[]>([])
const savedComparisons = ref<SavedScenarioComparison[]>([])
const selectedScenarioIds = ref<string[]>([])
const comparisonEntries = ref<Array<{ saved: SavedScenario; result: ScenarioSimulationResponse }>>([])
const deltas = ref<ScenarioDeltaInput[]>([
  { label: '', type: 'MONTHLY_EXPENSE', amount: 0, startMonthOffset: 0 },
])

type ScenarioTemplateKey = 'marketing' | 'hiring' | 'cost_cut' | 'one_time_investment'

const deltaTypeOptions = computed(() => [
  { title: t('planning.scenarios.delta_type_monthly_income'), value: 'MONTHLY_INCOME' },
  { title: t('planning.scenarios.delta_type_monthly_expense'), value: 'MONTHLY_EXPENSE' },
  { title: t('planning.scenarios.delta_type_one_time_income'), value: 'ONE_TIME_INCOME' },
  { title: t('planning.scenarios.delta_type_one_time_expense'), value: 'ONE_TIME_EXPENSE' },
])

const scenarioTemplates = computed(() => [
  {
    key: 'marketing' as const,
    icon: 'mdi-bullhorn-outline',
    title: t('planning.scenarios.template_marketing_title'),
    description: t('planning.scenarios.template_marketing_desc'),
  },
  {
    key: 'hiring' as const,
    icon: 'mdi-account-plus-outline',
    title: t('planning.scenarios.template_hiring_title'),
    description: t('planning.scenarios.template_hiring_desc'),
  },
  {
    key: 'cost_cut' as const,
    icon: 'mdi-scissors-cutting',
    title: t('planning.scenarios.template_cost_cut_title'),
    description: t('planning.scenarios.template_cost_cut_desc'),
  },
  {
    key: 'one_time_investment' as const,
    icon: 'mdi-rocket-launch-outline',
    title: t('planning.scenarios.template_investment_title'),
    description: t('planning.scenarios.template_investment_desc'),
  },
])

const canSimulate = computed(() =>
  deltas.value.some((delta) => Number(delta.amount || 0) > 0)
)

const decisionTone = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED') return 'decision-pill--danger'
  if (result.value?.decisionStatus === 'WATCH') return 'decision-pill--warning'
  return 'decision-pill--success'
})

const decisionLabel = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (result.value?.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (result.value?.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
})

const predictionSubtitle = computed(() =>
  result.value
    ? t('planning.scenarios.results_with_name', { name: result.value.scenarioName })
    : t('planning.scenarios.results_subtitle')
)

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const addDelta = () => {
  deltas.value.push({ label: '', type: 'MONTHLY_EXPENSE', amount: 0, startMonthOffset: 0 })
}

const applyTemplate = (templateKey: ScenarioTemplateKey) => {
  currentScenarioId.value = null
  result.value = null
  error.value = ''
  successMessage.value = t('planning.scenarios.template_applied')

  if (templateKey === 'marketing') {
    scenarioName.value = t('planning.scenarios.template_marketing_name')
    months.value = 6
    deltas.value = [
      { label: t('planning.scenarios.template_marketing_delta_media'), type: 'MONTHLY_EXPENSE', amount: 1500, startMonthOffset: 0 },
      { label: t('planning.scenarios.template_marketing_delta_tool'), type: 'MONTHLY_EXPENSE', amount: 350, startMonthOffset: 0 },
    ]
    return
  }

  if (templateKey === 'hiring') {
    scenarioName.value = t('planning.scenarios.template_hiring_name')
    months.value = 12
    deltas.value = [
      { label: t('planning.scenarios.template_hiring_delta_salary'), type: 'MONTHLY_EXPENSE', amount: 6000, startMonthOffset: 1 },
      { label: t('planning.scenarios.template_hiring_delta_setup'), type: 'ONE_TIME_EXPENSE', amount: 2500, startMonthOffset: 1 },
    ]
    return
  }

  if (templateKey === 'cost_cut') {
    scenarioName.value = t('planning.scenarios.template_cost_cut_name')
    months.value = 6
    deltas.value = [
      { label: t('planning.scenarios.template_cost_cut_delta_subscription'), type: 'MONTHLY_INCOME', amount: 400, startMonthOffset: 0 },
      { label: t('planning.scenarios.template_cost_cut_delta_contract'), type: 'MONTHLY_INCOME', amount: 900, startMonthOffset: 0 },
    ]
    return
  }

  scenarioName.value = t('planning.scenarios.template_investment_name')
  months.value = 9
  deltas.value = [
    { label: t('planning.scenarios.template_investment_delta_setup'), type: 'ONE_TIME_EXPENSE', amount: 8000, startMonthOffset: 0 },
    { label: t('planning.scenarios.template_investment_delta_return'), type: 'MONTHLY_INCOME', amount: 1800, startMonthOffset: 2 },
  ]
}

const resetScenarioBuilder = () => {
  currentScenarioId.value = null
  scenarioName.value = ''
  months.value = 6
  deltas.value = [{ label: '', type: 'MONTHLY_EXPENSE', amount: 0, startMonthOffset: 0 }]
  result.value = null
  error.value = ''
  successMessage.value = ''
}

const removeDelta = (index: number) => {
  deltas.value.splice(index, 1)
}

const deltaTypeDescription = (type: ScenarioDeltaType) => {
  if (type === 'MONTHLY_INCOME') return t('planning.scenarios.delta_type_monthly_income_desc')
  if (type === 'MONTHLY_EXPENSE') return t('planning.scenarios.delta_type_monthly_expense_desc')
  if (type === 'ONE_TIME_INCOME') return t('planning.scenarios.delta_type_one_time_income_desc')
  return t('planning.scenarios.delta_type_one_time_expense_desc')
}

const simulateScenario = async () => {
  error.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const { data } = await ScenarioService.simulate({
      name: scenarioName.value || t('planning.scenarios.default_name'),
      months: months.value,
      deltas: deltas.value
        .filter((delta) => Number(delta.amount || 0) > 0)
        .map((delta) => ({
          label: delta.label,
          type: delta.type,
          amount: Number(delta.amount),
          startMonthOffset: Number(delta.startMonthOffset || 0),
        })),
    })
    result.value = data
  } catch (simulationError) {
    console.error(simulationError)
    error.value = t('planning.scenarios.error')
  } finally {
    isLoading.value = false
  }
}

const buildPayload = () => ({
  id: currentScenarioId.value || undefined,
  name: scenarioName.value || t('planning.scenarios.default_name'),
  months: months.value,
  deltas: deltas.value
    .filter((delta) => Number(delta.amount || 0) > 0)
    .map((delta) => ({
      label: delta.label,
      type: delta.type,
      amount: Number(delta.amount),
      startMonthOffset: Number(delta.startMonthOffset || 0),
    })),
})

const refreshSavedScenarios = async () => {
  try {
    const [{ data }, { data: comparisonData }] = await Promise.all([
      ScenarioService.list(),
      ScenarioService.listComparisons(),
    ])
    savedScenarios.value = Array.isArray(data) ? data : []
    savedComparisons.value = Array.isArray(comparisonData) ? comparisonData : []
  } catch (listError) {
    console.error(listError)
    savedScenarios.value = []
    savedComparisons.value = []
  }
}

const selectedComparisonQuery = computed(() =>
  selectedScenarioIds.value.length ? selectedScenarioIds.value.join(',') : undefined
)

const persistComparisonSelection = async () => {
  const compare = selectedComparisonQuery.value
  if (compare) {
    window.localStorage.setItem(COMPARISON_STORAGE_KEY, compare)
  } else {
    window.localStorage.removeItem(COMPARISON_STORAGE_KEY)
  }

  const nextQuery = { ...route.query }
  if (compare) {
    nextQuery.compare = compare
  } else {
    delete nextQuery.compare
  }

  await router.replace({ query: nextQuery })
}

const getSavedScenarioPayload = (scenario: SavedScenario) => ({
  name: scenario.name,
  months: scenario.months || 6,
  deltas: (scenario.deltas || []).map((delta) => ({
    label: delta.label,
    type: delta.type,
    amount: Number(delta.amount || 0),
    startMonthOffset: Number(delta.startMonthOffset || 0),
  })),
})

const saveScenario = async (saveAsNew = false) => {
  error.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    const payload = {
      ...buildPayload(),
      id: saveAsNew ? undefined : currentScenarioId.value || undefined,
    }
    const [{ data: simulationData }, { data: savedData }] = await Promise.all([
      ScenarioService.simulate(payload),
      ScenarioService.save(payload),
    ])
    currentScenarioId.value = savedData.id
    result.value = simulationData
    successMessage.value = t('planning.scenarios.save_success', { name: savedData.name })
    await refreshSavedScenarios()
  } catch (saveError) {
    console.error(saveError)
    error.value = t('planning.scenarios.save_error')
  } finally {
    isSaving.value = false
  }
}

const loadSavedScenario = async (scenario: SavedScenario) => {
  currentScenarioId.value = scenario.id
  scenarioName.value = scenario.name || ''
  months.value = scenario.months || 6
  deltas.value = scenario.deltas?.length
    ? scenario.deltas.map((delta) => ({
        label: delta.label || '',
        type: delta.type,
        amount: Number(delta.amount || 0),
        startMonthOffset: Number(delta.startMonthOffset || 0),
      }))
    : [{ label: '', type: 'MONTHLY_EXPENSE', amount: 0, startMonthOffset: 0 }]
  await simulateScenario()
}

const deleteScenario = async (scenario: SavedScenario) => {
  const confirmed = window.confirm(t('planning.scenarios.delete_confirm', { name: scenario.name }))
  if (!confirmed) {
    return
  }

  error.value = ''
  successMessage.value = ''

  try {
    await ScenarioService.remove(scenario.id)
    savedScenarios.value = savedScenarios.value.filter((entry) => entry.id !== scenario.id)
    selectedScenarioIds.value = selectedScenarioIds.value.filter((id) => id !== scenario.id)
    comparisonEntries.value = comparisonEntries.value.filter((entry) => entry.saved.id !== scenario.id)
    await persistComparisonSelection()

    if (currentScenarioId.value === scenario.id) {
      resetScenarioBuilder()
    }

    successMessage.value = t('planning.scenarios.delete_success', { name: scenario.name })
  } catch (deleteError) {
    console.error(deleteError)
    error.value = t('planning.scenarios.delete_error')
  }
}

const toggleScenarioSelection = (scenarioId: string, selected: boolean | null) => {
  if (selected) {
    if (selectedScenarioIds.value.includes(scenarioId) || selectedScenarioIds.value.length >= 2) {
      return
    }
    selectedScenarioIds.value = [...selectedScenarioIds.value, scenarioId]
    return
  }
  selectedScenarioIds.value = selectedScenarioIds.value.filter((id) => id !== scenarioId)
  if (selectedScenarioIds.value.length < 2) {
    comparisonEntries.value = []
  }
}

const compareSelectedScenarios = async () => {
  if (selectedScenarioIds.value.length !== 2) {
    return
  }

  error.value = ''
  successMessage.value = ''
  isComparing.value = true

  try {
    const selectedScenarios = selectedScenarioIds.value
      .map((id) => savedScenarios.value.find((scenario) => scenario.id === id))
      .filter((scenario): scenario is SavedScenario => Boolean(scenario))

    const responses = await Promise.all(
      selectedScenarios.map(async (scenario) => {
        const { data } = await ScenarioService.simulate(getSavedScenarioPayload(scenario))
        return { saved: scenario, result: data }
      })
    )
    comparisonEntries.value = responses
  } catch (comparisonError) {
    console.error(comparisonError)
    error.value = t('planning.scenarios.compare_error')
    comparisonEntries.value = []
  } finally {
    isComparing.value = false
  }
}

const copyComparisonLink = async () => {
  if (selectedScenarioIds.value.length !== 2) {
    return
  }

  try {
    const compare = selectedScenarioIds.value.join(',')
    const shareUrl = `${window.location.origin}${route.path}?compare=${encodeURIComponent(compare)}`
    await navigator.clipboard.writeText(shareUrl)
    successMessage.value = t('planning.scenarios.copy_compare_link_success')
    error.value = ''
  } catch (copyError) {
    console.error(copyError)
    error.value = t('planning.scenarios.copy_compare_link_error')
  }
}

const saveCurrentComparison = async () => {
  if (selectedScenarioIds.value.length !== 2) {
    return
  }

  try {
    const selectedNames = selectedScenarioIds.value
      .map((id) => savedScenarios.value.find((scenario) => scenario.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    const defaultName = selectedNames.length === 2
      ? `${selectedNames[0]} vs ${selectedNames[1]}`
      : t('planning.scenarios.compare_default_name')
    const requestedName = window.prompt(t('planning.scenarios.compare_name_prompt'), defaultName)?.trim()
    if (requestedName === '') {
      return
    }
    const { data } = await ScenarioService.saveComparison({
      name: requestedName || defaultName,
      scenarioIds: selectedScenarioIds.value,
    })
    savedComparisons.value = [data, ...savedComparisons.value.filter((entry) => entry.id !== data.id)]
    successMessage.value = t('planning.scenarios.compare_save_success', { name: data.name })
    error.value = ''
  } catch (saveError) {
    console.error(saveError)
    error.value = t('planning.scenarios.compare_save_error')
  }
}

const loadSavedComparison = async (comparison: SavedScenarioComparison) => {
  selectedScenarioIds.value = [comparison.leftScenarioId, comparison.rightScenarioId]
  await compareSelectedScenarios()
}

const deleteSavedComparison = async (comparison: SavedScenarioComparison) => {
  const confirmed = window.confirm(t('planning.scenarios.compare_delete_confirm', { name: comparison.name }))
  if (!confirmed) {
    return
  }

  try {
    await ScenarioService.removeComparison(comparison.id)
    savedComparisons.value = savedComparisons.value.filter((entry) => entry.id !== comparison.id)
    successMessage.value = t('planning.scenarios.compare_delete_success', { name: comparison.name })
    error.value = ''
  } catch (deleteError) {
    console.error(deleteError)
    error.value = t('planning.scenarios.compare_delete_error')
  }
}

const openInDecisions = async (scenarioIds: string[]) => {
  const validIds = scenarioIds
    .filter((id, index, array) => Boolean(id) && array.indexOf(id) === index)
    .slice(0, 2)

  if (!validIds.length) {
    return
  }

  window.localStorage.setItem(DECISIONS_STORAGE_KEY, validIds.join(','))
  await router.push({
    path: '/decisions',
    query: {
      scenarios: validIds.join(','),
    },
  })
}

const winnerFor = (metric: 'finalBalance' | 'availableForGoals' | 'impactedGoals' | 'riskMonth') => {
  if (comparisonEntries.value.length !== 2) {
    return null
  }

  const [left, right] = comparisonEntries.value
  const leftValue = left.result
  const rightValue = right.result

  if (metric === 'finalBalance') {
    if (leftValue.projectedFinalBalance === rightValue.projectedFinalBalance) return null
    return leftValue.projectedFinalBalance > rightValue.projectedFinalBalance ? left.saved.id : right.saved.id
  }

  if (metric === 'availableForGoals') {
    if (leftValue.availableForGoals === rightValue.availableForGoals) return null
    return leftValue.availableForGoals > rightValue.availableForGoals ? left.saved.id : right.saved.id
  }

  if (metric === 'impactedGoals') {
    if (leftValue.impactedGoalsCount === rightValue.impactedGoalsCount) return null
    return leftValue.impactedGoalsCount < rightValue.impactedGoalsCount ? left.saved.id : right.saved.id
  }

  const monthWeight = (value?: string | null) => {
    if (!value) return Number.MAX_SAFE_INTEGER
    const [year, month] = value.split('-').map(Number)
    if (!year || !month) return Number.MAX_SAFE_INTEGER
    return year * 100 + month
  }

  const leftMonth = monthWeight(leftValue.firstRiskMonth)
  const rightMonth = monthWeight(rightValue.firstRiskMonth)
  if (leftMonth === rightMonth) return null
  return leftMonth > rightMonth ? left.saved.id : right.saved.id
}

const comparisonHighlights = computed(() => {
  if (comparisonEntries.value.length !== 2) {
    return {
      overall: '',
      finalBalance: '',
      goals: '',
      risk: '',
    }
  }

  const [left, right] = comparisonEntries.value
  const finalBalanceWinner = winnerFor('finalBalance')
  const goalsWinner = winnerFor('impactedGoals')
  const riskWinner = winnerFor('riskMonth')
  const overallWinner = overallComparisonWinner.value

  const finalBalanceName = finalBalanceWinner === left.saved.id ? left.saved.name : finalBalanceWinner === right.saved.id ? right.saved.name : t('planning.scenarios.compare_draw')
  const goalsName = goalsWinner === left.saved.id ? left.saved.name : goalsWinner === right.saved.id ? right.saved.name : t('planning.scenarios.compare_draw')
  const riskName = riskWinner === left.saved.id ? left.saved.name : riskWinner === right.saved.id ? right.saved.name : t('planning.scenarios.compare_draw')
  const overallName = overallWinner === left.saved.id ? left.saved.name : overallWinner === right.saved.id ? right.saved.name : t('planning.scenarios.compare_draw')

  return {
    overall: t('planning.scenarios.compare_highlight_overall', { name: overallName }),
    finalBalance: t('planning.scenarios.compare_highlight_balance', { name: finalBalanceName }),
    goals: t('planning.scenarios.compare_highlight_goals', { name: goalsName }),
    risk: t('planning.scenarios.compare_highlight_risk', { name: riskName }),
  }
})

const overallComparisonWinner = computed(() => {
  if (comparisonEntries.value.length !== 2) {
    return null
  }

  const scoreEntry = (entry: { saved: SavedScenario; result: ScenarioSimulationResponse }) => {
    const riskBonus = entry.result.firstRiskMonth ? 0 : 1
    return (
      entry.result.projectedFinalBalance * 0.4 +
      entry.result.availableForGoals * 0.3 -
      entry.result.impactedGoalsCount * 1000 +
      riskBonus * 500 +
      (entry.result.firstRiskMonth ? monthScore(entry.result.firstRiskMonth) : 500)
    )
  }

  const [left, right] = comparisonEntries.value
  const leftScore = scoreEntry(left)
  const rightScore = scoreEntry(right)
  if (leftScore === rightScore) {
    return null
  }
  return leftScore > rightScore ? left.saved.id : right.saved.id
})

const monthScore = (value?: string | null) => {
  if (!value) return 0
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return 0
  return year * 12 + month
}

const savedScenarioTone = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return 'status-chip--danger'
  if (scenario.decisionStatus === 'WATCH') return 'status-chip--warning'
  return 'status-chip--success'
}

const savedScenarioLabel = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (scenario.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (scenario.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
}

watch(selectedScenarioIds, () => {
  void persistComparisonSelection()
}, { deep: true })

onMounted(async () => {
  await refreshSavedScenarios()

  const scenarioQuery = typeof route.query.scenarios === 'string' ? route.query.scenarios : ''
  if (scenarioQuery) {
    const scenarioIds = scenarioQuery
      .split(',')
      .map((id) => id.trim())
      .filter((id) => savedScenarios.value.some((scenario) => scenario.id === id))
      .slice(0, 2)

    if (scenarioIds.length) {
      selectedScenarioIds.value = scenarioIds
      const firstScenario = savedScenarios.value.find((scenario) => scenario.id === scenarioIds[0])
      if (firstScenario) {
        await loadSavedScenario(firstScenario)
      }
      if (scenarioIds.length === 2) {
        await compareSelectedScenarios()
      }
      return
    }
  }

  const fromQuery = typeof route.query.compare === 'string' ? route.query.compare : ''
  const fromStorage = window.localStorage.getItem(COMPARISON_STORAGE_KEY) || ''
  const rawSelection = fromQuery || fromStorage
  if (!rawSelection) {
    return
  }

  const validIds = rawSelection
    .split(',')
    .map((id) => id.trim())
    .filter((id) => savedScenarios.value.some((scenario) => scenario.id === id))
    .slice(0, 2)

  if (validIds.length === 2) {
    selectedScenarioIds.value = validIds
    await compareSelectedScenarios()
  }
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
  max-width: 1320px;
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
}

.scenario-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
}

.scenario-builder,
.scenario-results {
  display: grid;
  gap: 18px;
}

.scenario-intro {
  display: grid;
  gap: 6px;
}

.scenario-intro h3,
.scenario-intro p {
  margin: 0;
}

.scenario-intro h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.scenario-intro p {
  color: #64748b;
  line-height: 1.5;
}

.delta-section {
  display: grid;
  gap: 14px;
}

.scenario-templates {
  display: grid;
  gap: 12px;
}

.scenario-templates__header h4,
.scenario-templates__header p {
  margin: 0;
}

.scenario-templates__header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.scenario-templates__header p {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.92rem;
}

.scenario-templates__grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.scenario-template-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  text-align: left;
  border-radius: 14px;
  border: 1px solid rgba(102, 126, 234, 0.16);
  background: rgba(102, 126, 234, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.scenario-template-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.12);
}

.scenario-template-card strong {
  color: #1e293b;
  font-size: 0.96rem;
}

.scenario-template-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.45;
}

.scenario-template-card__header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.scenario-template-card__badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 4px 8px;
}

.delta-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.delta-section__header h4,
.delta-section__header p {
  margin: 0;
}

.delta-section__header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.delta-section__header p {
  color: #64748b;
  font-size: 0.92rem;
}

.delta-list {
  display: grid;
  gap: 12px;
}

.scenario-tip {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.12);
}

.scenario-tip__header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
}

.scenario-tip p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.scenario-tip__examples {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}

.delta-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.delta-card__fields {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.delta-card__actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.delta-card__hint {
  color: #64748b;
  font-size: 0.86rem;
}

.empty-deltas,
.empty-results {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
  padding: 28px 18px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.35);
  color: #64748b;
}

.builder-actions {
  display: grid;
  gap: 10px;
}

.builder-actions__context {
  color: #64748b;
  font-size: 0.9rem;
}

.builder-actions__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.error-message {
  color: #b91c1c;
  font-size: 0.92rem;
}

.success-message {
  color: #15803d;
  font-size: 0.92rem;
}

.results-content {
  display: grid;
  gap: 16px;
}

.results-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.result-card {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.result-card span {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #64748b;
  font-weight: 700;
}

.result-card strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.summary-callout {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.08);
  color: #334155;
  line-height: 1.5;
}

.goal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.goal-tags__label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

.saved-scenarios {
  display: grid;
  gap: 12px;
}

.saved-comparisons {
  display: grid;
  gap: 12px;
}

.saved-comparisons__header h3,
.saved-comparisons__header p {
  margin: 0;
}

.saved-comparisons__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.saved-comparisons__header p {
  color: #64748b;
  font-size: 0.92rem;
}

.saved-scenarios__header {
  display: grid;
  gap: 4px;
}

.saved-scenarios__header {
  grid-template-columns: 1fr auto;
  align-items: center;
}

.saved-scenarios__header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.saved-scenarios__selection-note {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.saved-scenarios__header h3,
.saved-scenarios__header p {
  margin: 0;
}

.saved-scenarios__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.saved-scenarios__header p {
  color: #64748b;
  font-size: 0.92rem;
}

.saved-scenarios__list {
  display: grid;
  gap: 10px;
}

.saved-comparisons__list {
  display: grid;
  gap: 10px;
}

.comparison-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(102, 126, 234, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.12);
}

.comparison-panel__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.comparison-panel__header h3,
.comparison-panel__header p {
  margin: 0;
}

.comparison-panel__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.comparison-panel__header p {
  color: #64748b;
  font-size: 0.92rem;
}

.comparison-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.comparison-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.comparison-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.comparison-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.comparison-card__header strong {
  color: #0f172a;
}

.comparison-card__metrics {
  display: grid;
  gap: 8px;
}

.comparison-metric {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.85);
}

.comparison-metric span {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 700;
}

.comparison-metric strong {
  color: #0f172a;
}

.comparison-metric--winner {
  border: 1px solid rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.09);
}

.comparison-card__summary {
  margin: 0;
  color: #475569;
  line-height: 1.45;
}

.comparison-highlights {
  display: grid;
  gap: 10px;
}

.summary-callout--comparison {
  border-radius: 14px;
}

.saved-scenario-card {
  display: grid;
  gap: 8px;
  text-align: left;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.8);
}

.saved-scenario-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.saved-scenario-card__header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.saved-scenario-card__quick-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.saved-scenario-card__compare {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 0.88rem;
}

.saved-scenario-card__header strong {
  color: #0f172a;
}

.saved-scenario-card p {
  margin: 0;
  color: #475569;
  line-height: 1.45;
}

.saved-scenario-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #64748b;
  font-size: 0.88rem;
}

.saved-comparison-card {
  display: grid;
  gap: 8px;
  text-align: left;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.8);
}

.saved-comparison-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.saved-comparison-card__header strong {
  color: #0f172a;
}

.saved-comparison-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.saved-comparison-card p {
  margin: 0;
  color: #475569;
  line-height: 1.45;
}

.saved-comparison-card__vs {
  color: #667eea;
  font-weight: 700;
  margin: 0 6px;
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
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.forecast-table th {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #64748b;
}

.negative-value {
  color: #b91c1c !important;
}

.decision-pill,
.status-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
}

.decision-pill--success,
.status-chip--success {
  background: #dcfce7;
  color: #15803d;
}

.decision-pill--warning {
  background: #fef3c7;
  color: #b45309;
}

.decision-pill--danger,
.status-chip--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.v-theme--dark .scenario-intro h3,
.v-theme--dark .scenario-templates__header h4,
.v-theme--dark .delta-section__header h4,
.v-theme--dark .result-card strong,
.v-theme--dark .saved-scenarios__header h3,
.v-theme--dark .saved-comparisons__header h3,
.v-theme--dark .saved-scenario-card__header strong,
.v-theme--dark .saved-comparison-card__header strong,
.v-theme--dark .comparison-panel__header h3,
.v-theme--dark .comparison-card__header strong,
.v-theme--dark .comparison-metric strong,
.v-theme--dark .scenario-template-card strong {
  color: #f8fafc;
}

.v-theme--dark .scenario-intro p,
.v-theme--dark .scenario-templates__header p,
.v-theme--dark .delta-section__header p,
.v-theme--dark .delta-card__hint,
.v-theme--dark .goal-tags__label,
.v-theme--dark .result-card span,
.v-theme--dark .forecast-table th,
.v-theme--dark .saved-scenarios__header p,
.v-theme--dark .saved-comparisons__header p,
.v-theme--dark .saved-scenario-card__meta,
.v-theme--dark .saved-scenarios__selection-note,
.v-theme--dark .comparison-panel__header p,
.v-theme--dark .comparison-metric span,
.v-theme--dark .saved-scenario-card__compare {
  color: #cbd5e1;
}

.v-theme--dark .delta-card,
.v-theme--dark .result-card,
.v-theme--dark .empty-deltas,
.v-theme--dark .empty-results,
.v-theme--dark .scenario-template-card,
.v-theme--dark .saved-scenario-card,
.v-theme--dark .saved-comparison-card,
.v-theme--dark .comparison-panel,
.v-theme--dark .comparison-card,
.v-theme--dark .comparison-metric {
  background: rgba(51, 65, 85, 0.45);
  border-color: rgba(148, 163, 184, 0.22);
}

.v-theme--dark .summary-callout {
  background: rgba(102, 126, 234, 0.18);
  color: #e2e8f0;
}

.v-theme--dark .forecast-table td {
  color: #e2e8f0;
  border-bottom-color: rgba(148, 163, 184, 0.16);
}

.v-theme--dark .saved-scenario-card p {
  color: #e2e8f0;
}

.v-theme--dark .saved-comparison-card p {
  color: #e2e8f0;
}

.v-theme--dark .scenario-template-card p {
  color: #cbd5e1;
}

.v-theme--dark .comparison-card__summary {
  color: #e2e8f0;
}

@media (max-width: 1100px) {
  .scenario-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .scenario-templates__grid,
  .delta-card__fields {
    grid-template-columns: 1fr;
  }
}
</style>
