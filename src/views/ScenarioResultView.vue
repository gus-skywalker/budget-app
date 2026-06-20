<template>
  <div class="cb-page">
    <div class="cb-container scenario-result">
      <page-header :title="t('contentExperience.planning.scenarioResult.title')" :meta="t('contentExperience.planning.scenarioResult.subtitle')">
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" style="min-width:0;padding:0 4px 0 0" @click="router.back()">
            <v-icon start size="20">mdi-arrow-left</v-icon>
            {{ t('common.back', 'Voltar') }}
          </v-btn>
        </template>
      </page-header>

      <div class="result-shell" v-if="result">
        <alert-strip v-if="isScenarioLockedForEdit" variant="warning" :description="t('contentExperience.planning.scenarioResult.lockedNotice')" />
        <alert-strip v-if="isShowingSavedSnapshot" variant="info" :description="t('contentExperience.planning.scenarioResult.savedSnapshotNotice')" />
        <div class="hero-card">
          <span class="hero-card__label">{{
            tVoice(
              'scenarioResult.monthlyImpact',
              'contentExperience.planning.scenarioResult.monthlyImpact'
            )
          }}</span>
          <strong
            :class="{
              'positive-value': result.scenarioMonthlyImpact > 0,
              'negative-value': result.scenarioMonthlyImpact < 0
            }"
          >
            {{ formatSignedCurrency(result.scenarioMonthlyImpact) }}
          </strong>
          <p>{{ scenarioSummary }}</p>
          <div v-if="isSpeechSupported" class="hero-card__voice-actions">
            <v-btn
              size="small"
              variant="tonal"
              color="var(--cb-primary)"
              :aria-label="isSpeaking ? t('contentExperience.planning.scenarioResult.stopAdvisor') : t('contentExperience.planning.scenarioResult.listenAdvisor')"
              @click="toggleAdvisorSpeech"
            >
              <v-icon start>{{ isSpeaking ? 'mdi-stop-circle-outline' : 'mdi-volume-high' }}</v-icon>
              {{
                isSpeaking
                  ? t('contentExperience.planning.scenarioResult.stopAdvisor')
                  : t('contentExperience.planning.scenarioResult.listenAdvisor')
              }}
            </v-btn>
          </div>
        </div>

        <div v-if="isManualTypedScenario && result.debtComparison" class="debt-comparison">
          <div class="metrics-grid">
            <div class="metric-card">
              <span>{{ t('contentExperience.planning.scenarioResult.cheapestOption') }}</span>
              <strong>{{ result.debtComparison.cheapestOption || '—' }}</strong>
            </div>
            <div class="metric-card">
              <span>{{ t('contentExperience.planning.scenarioResult.safestOption') }}</span>
              <strong>{{ result.debtComparison.safestOption || '—' }}</strong>
            </div>
            <div class="metric-card">
              <span>{{ t('contentExperience.planning.scenarioResult.recommendedOption') }}</span>
              <strong>{{ result.debtComparison.recommendedOption || '—' }}</strong>
            </div>
          </div>

          <v-alert type="info" variant="tonal" density="comfortable">
            {{
              result.debtComparison.recommendationReason || result.debtComparison.tradeOffSummary
            }}
          </v-alert>

          <div class="debt-options-grid">
            <div
              v-for="option in result.debtComparison.options"
              :key="option.name"
              class="debt-option-card"
            >
              <div class="debt-option-card__header">
                <strong>{{ option.name }}</strong>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="
                    option.name === result.debtComparison.recommendedOption
                      ? 'success'
                      : option.name === result.debtComparison.cheapestOption
                        ? 'primary'
                        : 'warning'
                  "
                >
                  {{
                    option.name === result.debtComparison.recommendedOption
                      ? t('contentExperience.planning.scenarioResult.recommendedBadge')
                      : option.name === result.debtComparison.cheapestOption
                        ? t('contentExperience.planning.scenarioResult.cheapestBadge')
                        : option.name === result.debtComparison.safestOption
                          ? t('contentExperience.planning.scenarioResult.safestBadge')
                          : option.predictabilityLevel
                  }}
                </v-chip>
              </div>
              <p>{{ option.explanation }}</p>
              <div class="debt-option-card__metrics">
                <span
                  >{{ t('contentExperience.planning.scenarioResult.totalPaid') }}:
                  <strong>{{ formatCurrency(option.totalPaid) }}</strong></span
                >
                <span
                  >{{ t('contentExperience.planning.scenarioResult.extraCost') }}:
                  <strong>{{ formatCurrency(option.totalExtraCost) }}</strong></span
                >
                <span
                  >{{ t('contentExperience.planning.scenarioResult.monthlyImpactMetric') }}:
                  <strong>{{ formatCurrency(option.monthlyImpact) }}</strong></span
                >
                <span
                  >{{ t('contentExperience.planning.scenarioResult.risk') }}:
                  <strong>{{ option.riskLevel }}</strong></span
                >
                <span
                  >{{ t('contentExperience.planning.scenarioResult.predictability') }}:
                  <strong>{{ option.predictabilityLevel }}</strong></span
                >
              </div>
              <v-alert v-if="option.warning" type="warning" variant="tonal" density="comfortable">
                {{ option.warning }}
              </v-alert>
            </div>
          </div>

          <v-alert
            v-if="result.debtComparison.warnings?.length"
            type="warning"
            variant="tonal"
            density="comfortable"
          >
            {{ result.debtComparison.warnings[0] }}
          </v-alert>
        </div>

        <div v-else class="metrics-grid">
          <div class="metric-card">
            <span>{{ t('planning.scenarios.final_balance') }}</span>
            <strong :class="{ 'negative-value': result.projectedFinalBalance < 0 }">{{
              formatCurrency(result.projectedFinalBalance)
            }}</strong>
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

        <div v-if="!isManualTypedScenario" class="projection-basis">
          <div class="projection-basis__copy">
            <span>{{
              tVoice(
                'scenarioResult.projectionBasisLabel',
                'contentExperience.planning.scenarioResult.projectionBasisLabel'
              )
            }}</span>
            <p>{{ projectionBasisText }}</p>
          </div>
          <div class="projection-basis__formula">
            <div>
              <span>{{ t('contentExperience.planning.scenarioResult.initialBalance') }}</span>
              <strong>{{ formatCurrency(result.currentBalance) }}</strong>
            </div>
            <div>
              <span>{{ t('contentExperience.planning.scenarioResult.monthlyBaseline') }}</span>
              <strong>{{ formatSignedCurrency(result.baselineMonthlyNet) }}</strong>
            </div>
            <div>
              <span>{{ t('contentExperience.planning.scenarioResult.monthlyScenarioNet') }}</span>
              <strong :class="{ 'negative-value': scenarioMonthlyNet < 0 }">{{ formatSignedCurrency(scenarioMonthlyNet) }}</strong>
            </div>
            <div>
              <span>{{ t('contentExperience.planning.scenarioResult.baselineFinalBalance') }}</span>
              <strong>{{ formatCurrency(baselineFinalBalance) }}</strong>
            </div>
          </div>
        </div>

        <v-expansion-panels v-if="!isManualTypedScenario" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>{{
              t('contentExperience.planning.scenarioResult.forecastDetails')
            }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="forecast-explainer">
                {{
                  tVoice(
                    'scenarioResult.forecastExplainer',
                    'contentExperience.planning.scenarioResult.forecastExplainer'
                  )
                }}
              </p>
              <div class="forecast-table">
                <table>
                  <thead>
                    <tr>
                      <th>{{ t('planning.scenarios.table_month') }}</th>
                      <th>{{ t('planning.scenarios.table_baseline') }}</th>
                      <th>{{ t('planning.scenarios.table_scenario') }}</th>
                      <th>{{ t('planning.scenarios.table_delta') }}</th>
                      <th>{{ t('planning.scenarios.table_sources') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in projectionRows" :key="item.period">
                      <td :data-label="t('planning.scenarios.table_month')">{{ item.period }}</td>
                      <td :data-label="t('planning.scenarios.table_baseline')">
                        <div class="projection-cell">
                          <strong>{{ formatCurrency(item.baselineBalance) }}</strong>
                          <span v-if="!item.isLegacyForecast">{{ formatFlow(item.baselineIncome, item.baselineExpense) }}</span>
                        </div>
                      </td>
                      <td :data-label="t('planning.scenarios.table_scenario')">
                        <div class="projection-cell">
                          <strong>{{ formatCurrency(item.scenarioBalance) }}</strong>
                          <span v-if="!item.isLegacyForecast">{{ formatFlow(item.scenarioIncome, item.scenarioExpense) }}</span>
                        </div>
                      </td>
                      <td
                        :data-label="t('planning.scenarios.table_delta')"
                        :class="{ 'negative-value': item.changeImpact < 0, 'positive-value': item.changeImpact > 0 }"
                      >
                        {{ formatSignedCurrency(item.changeImpact) }}
                      </td>
                      <td :data-label="t('planning.scenarios.table_sources')">
                        <div class="source-chips">
                          <span v-for="source in sourceLabels(item.sources)" :key="source">{{ source }}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title>{{
              t('contentExperience.planning.scenarioResult.impactedGoals')
            }}</v-expansion-panel-title>
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
              <p v-else>{{ t('contentExperience.planning.scenarioResult.noImpactedGoals') }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div class="result-actions">
          <v-btn
            class="result-action result-action--primary"
            color="var(--cb-primary)"
            :loading="isCreatingDecision"
            :disabled="
              isCreatingDecision || isSaving || (isScenarioLockedForEdit && Boolean(scenarioId))
            "
            @click="createDecisionFromScenario"
          >
            <v-icon start>mdi-lightbulb-outline</v-icon>
            {{ createDecisionLabel }}
          </v-btn>
          <v-btn
            v-if="canWriteScenarios"
            class="result-action"
            variant="tonal"
            color="var(--cb-primary)"
            :loading="isSaving"
            :disabled="isSaving || isScenarioLockedForEdit"
            @click="saveScenario"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            {{ t('planning.scenarios.save') }}
          </v-btn>
          <v-btn
            class="result-action"
            variant="text"
            :loading="isRecalculating"
            :disabled="isRecalculating"
            @click="recalculateResult"
          >
            <v-icon start>mdi-refresh</v-icon>
            {{ t('contentExperience.planning.scenarioResult.recalculate') }}
          </v-btn>
          <v-btn class="result-action" variant="text" @click="editScenario">
            <v-icon start>mdi-pencil-outline</v-icon>
            {{ editActionLabel }}
          </v-btn>
          <v-btn class="result-action" variant="text" @click="newScenario">
            <v-icon start>mdi-file-plus-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <div class="empty-results" v-else>
        <v-icon color="var(--cb-ink-muted)" size="28">mdi-chart-timeline-variant</v-icon>
        <p>{{ t('planning.scenarios.results_placeholder') }}</p>
        <v-btn
          color="var(--cb-primary)"
          variant="tonal"
          @click="router.push({ name: 'planning-scenarios-new' })"
        >
            {{ t('contentExperience.planning.scenarioResult.buildScenario') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'
import DecisionService from '@/services/DecisionService'
import ScenarioService, {
  type SavedScenario,
  type ScenarioProjectionItem,
  type ScenarioSimulationResponse
} from '@/services/ScenarioService'
import BudgetService from '@/services/BudgetService'
import {
  buildScenarioPayload,
  buildScenarioLinesFromBudget,
  buildSimulationPayload,
  clearWizardSnapshot,
  loadWizardSnapshot,
  saveWizardSnapshot,
  snapshotFromSavedScenario,
  type ScenarioWizardSnapshot
} from '@/utils/scenarioWizard'
import {
  buildDebtScenarioPayload,
  clearDebtSnapshot,
  loadDebtSnapshot,
  saveDebtSnapshot,
  snapshotFromSavedDebtScenario,
  type DebtScenarioSnapshot
} from '@/utils/debtScenario'
import { useUserStore } from '@/plugins/userStore'
import { useAppVoice } from '@/utils/appVoice'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { appVoice, tVoice } = useAppVoice()
const userStore = useUserStore()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const result = ref<ScenarioSimulationResponse | null>(null)
const scenarioId = ref<string | null>(null)
const isSaving = ref(false)
const isCreatingDecision = ref(false)
const isRecalculating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isShowingSavedSnapshot = ref(false)
const isScenarioLockedForEdit = ref(false)
const isSpeaking = ref(false)
const debtSnapshot = ref<DebtScenarioSnapshot | null>(null)
const canWriteScenarios = computed(() => userStore.canWrite)
const isSpeechSupported = computed(() =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
)

type ProjectionDisplayRow = ScenarioProjectionItem & {
  isLegacyForecast?: boolean
}

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [],
  scenarioLines: []
})

const decisionTone = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED') return 'negative-value'
  if (result.value?.decisionStatus === 'WATCH') return 'warning-value'
  return 'positive-value'
})

const isManualTypedScenario = computed(
  () =>
    result.value?.sourceType === 'MANUAL_TYPED' || debtSnapshot.value?.sourceType === 'MANUAL_TYPED'
)

const decisionLabel = computed(() => {
  if (result.value?.decisionStatus === 'ACTION_NEEDED')
    return t('planning.scenarios.status_action_needed')
  if (result.value?.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (result.value?.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
})

const scenarioMonthlyNet = computed(() =>
  Number(result.value?.baselineMonthlyNet || 0) + Number(result.value?.scenarioMonthlyImpact || 0)
)

const baselineFinalBalance = computed(() => {
  const last = projectionRows.value[projectionRows.value.length - 1]
  if (last) return Number(last.baselineBalance || 0)
  return (
    Number(result.value?.currentBalance || 0) +
    Number(result.value?.baselineMonthlyNet || 0) * Number(result.value?.months || 0)
  )
})

const projectionRows = computed<ProjectionDisplayRow[]>(() => {
  const projection = result.value?.projection
  if (Array.isArray(projection) && projection.length) {
    return projection.map((item) => ({
      period: item.period,
      baselineIncome: Number(item.baselineIncome || 0),
      baselineExpense: Number(item.baselineExpense || 0),
      baselineBalance: Number(item.baselineBalance || 0),
      scenarioIncome: Number(item.scenarioIncome || 0),
      scenarioExpense: Number(item.scenarioExpense || 0),
      scenarioBalance: Number(item.scenarioBalance || 0),
      changeImpact: Number(item.changeImpact || 0),
      sources: Array.isArray(item.sources) ? item.sources : [],
    }))
  }

  const forecast = result.value?.forecast || []
  return forecast.map((item) => ({
    period: item.month,
    baselineIncome: 0,
    baselineExpense: 0,
    baselineBalance: Number(item.baselineProjectedBalance || 0),
    scenarioIncome: 0,
    scenarioExpense: 0,
    scenarioBalance: Number(item.scenarioProjectedBalance || 0),
    changeImpact: Number(item.deltaImpact || 0),
    sources: ['LEGACY_FORECAST'],
    isLegacyForecast: true,
  }))
})

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

const formatSignedCurrency = (value: number) => {
  const absolute = formatCurrency(Math.abs(value))
  return value > 0 ? `+${absolute}` : value < 0 ? `-${absolute}` : absolute
}

const formatFlow = (income: number, expense: number) => {
  if (!income && !expense) return '—'
  return `${formatCurrency(income)} / ${formatCurrency(expense)}`
}

const sourceLabels = (sources: string[] = []) => {
  if (!sources.length) return ['—']
  const labels: Record<string, string> = {
    CONFIRMED: t('planning.scenarios.source_confirmed', 'Budget'),
    PROJECTED: t('planning.scenarios.source_projected', 'Projected'),
    SCENARIO_CHANGE: t('planning.scenarios.source_scenario_change', 'Scenario change'),
    LEGACY_FORECAST: t('planning.scenarios.source_legacy_forecast', 'Legacy forecast'),
  }
  return sources.map((source) => labels[source] || source)
}

const projectionBasisText = computed(() => {
  if (!result.value) return ''
  return t('contentExperience.planning.scenarioResult.projectionBasisText', {
    initial: formatCurrency(result.value.currentBalance),
    baseline: formatSignedCurrency(result.value.baselineMonthlyNet),
    impact: formatSignedCurrency(result.value.scenarioMonthlyImpact),
    scenarioNet: formatSignedCurrency(scenarioMonthlyNet.value),
    months: result.value.months
  })
})

const firstImpactedGoalName = computed(() =>
  String(result.value?.impactedGoalNames?.[0] || '').trim()
)

const scenarioSummary = computed(() => {
  if (!result.value) return ''
  if (appVoice.value === 'default') {
    return result.value.summary || consequenceMessage.value
  }

  const commonParams = {
    amount: formatCurrency(Math.abs(result.value.scenarioMonthlyImpact)),
    count: result.value.impactedGoalsCount || result.value.impactedGoalNames?.length || 0,
    goal: firstImpactedGoalName.value || t('contentExperience.planning.scenarioResult.goalsFallback'),
    riskMonth: result.value.firstRiskMonth || t('planning.scenarios.no_risk_month'),
    scenarioNet: formatSignedCurrency(scenarioMonthlyNet.value)
  }

  if (result.value.decisionStatus === 'ACTION_NEEDED') {
    return tVoice(
      'scenarioResult.summary.actionNeeded',
      'planning.scenarios.consequence_negative',
      commonParams
    )
  }
  if (result.value.decisionStatus === 'WATCH') {
    return tVoice(
      'scenarioResult.summary.watch',
      'planning.scenarios.consequence_negative',
      commonParams
    )
  }
  if (result.value.decisionStatus === 'STABLE') {
    return tVoice(
      'scenarioResult.summary.stable',
      'planning.scenarios.consequence_positive',
      commonParams
    )
  }
  return result.value.summary || consequenceMessage.value
})

const advisorSpeechText = computed(() => {
  if (!result.value) return ''

  const commonParams = {
    baseline: formatSignedCurrency(result.value.baselineMonthlyNet),
    impact: formatSignedCurrency(result.value.scenarioMonthlyImpact),
    scenarioNet: formatSignedCurrency(scenarioMonthlyNet.value),
    finalBalance: formatCurrency(result.value.projectedFinalBalance),
    months: result.value.months,
    count: result.value.impactedGoalsCount || result.value.impactedGoalNames?.length || 0,
    goal: firstImpactedGoalName.value || t('contentExperience.planning.scenarioResult.goalsFallback'),
    riskMonth: result.value.firstRiskMonth || t('planning.scenarios.no_risk_month')
  }

  if (result.value.decisionStatus === 'ACTION_NEEDED') {
    return tVoice(
      'scenarioResult.advisorSpeech.actionNeeded',
      'contentExperience.planning.scenarioResult.advisorSpeechActionNeeded',
      commonParams
    )
  }
  if (result.value.decisionStatus === 'WATCH') {
    return tVoice(
      'scenarioResult.advisorSpeech.watch',
      'contentExperience.planning.scenarioResult.advisorSpeechWatch',
      commonParams
    )
  }
  if (result.value.decisionStatus === 'STABLE') {
    return tVoice(
      'scenarioResult.advisorSpeech.stable',
      'contentExperience.planning.scenarioResult.advisorSpeechStable',
      commonParams
    )
  }
  return [
    scenarioSummary.value,
    projectionBasisText.value,
    t('contentExperience.planning.scenarioResult.advisorSpeechFinalBalance', {
      amount: formatCurrency(result.value.projectedFinalBalance)
    })
  ].filter(Boolean).join(' ')
})

const resolveSpeechLocale = (): string => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
}

const stopAdvisorSpeech = () => {
  if (!isSpeechSupported.value) return
  window.speechSynthesis.cancel()
  isSpeaking.value = false
}

const toggleAdvisorSpeech = () => {
  if (!isSpeechSupported.value) return
  if (isSpeaking.value) {
    stopAdvisorSpeech()
    return
  }

  const text = advisorSpeechText.value.trim()
  if (!text) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = resolveSpeechLocale()
  utterance.rate = appVoice.value === 'carioca_funk' ? 1.05 : 0.96
  utterance.pitch = appVoice.value === 'founder' ? 0.95 : 1
  utterance.onend = () => {
    isSpeaking.value = false
  }
  utterance.onerror = () => {
    isSpeaking.value = false
  }
  isSpeaking.value = true
  window.speechSynthesis.speak(utterance)
}

const consequenceMessage = computed(() => {
  if (!result.value) return ''
  if (result.value.scenarioMonthlyImpact < 0) {
    return t('planning.scenarios.consequence_negative', {
      amount: formatCurrency(Math.abs(result.value.scenarioMonthlyImpact))
    })
  }
  if (result.value.scenarioMonthlyImpact > 0) {
    return t('planning.scenarios.consequence_positive', {
      amount: formatCurrency(result.value.scenarioMonthlyImpact)
    })
  }
  return t('planning.scenarios.consequence_neutral')
})

const extractErrorStatus = (error: unknown): number =>
  Number((error as { response?: { status?: number } })?.response?.status || 0)

const buildVersionedScenarioName = (name?: string): string => {
  const base = String(name || '').trim() || t('planning.scenarios.default_name')
  if (!/\(new\)$/i.test(base)) return t('planning.scenarios.versioned_name', { name: base })
  return `${base} ${new Date().toISOString().slice(11, 19)}`
}

const createDecisionLabel = computed(() =>
  scenarioId.value
    ? t('contentExperience.planning.scenarioResult.createDecision')
    : t('contentExperience.planning.scenarioResult.saveAndCreateDecision')
)

const editActionLabel = computed(() =>
  isScenarioLockedForEdit.value
    ? t('contentExperience.planning.scenarioResult.createNewVersion')
    : t('contentExperience.planning.scenarioResult.edit')
)

const refreshScenarioGovernance = async (targetScenarioId: string | null) => {
  if (!targetScenarioId) {
    isScenarioLockedForEdit.value = false
    return
  }
  try {
    const { data } = await DecisionService.list()
    const decisions = Array.isArray(data) ? data : []
    const linkedDecision = decisions.find((decision) => decision.scenarioId === targetScenarioId)
    const totalVotes =
      Number(linkedDecision?.approveVotes || 0) + Number(linkedDecision?.rejectVotes || 0)
    const decisionStatus = String(linkedDecision?.status || '').toUpperCase()
    isScenarioLockedForEdit.value =
      totalVotes > 0 || Boolean(decisionStatus && decisionStatus !== 'OPEN')
  } catch {
    // Keep editing available if we cannot determine lock status.
    isScenarioLockedForEdit.value = false
  }
}

const buildResultFromSavedScenario = (saved: SavedScenario): ScenarioSimulationResponse => ({
  scenarioName: saved.name || t('planning.scenarios.default_name'),
  scenarioType: saved.scenarioType,
  sourceType: saved.sourceType,
  months: Number(saved.months || 6),
  currentBalance: 0,
  baselineMonthlyNet: 0,
  scenarioMonthlyImpact: Number(saved.scenarioMonthlyImpact || 0),
  projectedFinalBalance: Number(saved.projectedFinalBalance || 0),
  decisionStatus:
    saved.decisionStatus === 'ACTION_NEEDED' ||
    saved.decisionStatus === 'WATCH' ||
    saved.decisionStatus === 'STABLE'
      ? saved.decisionStatus
      : 'NO_DATA',
  firstRiskMonth: null,
  availableForGoals: Math.max(0, Number(saved.projectedFinalBalance || 0)),
  impactedGoalsCount: Number(saved.impactedGoalsCount || 0),
  summary: saved.summary || '',
  forecast: saved.forecast || [],
  projection: saved.projection || [],
  impactedGoalNames: saved.impactedGoalNames || [],
  debtComparison: saved.debtComparison || null
})

const hasPersistedScenarioResult = (saved: SavedScenario): boolean => {
  const hasMetrics =
    saved.decisionStatus != null ||
    saved.projectedFinalBalance != null ||
    saved.scenarioMonthlyImpact != null ||
    saved.impactedGoalsCount != null
  if (saved.sourceType === 'MANUAL_TYPED') return hasMetrics
  return (
    hasMetrics &&
    ((Array.isArray(saved.projection) && saved.projection.length > 0) ||
      (Array.isArray(saved.forecast) && saved.forecast.length > 0))
  )
}

const loadResult = async () => {
  const routeId = String(route.params.id || '')
  isScenarioLockedForEdit.value = false
  const latestResult = window.sessionStorage.getItem('planning-scenario-latest-result')
  const hasFreshSimulationHint =
    typeof route.query.simulatedAt === 'string' && route.query.simulatedAt.length > 0
  const restored = loadWizardSnapshot()
  const restoredDebt = loadDebtSnapshot()

  if (restored) {
    Object.assign(snapshot, restored)
    scenarioId.value = restored.currentScenarioId
  }
  if (restoredDebt) {
    debtSnapshot.value = restoredDebt
    scenarioId.value = restoredDebt.currentScenarioId
  }

  if (latestResult) {
    try {
      const parsed = JSON.parse(latestResult) as
        | ScenarioSimulationResponse
        | { scenarioId?: string; result?: ScenarioSimulationResponse }
      const parsedScenarioId = 'scenarioId' in parsed ? String(parsed.scenarioId || '') : ''
      const parsedResult =
        'result' in parsed ? parsed.result : (parsed as ScenarioSimulationResponse)
      if (
        parsedResult &&
        (routeId === 'preview' || (hasFreshSimulationHint && parsedScenarioId === routeId))
      ) {
        result.value = parsedResult
        isShowingSavedSnapshot.value = false
        if (parsedScenarioId && parsedScenarioId !== 'preview') {
          scenarioId.value = parsedScenarioId
        }
        return
      }
    } catch (error) {
      console.warn('Could not parse latest simulation payload', error)
    }
  }

  if (!routeId) return

  try {
    const [{ data: scenarios }, { data: budget, status }] = await Promise.all([
      ScenarioService.list(),
      BudgetService.getCurrent(new Date().getMonth() + 1, new Date().getFullYear())
    ])

    const saved = (Array.isArray(scenarios) ? scenarios : []).find((item) => item.id === routeId)
    if (!saved) return

    scenarioId.value = saved.id
    await refreshScenarioGovernance(saved.id)

    const currentBudget =
      status !== 204 && budget && typeof budget === 'object' && 'id' in budget ? budget : null
    if (saved.sourceType === 'MANUAL_TYPED') {
      debtSnapshot.value = snapshotFromSavedDebtScenario(saved)
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      const rebuilt = snapshotFromSavedScenario(saved as SavedScenario, currentBudget || undefined)
      if (currentBudget && !rebuilt.scenarioLines.length) {
        rebuilt.scenarioLines = buildScenarioLinesFromBudget(currentBudget)
      }
      Object.assign(snapshot, rebuilt)
      saveWizardSnapshot(snapshot)
      if (!hasPersistedScenarioResult(saved)) {
        const { data } = await ScenarioService.simulate(buildSimulationPayload(snapshot))
        result.value = data
        isShowingSavedSnapshot.value = false
        window.sessionStorage.setItem(
          'planning-scenario-latest-result',
          JSON.stringify({
            scenarioId: saved.id,
            result: data
          })
        )
        return
      }
    }
    result.value = buildResultFromSavedScenario(saved)
    isShowingSavedSnapshot.value = true
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  }
}

const recalculateResult = async () => {
  if (isManualTypedScenario.value && !debtSnapshot.value) return
  if (!isManualTypedScenario.value && !snapshot.budgetId && !snapshot.currentScenarioId) return
  isRecalculating.value = true
  errorMessage.value = ''
  try {
    const payload =
      isManualTypedScenario.value && debtSnapshot.value
        ? buildDebtScenarioPayload(debtSnapshot.value)
        : buildSimulationPayload(snapshot)
    const { data } = await ScenarioService.simulate(payload)
    result.value = data
    isShowingSavedSnapshot.value = false
    window.sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        scenarioId: snapshot.currentScenarioId || String(route.params.id || ''),
        result: data
      })
    )
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isRecalculating.value = false
  }
}

