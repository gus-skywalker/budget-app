<template>
  <div class="decisions-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('decisions.title') }}</h1>
          <p class="page-subtitle">{{ $t('decisions.subtitle') }}</p>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-lightbulb-outline</v-icon>
            {{ $t('decisions.list_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div class="decisions-toolbar">
            <p class="decisions-note">
              {{ decisionsSourceNote }}
            </p>
            <div class="decisions-toolbar__actions">
              <v-btn variant="text" color="#667eea" @click="goToScenarios">
                <v-icon start>mdi-arrow-left</v-icon>
                {{ $t('decisions.back_to_scenarios') }}
              </v-btn>
              <v-btn
                v-if="selectedScenarioIds.length"
                variant="tonal"
                color="#667eea"
                @click="goToScenarios"
              >
                <v-icon start>mdi-chart-timeline-variant</v-icon>
                {{ $t('decisions.review_in_scenarios') }}
              </v-btn>
              <v-btn
                v-if="selectedScenarioIds.length"
                variant="text"
                color="#667eea"
                @click="goToInsights"
              >
                <v-icon start>mdi-brain</v-icon>
                {{ $t('decisions.open_in_insights') }}
              </v-btn>
            </div>
          </div>

          <div v-if="isLoading" class="empty-state">
            <v-icon color="#94a3b8" size="28">mdi-timer-sand</v-icon>
            <p>{{ $t('decisions.loading') }}</p>
          </div>

          <div v-else-if="error" class="empty-state empty-state--error">
            <v-icon color="#ef4444" size="28">mdi-alert-circle-outline</v-icon>
            <p>{{ error }}</p>
          </div>

          <div v-else-if="decisionCards.length" class="decisions-grid">
            <div v-for="decision in decisionCards" :key="decision.scenarioId" class="decision-card">
              <div class="decision-card__header">
                <div class="decision-card__title-wrap">
                  <h3 class="decision-card__title">{{ decision.title }}</h3>
                  <p class="decision-card__scenario">{{ decision.scenarioLabel }}</p>
                </div>
                <v-chip size="x-small" variant="tonal" :color="decision.statusColor">
                  {{ decision.status }}
                </v-chip>
              </div>

              <p class="decision-card__description">{{ decision.description }}</p>

              <div class="decision-card__metrics">
                <div class="decision-metric">
                  <span>{{ $t('decisions.final_balance') }}</span>
                  <strong>{{ formatCurrency(decision.finalBalance) }}</strong>
                </div>
                <div class="decision-metric">
                  <span>{{ $t('decisions.available_for_goals') }}</span>
                  <strong>{{ formatCurrency(decision.availableForGoals) }}</strong>
                </div>
                <div class="decision-metric">
                  <span>{{ $t('decisions.risk_month') }}</span>
                  <strong>{{ decision.riskMonth }}</strong>
                </div>
              </div>

              <div class="decision-card__meta">
                <span>{{ decision.impact }}</span>
                <span>{{ decision.goalsImpact }}</span>
                <span v-if="decision.persistedAt">{{ decision.persistedAt }}</span>
              </div>

              <div v-if="decision.decisionId" class="decision-votes">
                <div class="decision-votes__summary">
                  <strong>{{ $t('decisions.votes_title') }}</strong>
                  <span>{{ $t('decisions.votes_summary', { approve: decision.approveVotes, reject: decision.rejectVotes }) }}</span>
                </div>

                <div class="decision-votes__actions">
                  <v-btn
                    variant="tonal"
                    color="success"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-approve'"
                    :disabled="decision.currentUserVote === 'APPROVE'"
                    @click="voteDecision(decision.decisionId, 'APPROVE')"
                  >
                    <v-icon start>mdi-thumb-up-outline</v-icon>
                    {{ $t('decisions.vote_approve') }}
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    color="error"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-reject'"
                    :disabled="decision.currentUserVote === 'REJECT'"
                    @click="voteDecision(decision.decisionId, 'REJECT')"
                  >
                    <v-icon start>mdi-thumb-down-outline</v-icon>
                    {{ $t('decisions.vote_reject') }}
                  </v-btn>
                  <v-btn
                    v-if="decision.currentUserVote"
                    variant="text"
                    color="#667eea"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-clear'"
                    @click="clearDecisionVote(decision.decisionId)"
                  >
                    <v-icon start>mdi-close-circle-outline</v-icon>
                    {{ $t('decisions.vote_clear') }}
                  </v-btn>
                </div>

                <p v-if="decision.currentUserVote" class="decision-votes__current">
                  {{ $t('decisions.vote_current', { vote: decision.currentUserVote === 'APPROVE' ? $t('decisions.vote_approve') : $t('decisions.vote_reject') }) }}
                </p>
              </div>

              <div class="decision-card__actions">
                <v-btn
                  v-if="!decision.decisionId"
                  variant="tonal"
                  color="#667eea"
                  :loading="activeDecisionId === decision.scenarioId && decisionAction === 'create'"
                  @click="trackDecision(decision.scenarioId)"
                >
                  <v-icon start>mdi-bookmark-plus-outline</v-icon>
                  {{ $t('decisions.track_decision') }}
                </v-btn>
                <template v-else>
                  <v-btn
                    variant="text"
                    color="success"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'approve'"
                    @click="updateDecisionStatus(decision.decisionId, 'APPROVED')"
                  >
                    <v-icon start>mdi-check</v-icon>
                    {{ $t('decisions.approve_action') }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'reject'"
                    @click="updateDecisionStatus(decision.decisionId, 'REJECTED')"
                  >
                    <v-icon start>mdi-close</v-icon>
                    {{ $t('decisions.reject_action') }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="#667eea"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'reopen'"
                    @click="updateDecisionStatus(decision.decisionId, 'OPEN')"
                  >
                    <v-icon start>mdi-restore</v-icon>
                    {{ $t('decisions.reopen_action') }}
                  </v-btn>
                </template>
                <v-btn variant="text" color="#667eea" @click="openScenario(decision.scenarioId)">
                  <v-icon start>mdi-pencil-outline</v-icon>
                  {{ $t('decisions.open_scenario') }}
                </v-btn>
              </div>

              <div v-if="decision.decisionId" class="decision-comments">
                <div class="decision-comments__header">
                  <strong>{{ $t('decisions.comments_title') }}</strong>
                  <span>{{ decision.comments.length }} {{ $t('decisions.comments_count') }}</span>
                </div>

                <div v-if="decision.comments.length" class="decision-comments__list">
                  <div
                    v-for="comment in decision.comments"
                    :key="comment.id"
                    class="decision-comment"
                  >
                    <p>{{ comment.body }}</p>
                    <span v-if="comment.createdAt">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                </div>
                <p v-else class="decision-comments__empty">
                  {{ $t('decisions.comments_empty') }}
                </p>

                <div class="decision-comments__composer">
                  <v-textarea
                    v-model="commentDrafts[decision.decisionId]"
                    :label="$t('decisions.comment_label')"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                    hide-details="auto"
                  />
                  <v-btn
                    color="#667eea"
                    variant="tonal"
                    :disabled="!commentDrafts[decision.decisionId]?.trim()"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'comment'"
                    @click="addDecisionComment(decision.decisionId)"
                  >
                    <v-icon start>mdi-comment-plus-outline</v-icon>
                    {{ $t('decisions.add_comment') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <v-icon color="#94a3b8" size="28">mdi-lightbulb-auto-outline</v-icon>
            <p>{{ $t('decisions.empty') }}</p>
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
import DecisionService, { type DecisionComment, type DecisionVoteValue, type PersistedDecision, type PersistedDecisionStatus } from '@/services/DecisionService'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const DECISIONS_STORAGE_KEY = 'decisions-scenarios'

const isLoading = ref(false)
const error = ref('')
const activeDecisionId = ref<string | null>(null)
const decisionAction = ref<'create' | 'approve' | 'reject' | 'reopen' | 'comment' | 'vote-approve' | 'vote-reject' | 'vote-clear' | null>(null)
const savedScenarios = ref<SavedScenario[]>([])
const selectedScenarioIds = ref<string[]>([])
const simulations = ref<Array<{ scenario: SavedScenario; result: ScenarioSimulationResponse }>>([])
const persistedDecisions = ref<PersistedDecision[]>([])
const commentDrafts = ref<Record<string, string>>({})

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(
        locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR'
      )
    : ''

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

const statusLabel = (scenarioStatus?: string, persistedStatus?: PersistedDecisionStatus) => {
  if (persistedStatus === 'APPROVED') return t('decisions.status_approved')
  if (persistedStatus === 'REJECTED') return t('decisions.status_rejected')
  if (persistedStatus === 'OPEN') return t('decisions.status_open')
  if (scenarioStatus === 'ACTION_NEEDED') return t('decisions.status_action_needed')
  if (scenarioStatus === 'WATCH') return t('decisions.status_watch')
  if (scenarioStatus === 'STABLE') return t('decisions.status_stable')
  return t('decisions.status_no_data')
}

const statusColor = (scenarioStatus?: string, persistedStatus?: PersistedDecisionStatus) => {
  if (persistedStatus === 'APPROVED') return 'success'
  if (persistedStatus === 'REJECTED') return 'error'
  if (persistedStatus === 'OPEN') return '#667eea'
  if (scenarioStatus === 'ACTION_NEEDED') return 'error'
  if (scenarioStatus === 'WATCH') return 'warning'
  if (scenarioStatus === 'STABLE') return '#667eea'
  return 'default'
}

const decisionCards = computed(() =>
  simulations.value.map(({ scenario, result }) => {
    const persisted = persistedDecisions.value.find((decision) => decision.scenarioId === scenario.id)
    return {
      scenarioId: scenario.id,
      decisionId: persisted?.id || null,
      title: scenario.name,
      scenarioLabel: t('decisions.scenario_label', { name: scenario.name }),
      status: statusLabel(result.decisionStatus, persisted?.status),
      statusColor: statusColor(result.decisionStatus, persisted?.status),
      description: persisted?.summary || result.summary || t('decisions.no_summary'),
      finalBalance: result.projectedFinalBalance,
      availableForGoals: result.availableForGoals,
      riskMonth: result.firstRiskMonth || t('decisions.no_risk_month'),
      impact: t('decisions.impact_label', { amount: formatCurrency(result.scenarioMonthlyImpact) }),
      goalsImpact: t('decisions.goals_impact_label', { count: result.impactedGoalsCount }),
      persistedAt: persisted?.createdAt ? t('decisions.created_at_label', { date: new Date(persisted.createdAt).toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR') }) : '',
      comments: persisted?.comments || [],
      approveVotes: persisted?.approveVotes || 0,
      rejectVotes: persisted?.rejectVotes || 0,
      currentUserVote: persisted?.currentUserVote || null,
    }
  })
)

const decisionsSourceNote = computed(() =>
  selectedScenarioIds.value.length
    ? t('decisions.source_selected', { count: selectedScenarioIds.value.length })
    : t('decisions.source_recent')
)

const resolveSelectedIds = () => {
  const fromQuery = typeof route.query.scenarios === 'string' ? route.query.scenarios : ''
  const fromStorage = window.localStorage.getItem(DECISIONS_STORAGE_KEY) || ''
  const raw = fromQuery || fromStorage
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2)
}

const loadDecisionCards = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const { data } = await ScenarioService.list()
    savedScenarios.value = Array.isArray(data) ? data : []
    const decisionsResponse = await DecisionService.list()
    persistedDecisions.value = Array.isArray(decisionsResponse.data) ? decisionsResponse.data : []

    const preferredIds = resolveSelectedIds()
    const picked = preferredIds.length
      ? preferredIds
          .map((id) => savedScenarios.value.find((scenario) => scenario.id === id))
          .filter((scenario): scenario is SavedScenario => Boolean(scenario))
      : savedScenarios.value.slice(0, 3)

    selectedScenarioIds.value = picked.map((scenario) => scenario.id)

    if (selectedScenarioIds.value.length) {
      window.localStorage.setItem(DECISIONS_STORAGE_KEY, selectedScenarioIds.value.join(','))
      await router.replace({
        query: {
          ...route.query,
          scenarios: selectedScenarioIds.value.join(','),
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
    error.value = t('decisions.load_error')
    simulations.value = []
  } finally {
    isLoading.value = false
  }
}

const goToScenarios = async () => {
  const nextQuery = selectedScenarioIds.value.length
    ? { scenarios: selectedScenarioIds.value.join(',') }
    : undefined
  await router.push({
    path: '/planning/scenarios',
    query: nextQuery,
  })
}

const openScenario = async (scenarioId: string) => {
  window.localStorage.setItem(DECISIONS_STORAGE_KEY, scenarioId)
  await router.push({
    path: '/planning/scenarios',
    query: { scenarios: scenarioId },
  })
}

const goToInsights = async () => {
  if (!selectedScenarioIds.value.length) {
    return
  }
  window.localStorage.setItem(DECISIONS_STORAGE_KEY, selectedScenarioIds.value.join(','))
  await router.push({
    path: '/insights',
    query: { scenarios: selectedScenarioIds.value.join(',') },
  })
}

const trackDecision = async (scenarioId: string) => {
  activeDecisionId.value = scenarioId
  decisionAction.value = 'create'
  try {
    const { data } = await DecisionService.createFromScenario(scenarioId)
    persistedDecisions.value = [
      ...persistedDecisions.value.filter((decision) => decision.id !== data.id),
      data,
    ]
  } catch (trackError) {
    console.error(trackError)
    error.value = t('decisions.persist_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const updateDecisionStatus = async (decisionId: string, status: PersistedDecisionStatus) => {
  activeDecisionId.value = decisionId
  decisionAction.value = status === 'APPROVED' ? 'approve' : status === 'REJECTED' ? 'reject' : 'reopen'
  try {
    const { data } = await DecisionService.updateStatus(decisionId, status)
    persistedDecisions.value = persistedDecisions.value.map((decision) =>
      decision.id === decisionId ? data : decision
    )
  } catch (statusError) {
    console.error(statusError)
    error.value = t('decisions.persist_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const addDecisionComment = async (decisionId: string) => {
  const body = commentDrafts.value[decisionId]?.trim()
  if (!body) {
    return
  }

  activeDecisionId.value = decisionId
  decisionAction.value = 'comment'
  try {
    const { data } = await DecisionService.addComment(decisionId, body)
    persistedDecisions.value = persistedDecisions.value.map((decision) =>
      decision.id === decisionId
        ? { ...decision, comments: [...(decision.comments || []), data as DecisionComment] }
        : decision
    )
    commentDrafts.value[decisionId] = ''
  } catch (commentError) {
    console.error(commentError)
    error.value = t('decisions.comment_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const voteDecision = async (decisionId: string, voteValue: DecisionVoteValue) => {
  activeDecisionId.value = decisionId
  decisionAction.value = voteValue === 'APPROVE' ? 'vote-approve' : 'vote-reject'
  try {
    const { data } = await DecisionService.vote(decisionId, voteValue)
    persistedDecisions.value = persistedDecisions.value.map((decision) =>
      decision.id === decisionId ? data : decision
    )
  } catch (voteError) {
    console.error(voteError)
    error.value = t('decisions.vote_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const clearDecisionVote = async (decisionId: string) => {
  activeDecisionId.value = decisionId
  decisionAction.value = 'vote-clear'
  try {
    const { data } = await DecisionService.removeVote(decisionId)
    persistedDecisions.value = persistedDecisions.value.map((decision) =>
      decision.id === decisionId ? data : decision
    )
  } catch (voteError) {
    console.error(voteError)
    error.value = t('decisions.vote_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

watch(
  () => route.query.scenarios,
  async () => {
    await loadDecisionCards()
  }
)

onMounted(async () => {
  await loadDecisionCards()
})
</script>

<style scoped>
.decisions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .decisions-page {
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
  display: grid;
  gap: 18px;
}

.decisions-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.decisions-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.decisions-note {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
  max-width: 720px;
}

.decisions-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.decision-card {
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.12);
  display: grid;
  gap: 14px;
}

.v-theme--dark .decision-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
}

.decision-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.decision-card__title-wrap {
  display: grid;
  gap: 4px;
}

.decision-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .decision-card__title {
  color: #ffffff;
}

.decision-card__scenario {
  margin: 0;
  color: #667085;
  font-size: 0.9rem;
}

.decision-card__description {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.v-theme--dark .decision-card__description,
.v-theme--dark .decision-card__scenario {
  color: #cbd5e1;
}

.decision-card__metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.decision-metric {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-metric span {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.decision-metric strong {
  color: #0f172a;
  font-size: 1rem;
}

.decision-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #4a4a4a;
}

.decision-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.decision-votes {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-votes__summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: #475569;
  font-size: 0.9rem;
}

.decision-votes__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.decision-votes__current {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.decision-comments {
  display: grid;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.decision-comments__header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #475569;
  font-size: 0.9rem;
}

.decision-comments__list {
  display: grid;
  gap: 8px;
}

.decision-comment {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-comment p,
.decision-comment span,
.decision-comments__empty {
  margin: 0;
  color: #475569;
}

.decision-comment span {
  font-size: 0.82rem;
  color: #64748b;
}

.decision-comments__composer {
  display: grid;
  gap: 10px;
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
  .decisions-toolbar {
    flex-direction: column;
  }

  .decisions-toolbar__actions {
    justify-content: flex-start;
  }

  .decision-card__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
