<template>
  <div class="cb-page">
    <div ref="resultContainer" class="cb-container scenario-result">
      <page-header :title="t('decisionJourney.result.title')" :meta="t('decisionJourney.result.subtitle')">
        <template #actions>
          <v-btn variant="text" color="var(--cb-primary)" style="min-width:0;padding:0 4px 0 0" @click="router.back()">
            <v-icon start size="20">mdi-arrow-left</v-icon>
            {{ t('common.back', 'Voltar') }}
          </v-btn>
        </template>
      </page-header>

      <div class="result-shell" v-if="result">
        <p v-if="isLoading" role="status">{{ t('decisionJourney.result.loading') }}</p>
        <alert-strip v-if="isScenarioLockedForEdit" variant="warning" :description="t('contentExperience.planning.scenarioResult.lockedNotice')" />
        <DecisionResultExplanation :model="presentation" :copy="narrative">
          <template #voice>
            <button v-if="isSpeechSupported" type="button" class="result-voice"
              :aria-label="isSpeaking ? t('contentExperience.planning.scenarioResult.stopAdvisor') : t('contentExperience.planning.scenarioResult.listenAdvisor')"
              @click="toggleAdvisorSpeech">
              <v-icon start>{{ isSpeaking ? 'mdi-stop-circle-outline' : 'mdi-volume-high' }}</v-icon>
              {{ isSpeaking ? t('contentExperience.planning.scenarioResult.stopAdvisor') : t('contentExperience.planning.scenarioResult.listenAdvisor') }}
            </button>
          </template>
        </DecisionResultExplanation>

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

        <section class="continuation-summary" aria-labelledby="continuation-title">
          <h2 id="continuation-title">{{ t('decisionJourney.continuation.title') }}</h2>
          <p role="status">{{ continuationStage }}</p>
          <p>{{ t('decisionJourney.continuation.saveHelp') }}</p>
          <p>{{ t('decisionJourney.continuation.createHelp') }}</p>
          <p v-if="needsSave && !canWriteScenarios">{{ t('planning.scenarios.save_forbidden') }}</p>
          <p v-if="!governanceKnown">{{ t('decisionJourney.continuation.governanceUnknown') }}</p>
          <v-btn v-if="!governanceKnown" variant="text" :disabled="isBusy" @click="refreshScenarioGovernance(scenarioId)">{{ t('decisionJourney.continuation.refresh') }}</v-btn>
        </section>
        <div class="result-actions">
          <v-btn v-if="linkedDecision" class="result-action result-action--primary" color="var(--cb-primary)" :disabled="isBusy" @click="openLinkedDecision">
            {{ t('decisionJourney.continuation.openDecision') }}
          </v-btn>
          <v-btn
            v-else
            class="result-action"
            :class="{ 'result-action--primary': !needsSave }"
            :variant="needsSave ? 'text' : 'flat'"
            color="var(--cb-primary)"
            :loading="isCreatingDecision"
            :disabled="
              isBusy || !governanceKnown || (needsSave && !canWriteScenarios) || isScenarioLockedForEdit
            "
            @click="createDecisionFromScenario"
          >
            <v-icon start>mdi-lightbulb-outline</v-icon>
            {{ createDecisionLabel }}
          </v-btn>
          <v-btn
            v-if="canWriteScenarios && needsSave"
            class="result-action"
            :class="{ 'result-action--primary': !linkedDecision }"
            :variant="linkedDecision ? 'tonal' : 'flat'"
            color="var(--cb-primary)"
            :loading="isSaving"
            :disabled="isBusy || !governanceKnown || isScenarioLockedForEdit"
            @click="saveScenario"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            {{ t('decisionJourney.continuation.saveOnly') }}
          </v-btn>
          <v-btn
            class="result-action"
            variant="text"
            :loading="isRecalculating"
            :disabled="isBusy"
            @click="recalculateResult"
          >
            <v-icon start>mdi-refresh</v-icon>
            {{ t('contentExperience.planning.scenarioResult.recalculate') }}
          </v-btn>
          <v-btn class="result-action" variant="text" :disabled="isBusy || !governanceKnown" @click="editScenario">
            <v-icon start>mdi-pencil-outline</v-icon>
            {{ editActionLabel }}
          </v-btn>
          <v-btn class="result-action" variant="text" :disabled="isBusy" @click="newScenario">
            <v-icon start>mdi-file-plus-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </div>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="comfortable"
          class="scenario-feedback"
        >
          {{ errorMessage }}
        </v-alert>

        <div v-if="successMessage" class="scenario-feedback scenario-feedback--success">
          <div class="scenario-feedback__icon">
            <v-icon size="24">mdi-check-circle-outline</v-icon>
          </div>
          <div class="scenario-feedback__body">
            <strong>{{ successMessage }}</strong>
          </div>
          <div class="scenario-feedback__actions">
            <v-btn
              size="small"
              variant="text"
              color="success"
              @click="router.push({ name: 'planning-scenarios' })"
            >
              {{ t('planning.scenarios.saved_title') }}
            </v-btn>
          </div>
        </div>
      </div>

      <div v-else-if="isLoading" class="empty-results" role="status">{{ t('decisionJourney.result.loading') }}</div>
      <div class="empty-results" v-else>
        <v-icon color="var(--cb-ink-muted)" size="28">mdi-chart-timeline-variant</v-icon>
        <p>{{ errorMessage || t('planning.scenarios.results_placeholder') }}</p>
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
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'
import DecisionResultExplanation from '@/components/decision/DecisionResultExplanation.vue'
import { savedResultEvidence, presentDecisionResult, decisionResultNarrative, type ResultEvidence, type ResultOrigin } from '@/utils/decisionResultPresentation'
import DecisionService, { type PersistedDecision } from '@/services/DecisionService'
import { decisionLocksScenario, decisionStageKey, decisionActionErrorKey } from '@/utils/decisionLifecycle'
import ScenarioService, {
  type SavedScenario,
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
import { useDecisionJourneySession } from '@/composables/useDecisionJourneySession'
import { readJourneyResult, writeJourneyResult, setJourneyValue, JOURNEY_RESULT_KEY, type JourneySession } from '@/utils/decisionJourneySession'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { appVoice } = useAppVoice()
const userStore = useUserStore()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const result = ref<ResultEvidence | null>(null)
const resultContainer = ref<HTMLElement | null>(null)
const scenarioId = ref<string | null>(null)
const isSaving = ref(false)
const isCreatingDecision = ref(false)
const isRecalculating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resultOrigin = ref<ResultOrigin>('live')
const wasRecalculated = ref(false)
const isLoading = ref(false)
let loadRevision = 0
const isScenarioLockedForEdit = ref(false)
const linkedDecision = ref<PersistedDecision | null>(null)
const governanceKnown = ref(true)
const needsSave = ref(true)
const isBusy = computed(() => isLoading.value || isSaving.value || isCreatingDecision.value || isRecalculating.value)
const continuationStage = computed(() => linkedDecision.value ? t(decisionStageKey(linkedDecision.value))
  : t(needsSave.value ? 'decisionJourney.continuation.preview' : 'decisionJourney.continuation.saved'))
const isSpeaking = ref(false)
const debtSnapshot = ref<DebtScenarioSnapshot | null>(null)
const canWriteScenarios = computed(() => userStore.canWrite)
const isSpeechSupported = computed(() =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
)

const snapshot = reactive<ScenarioWizardSnapshot>({
  scenarioName: '',
  months: 6,
  currentScenarioId: null,
  adjustments: [],
  scenarioLines: []
})
const resetLocalResult = () => {
  loadRevision += 1
  isLoading.value = false
  result.value = null
  scenarioId.value = null
  debtSnapshot.value = null
  Object.assign(snapshot, { scenarioName: '', months: 6, currentScenarioId: null, budgetId: undefined,
    periodMonth: undefined, periodYear: undefined, adjustments: [], scenarioLines: [] })
  isScenarioLockedForEdit.value = false
  linkedDecision.value = null
  governanceKnown.value = true
  needsSave.value = true
  resultOrigin.value = 'live'
  wasRecalculated.value = false
  isSaving.value = false
  isCreatingDecision.value = false
  isRecalculating.value = false
  errorMessage.value = ''
  successMessage.value = ''
  stopAdvisorSpeech()
}
const journey = useDecisionJourneySession(resetLocalResult)

const isManualTypedScenario = computed(() =>
  result.value?.sourceType === 'MANUAL_TYPED' || debtSnapshot.value?.sourceType === 'MANUAL_TYPED')
const presentation = computed(() => presentDecisionResult(result.value || {}, resultOrigin.value, wasRecalculated.value, isManualTypedScenario.value))
const formatCurrency = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
  ? value.toLocaleString(locale.value, { style: 'currency', currency: 'BRL' })
  : t('decisionJourney.result.unavailable')
const narrative = computed(() => decisionResultNarrative(presentation.value, (key, params) => t(key, params || {}), formatCurrency))
const advisorSpeechText = computed(() => narrative.value.speech)

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

watch(advisorSpeechText, () => stopAdvisorSpeech())

const extractErrorStatus = (error: unknown): number =>
  Number((error as { response?: { status?: number } })?.response?.status || 0)

const buildVersionedScenarioName = (name?: string): string => {
  const base = String(name || '').trim() || t('planning.scenarios.default_name')
  if (!/\(new\)$/i.test(base)) return t('planning.scenarios.versioned_name', { name: base })
  return `${base} ${new Date().toISOString().slice(11, 19)}`
}

const createDecisionLabel = computed(() =>
  !needsSave.value
    ? t('contentExperience.planning.scenarioResult.createDecision')
    : t('contentExperience.planning.scenarioResult.saveAndCreateDecision')
)

const editActionLabel = computed(() =>
  isScenarioLockedForEdit.value
    ? t('contentExperience.planning.scenarioResult.createNewVersion')
    : t('contentExperience.planning.scenarioResult.edit')
)

const refreshScenarioGovernance = async (targetScenarioId: string | null) => {
  const operation = journey.session.value
  if (!targetScenarioId) {
    isScenarioLockedForEdit.value = false
    linkedDecision.value = null
    governanceKnown.value = true
    return
  }
  governanceKnown.value = false
  try {
    const { data } = await DecisionService.list()
    if (!journey.isCurrent(operation)) return
    if (!Array.isArray(data)) throw new Error('Invalid decision governance response')
    const decisions = data
    linkedDecision.value = decisions.find((decision) => decision.scenarioId === targetScenarioId) || null
    isScenarioLockedForEdit.value = decisionLocksScenario(linkedDecision.value)
    governanceKnown.value = true
  } catch {
    // Unknown governance must not be presented as permission to overwrite a scenario.
    if (journey.isCurrent(operation)) governanceKnown.value = false
  }
}

const hydrateResult = async () => {
  const routeId = String(route.params.id || '')
  let operation = journey.restore()
  const hasFreshSimulationHint =
    typeof route.query.simulatedAt === 'string' && route.query.simulatedAt.length > 0
  if (operation && (operation.scenarioId || 'preview') === routeId &&
      (routeId === 'preview' || hasFreshSimulationHint)) {
    const cached = readJourneyResult(operation, routeId)
    const restored = operation.sourceType === 'MANUAL_TYPED' ? loadDebtSnapshot() : loadWizardSnapshot()
    if (cached && restored && restored.currentScenarioId === operation.scenarioId) {
      if (operation.sourceType === 'MANUAL_TYPED') debtSnapshot.value = restored as DebtScenarioSnapshot
      else Object.assign(snapshot, restored)
      scenarioId.value = operation.scenarioId
      result.value = cached
      if (scenarioId.value) await refreshScenarioGovernance(scenarioId.value)
      return
    }
  }

  // A preview has no durable backing. Never fill it from another draft or API scenario.
  if (!routeId || routeId === 'preview') return
  operation = journey.start('BUDGET_BASED', routeId)
  if (!operation) return

  try {
    const { data: scenarios } = await ScenarioService.list()
    if (!journey.isCurrent(operation)) return
    const saved = (Array.isArray(scenarios) ? scenarios : []).find((item) => item.id === routeId)
    if (!saved) return
    if (saved.sourceType === 'MANUAL_TYPED') {
      operation = journey.start('MANUAL_TYPED', routeId)
      if (!operation) return
    }
    scenarioId.value = saved.id
    needsSave.value = false
    await refreshScenarioGovernance(saved.id)
    if (!journey.isCurrent(operation)) return
    if (route.query.decisionPending && !linkedDecision.value) {
      successMessage.value = t('decisionJourney.continuation.savedAfterFailure')
      errorMessage.value = t(decisionActionErrorKey({ response: { status: Number(route.query.decisionPending) } }))
    }
    // Read the historical evidence independently of the current plan's availability.
    result.value = savedResultEvidence(saved)
    resultOrigin.value = saved.projection?.length ? 'saved' : saved.forecast?.length ? 'legacy' : 'saved'
    if (saved.sourceType === 'MANUAL_TYPED') {
      debtSnapshot.value = snapshotFromSavedDebtScenario(saved)
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      Object.assign(snapshot, snapshotFromSavedScenario(saved))
      saveWizardSnapshot(snapshot)
      const { data: budget, status } = await BudgetService.getCurrent(new Date().getMonth() + 1, new Date().getFullYear())
      if (!journey.isCurrent(operation)) return
      const currentBudget = status !== 204 && budget && typeof budget === 'object' && 'id' in budget ? budget : null
      const rebuilt = snapshotFromSavedScenario(saved as SavedScenario, currentBudget || undefined)
      if (currentBudget && !rebuilt.scenarioLines.length) {
        rebuilt.scenarioLines = buildScenarioLinesFromBudget(currentBudget)
      }
      Object.assign(snapshot, rebuilt)
      saveWizardSnapshot(snapshot)
    }
  } catch (e) {
    if (!journey.isCurrent(operation)) return
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  }
}

const loadResult = async () => {
  resetLocalResult()
  const revision = loadRevision
  isLoading.value = true
  try {
    await hydrateResult()
  } finally {
    if (revision === loadRevision) {
      isLoading.value = false
      await nextTick()
      if (revision !== loadRevision) return
      const heading = resultContainer.value?.querySelector('h1')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
    }
  }
}

const recalculateResult = async () => {
  const operation = journey.session.value
  if (!journey.isCurrent(operation) || isBusy.value) return
  if (isManualTypedScenario.value && !debtSnapshot.value) return
  if (!isManualTypedScenario.value && !snapshot.budgetId && !snapshot.currentScenarioId) return
  isRecalculating.value = true
  stopAdvisorSpeech()
  errorMessage.value = ''
  try {
    const payload =
      isManualTypedScenario.value && debtSnapshot.value
        ? buildDebtScenarioPayload(debtSnapshot.value)
        : buildSimulationPayload(snapshot)
    const { data } = await ScenarioService.simulate(payload)
    if (!journey.isCurrent(operation)) return
    result.value = data
    resultOrigin.value = 'live'
    wasRecalculated.value = true
    needsSave.value = true
    writeJourneyResult(operation, scenarioId.value || 'preview', data)
  } catch (e) {
    if (!journey.isCurrent(operation)) return
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    if (journey.isCurrent(operation)) isRecalculating.value = false
  }
}

const ensureScenarioPersisted = async (operation: JourneySession): Promise<string> => {
  if (!journey.isCurrent(operation) || !result.value) throw new Error('Inactive decision journey')
  const payload =
    isManualTypedScenario.value && debtSnapshot.value
      ? buildDebtScenarioPayload(debtSnapshot.value)
      : {
          ...buildScenarioPayload(snapshot),
          id: snapshot.currentScenarioId || undefined
        }
  try {
    const { data } = await ScenarioService.save(payload)
    if (!journey.isCurrent(operation)) throw new Error('Inactive decision journey')
    journey.linkScenario(data.id)
    snapshot.currentScenarioId = data.id
    scenarioId.value = data.id
    needsSave.value = false
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
    if (!journey.isCurrent(operation) || extractErrorStatus(error) !== 409) {
      throw error
    }

    const conflictSafeName = buildVersionedScenarioName(snapshot.scenarioName)
    const { data } = await ScenarioService.save({
      ...payload,
      id: undefined,
      name: conflictSafeName
    })
    if (!journey.isCurrent(operation)) throw new Error('Inactive decision journey')
    journey.linkScenario(data.id)
    snapshot.currentScenarioId = data.id
    scenarioId.value = data.id
    needsSave.value = false
    linkedDecision.value = null
    isScenarioLockedForEdit.value = false
    successMessage.value = t('decisionJourney.continuation.versionSaved')
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
  const operation = journey.session.value
  if (!journey.isCurrent(operation) || isBusy.value || !canWriteScenarios.value || !governanceKnown.value || isScenarioLockedForEdit.value) return
  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true
  try {
    const persistedId = await ensureScenarioPersisted(operation)
    if (!journey.isCurrent(operation)) return
    snapshot.currentScenarioId = persistedId
    scenarioId.value = persistedId
    await refreshScenarioGovernance(persistedId)
    if (!journey.isCurrent(operation)) return
    if (debtSnapshot.value) {
      debtSnapshot.value.currentScenarioId = persistedId
      saveDebtSnapshot(debtSnapshot.value)
    } else {
      saveWizardSnapshot(snapshot)
    }
    wasRecalculated.value = false
    successMessage.value ||= t('planning.scenarios.save_success', {
      name: snapshot.scenarioName || t('planning.scenarios.default_name')
    })
    if (route.params.id !== persistedId) {
      await router.replace({ name: 'planning-scenarios-result', params: { id: persistedId } })
    }
  } catch (e) {
    if (!journey.isCurrent(operation)) return
    console.error(e)
    const status = extractErrorStatus(e)
    errorMessage.value =
      status === 403
        ? t('planning.scenarios.save_forbidden')
        : t('planning.scenarios.save_error')
  } finally {
    if (journey.isCurrent(operation)) isSaving.value = false
  }
}

const createDecisionFromScenario = async () => {
  const operation = journey.session.value
  if (!journey.isCurrent(operation) || isBusy.value || !governanceKnown.value || isScenarioLockedForEdit.value || linkedDecision.value || (needsSave.value && !canWriteScenarios.value)) return
  isCreatingDecision.value = true
  errorMessage.value = ''
  try {
    if (scenarioId.value) {
      await refreshScenarioGovernance(scenarioId.value)
      if (!journey.isCurrent(operation)) return
      if (!governanceKnown.value) return
      if (linkedDecision.value) {
        await router.push({ name: 'decisions', query: { scenarios: scenarioId.value } })
        return
      }
    }
    const persistedScenarioId = needsSave.value ? await ensureScenarioPersisted(operation) : scenarioId.value
    if (!persistedScenarioId) throw new Error('Missing saved scenario')
    if (!journey.isCurrent(operation)) return
    const { data: createdDecision } = await DecisionService.createFromScenario(persistedScenarioId)
    if (!journey.isCurrent(operation)) return
    linkedDecision.value = createdDecision
    isScenarioLockedForEdit.value = decisionLocksScenario(createdDecision)
    setJourneyValue(
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
    if (!journey.isCurrent(operation)) return
    console.error(e)
    errorMessage.value = t(decisionActionErrorKey(e))
    if (scenarioId.value && !needsSave.value && !linkedDecision.value) {
      successMessage.value = t('decisionJourney.continuation.savedAfterFailure')
      // Retain the saved ID in the URL as well as the draft, so refresh can resume safely.
      await router.replace({ name: 'planning-scenarios-result', params: { id: scenarioId.value },
        query: { decisionPending: String(extractErrorStatus(e) || 'unknown') } })
    }
  } finally {
    if (journey.isCurrent(operation)) isCreatingDecision.value = false
  }
}

const editScenario = async () => {
  if (!journey.isCurrent() || isBusy.value || !governanceKnown.value) return
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
  if (isBusy.value) return
  clearWizardSnapshot()
  clearDebtSnapshot()
  setJourneyValue(JOURNEY_RESULT_KEY, null)
  await router.push({
    name: isManualTypedScenario.value ? 'planning-scenarios-debt-new' : 'planning-scenarios-new'
  })
}

const openLinkedDecision = () => {
  if (!isBusy.value && linkedDecision.value) return router.push({ name: 'decisions', query: { scenarios: linkedDecision.value.scenarioId } })
}

onMounted(() => {
  void loadResult()
})
watch(() => [route.params.id, route.query.simulatedAt], () => { void loadResult() })

onUnmounted(() => {
  stopAdvisorSpeech()
})
</script>

<style scoped>
.continuation-summary { display: grid; gap: 8px; }
.result-voice { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 8px; border: 1px solid currentColor; color: var(--cb-ink); background: transparent; cursor: pointer; }
.result-voice:focus-visible { outline: 3px solid var(--cb-primary); outline-offset: 3px; }
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

.scenario-feedback {
  margin-top: 2px;
}

.scenario-feedback--success {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--cb-positive) 24%, transparent);
  background: color-mix(in srgb, var(--cb-positive) 9%, var(--cb-surface));
  color: var(--cb-ink);
}

.scenario-feedback__icon {
  color: var(--cb-positive);
  flex: 0 0 auto;
  display: grid;
  place-items: center;
}

.scenario-feedback__body {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scenario-feedback__body strong {
  color: var(--cb-ink);
}

.scenario-feedback__body span {
  color: var(--cb-ink-secondary);
  line-height: 1.4;
}

.scenario-feedback__actions {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
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
  :deep(.cb-page-header) { flex-direction: column; align-items: stretch; }
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

  .scenario-feedback--success {
    flex-direction: column;
  }

  .scenario-feedback__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .scenario-feedback__actions :deep(.v-btn) {
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