const ensureScenarioPersisted = async (): Promise<string> => {
  const payload =
    isManualTypedScenario.value && debtSnapshot.value
      ? buildDebtScenarioPayload(debtSnapshot.value)
      : {
          ...buildScenarioPayload(snapshot),
          id: snapshot.currentScenarioId || undefined
        }
  try {
    const { data } = await ScenarioService.save(payload)
    snapshot.currentScenarioId = data.id
    scenarioId.value = data.id
    snapshot.scenarioName = data.name || snapshot.scenarioName
    if (debtSnapshot.value) {
      debtSnapshot.value.currentScenarioId = data.id
      debtSnapshot.value.scenarioName = data.name || debtSnapshot.value.scenarioName
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      saveWizardSnapshot(snapshot)
    }
    return data.id
  } catch (error) {
    if (extractErrorStatus(error) !== 409) {
      throw error
    }

    const conflictSafeName = buildVersionedScenarioName(snapshot.scenarioName)
    const { data } = await ScenarioService.save({
      ...payload,
      id: undefined,
      name: conflictSafeName
    })
    snapshot.currentScenarioId = data.id
    scenarioId.value = data.id
    snapshot.scenarioName = data.name || conflictSafeName
    if (debtSnapshot.value) {
      debtSnapshot.value.currentScenarioId = data.id
      debtSnapshot.value.scenarioName = data.name || conflictSafeName
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      saveWizardSnapshot(snapshot)
    }
    return data.id
  }
}

const saveScenario = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true
  try {
    const persistedId = await ensureScenarioPersisted()
    snapshot.currentScenarioId = persistedId
    scenarioId.value = persistedId
    await refreshScenarioGovernance(persistedId)
    if (debtSnapshot.value) {
      debtSnapshot.value.currentScenarioId = persistedId
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      saveWizardSnapshot(snapshot)
    }
    isShowingSavedSnapshot.value = true
    successMessage.value = t('planning.scenarios.save_success', {
      name: snapshot.scenarioName || t('planning.scenarios.default_name')
    })
    if (route.params.id !== persistedId) {
      await router.replace({ name: 'planning-scenarios-result', params: { id: persistedId } })
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.save_error')
  } finally {
    isSaving.value = false
  }
}

const createDecisionFromScenario = async () => {
  isCreatingDecision.value = true
  errorMessage.value = ''
  try {
    const persistedScenarioId = await ensureScenarioPersisted()
    await DecisionService.createFromScenario(persistedScenarioId)
    window.sessionStorage.setItem(
      DECISIONS_FLASH_SUCCESS_KEY,
      JSON.stringify({
        scenarioName:
          debtSnapshot.value?.scenarioName ||
          snapshot.scenarioName ||
          t('planning.scenarios.default_name')
      })
    )
    await router.push({ name: 'decisions', query: { scenarios: persistedScenarioId } })
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isCreatingDecision.value = false
  }
}

const editScenario = async () => {
  if (debtSnapshot.value) {
    saveDebtSnapshot(debtSnapshot.value)
  } else {
    saveWizardSnapshot(snapshot)
  }
  if (isScenarioLockedForEdit.value) {
    await router.push({
      name: isManualTypedScenario.value ? 'planning-scenarios-debt-new' : 'planning-scenarios-new',
      query: {
        cloneFrom: scenarioId.value || snapshot.currentScenarioId || String(route.params.id || ''),
        locked: '1'
      }
    })
    return
  }
  const routeScenarioId = String(route.params.id || '')
  const editId =
    scenarioId.value ||
    snapshot.currentScenarioId ||
    (routeScenarioId && routeScenarioId !== 'preview' ? routeScenarioId : null)
  if (!editId) {
    await router.push({
      name: isManualTypedScenario.value ? 'planning-scenarios-debt-new' : 'planning-scenarios-new',
      query: { resume: '1' }
    })
    return
  }
  await router.push({
    name: isManualTypedScenario.value ? 'planning-scenarios-debt-edit' : 'planning-scenarios-edit',
    params: { id: editId }
  })
}

const newScenario = async () => {
  clearWizardSnapshot()
  clearDebtSnapshot()
  window.sessionStorage.removeItem('planning-scenario-latest-result')
  await router.push({
    name: isManualTypedScenario.value ? 'planning-scenarios-debt-new' : 'planning-scenarios-new'
  })
}

onMounted(() => {
  void loadResult()
})

onUnmounted(() => {
  stopAdvisorSpeech()
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
  background: var(--cb-surface);
  border: 1px solid var(--cb-border-card);
  border-radius: 16px;
  padding: 20px;
  min-width: 0;
}

.hero-card {
  border-radius: 14px;
  padding: 18px;
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--cb-primary) 22%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-card__label {
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 0.75rem;
  color: var(--cb-primary);
  font-weight: 700;
}

.hero-card strong {
  font-size: 2rem;
}

.hero-card__voice-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.debt-comparison {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.debt-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  min-width: 0;
}

.debt-option-card {
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--cb-border-card);
  background: var(--cb-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.debt-option-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.debt-option-card__metrics {
  display: grid;
  gap: 6px;
  color: var(--cb-ink-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  min-width: 0;
}

.metric-card {
  border: 1px solid var(--cb-border-card);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.metric-card span {
  color: var(--cb-ink-muted);
  font-size: 0.86rem;
}

.metric-card strong {
  font-size: 1.2rem;
}

.projection-basis {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--cb-border-card);
  border-radius: 12px;
  background: var(--cb-surface-soft);
  min-width: 0;
}

.projection-basis__copy span,
.projection-basis__formula span {
  color: var(--cb-ink-muted);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.projection-basis__copy p {
  margin: 6px 0 0;
  color: var(--cb-ink-secondary);
  line-height: 1.5;
}

.projection-basis__formula {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.projection-basis__formula div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.projection-basis__formula strong {
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.result-action {
  min-width: 0;
}

.forecast-table {
  overflow-x: auto;
}

.forecast-explainer {
  margin: 0 0 12px;
  color: var(--cb-ink-secondary);
  font-size: .9rem;
  line-height: 1.5;
}

.forecast-table table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.forecast-table th,
.forecast-table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid var(--cb-border);
}

.projection-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.projection-cell strong {
  font-size: .96rem;
}

.projection-cell span {
  color: var(--cb-ink-muted);
  font-size: .78rem;
  white-space: nowrap;
}

.source-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.source-chips span {
  border-radius: 999px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
  font-size: .72rem;
  font-weight: 700;
  padding: 3px 7px;
  white-space: nowrap;
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
.warning-value  { color: var(--cb-warning); }

@media (max-width: 600px) {
  .scenario-result {
    padding-inline: 0;
  }

  .result-shell {
    padding: 16px;
  }

  .hero-card strong {
    font-size: 1.6rem;
  }

  .metrics-grid,
  .debt-options-grid,
  .projection-basis,
  .projection-basis__formula {
    grid-template-columns: 1fr;
  }

  .debt-option-card__header,
  .result-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .result-actions :deep(.v-btn) {
    width: 100%;
  }

  .scenario-name-badge {
    display: block;
    margin-left: 0;
    margin-top: 8px;
  }

  .forecast-table {
    overflow-x: visible;
  }

  .forecast-table table,
  .forecast-table tbody,
  .forecast-table tr,
  .forecast-table td {
    display: block;
    width: 100%;
  }

  .forecast-table thead {
    display: none;
  }

  .forecast-table tr {
    border: 1px solid var(--cb-border-card);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    background: var(--cb-surface-soft);
  }

  .forecast-table td {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    text-align: right;
  }

  .forecast-table td::before {
    content: attr(data-label);
    text-align: left;
    color: var(--cb-ink-muted);
    font-weight: 600;
  }
}

@media (max-width: 430px) {
  .hero-card {
    padding: 16px;
  }

  .hero-card strong {
    font-size: 1.45rem;
  }
}
</style>
