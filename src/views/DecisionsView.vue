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
              <v-btn color="#4f46e5" @click="newDecisionFromScenario">
                <v-icon start>mdi-plus-circle-outline</v-icon>
                {{ $t('decisions.new_from_scenario') }}
              </v-btn>
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

          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="comfortable"
            closable
            @click:close="successMessage = ''"
          >
            {{ successMessage }}
          </v-alert>

          <div v-else-if="decisionCards.length" class="decisions-grid">
            <div v-for="decision in decisionCards" :key="decision.scenarioId" class="decision-card">
              <div class="decision-card__header">
                <div class="decision-card__title-wrap">
                  <h3 class="decision-card__title">{{ decision.title }}</h3>
                  <p class="decision-card__scenario">{{ decision.scenarioLabel }}</p>
                </div>
                <v-chip size="small" variant="tonal" :color="decision.statusColor" class="decision-status-chip">
                  {{ decision.status }}
                </v-chip>
              </div>

              <div class="decision-impact">
                <div class="decision-impact__label">{{ $t('decisions.impact_title') }}</div>
                <div class="decision-impact__value" :class="decision.impactTone">
                  {{ decision.impactDisplay }}
                </div>
                <div class="decision-impact__subtitle">{{ $t('decisions.impact_cashflow_subtitle') }}</div>
                <div class="decision-impact__details">
                  <span>{{ $t('decisions.final_balance_label') }}: <strong>{{ formatCurrency(decision.finalBalance) }}</strong></span>
                  <span>{{ $t('decisions.risk_month_label') }}: <strong>{{ decision.riskMonth }}</strong></span>
                </div>
              </div>

              <p class="decision-card__description">{{ decision.consequenceMessage }}</p>

              <div class="decision-votes decision-votes--featured" v-if="decision.decisionId">
                <div class="decision-votes__summary">
                  <strong>{{ $t('decisions.team_decision_title') }}</strong>
                  <span>{{ $t('decisions.votes_breakdown', { approve: decision.approveVotes, reject: decision.rejectVotes }) }}</span>
                </div>
                <p v-if="decision.approveVotes + decision.rejectVotes === 0" class="decision-votes__hint">
                  {{ $t('decisions.no_votes_hint') }}
                </p>
                <div class="decision-votes__actions">
                  <v-btn
                    variant="tonal"
                    size="small"
                    :color="decision.currentUserVote === 'APPROVE' ? 'success' : undefined"
                    :disabled="!decision.isOpenDecision"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-approve'"
                    class="decision-vote-btn"
                    @click="openVoteDialog(decision.decisionId, 'APPROVE')"
                  >
                    <v-icon start size="18">mdi-thumb-up-outline</v-icon>
                    {{ $t('decisions.vote_approve') }}
                  </v-btn>
                  <v-btn
                    variant="tonal"
                    size="small"
                    :color="decision.currentUserVote === 'REJECT' ? 'error' : undefined"
                    :disabled="!decision.isOpenDecision"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-reject'"
                    class="decision-vote-btn"
                    @click="openVoteDialog(decision.decisionId, 'REJECT')"
                  >
                    <v-icon start size="18">mdi-thumb-down-outline</v-icon>
                    {{ $t('decisions.vote_reject') }}
                  </v-btn>
                  <v-btn
                    v-if="decision.currentUserVote"
                    variant="text"
                    size="small"
                    color="#667eea"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-clear'"
                    @click="clearDecisionVote(decision.decisionId)"
                  >
                    <v-icon start size="16">mdi-close-circle-outline</v-icon>
                    {{ $t('decisions.vote_clear') }}
                  </v-btn>
                </div>
                <p v-if="decision.currentUserVote" class="decision-votes__current">
                  {{ $t('decisions.vote_current', { vote: decision.currentUserVote === 'APPROVE' ? $t('decisions.vote_approve') : $t('decisions.vote_reject') }) }}
                </p>
              </div>

              <div v-if="decision.decisionId" class="decision-reasoning">
                <div class="decision-reasoning__header">
                  <strong>{{ $t('decisions.team_reasoning_title') }}</strong>
                  <span>{{ $t('decisions.reasoning_summary', { approve: decision.approveVotes, reject: decision.rejectVotes }) }}</span>
                </div>
                <p v-if="!decision.teamReasoning.length" class="decision-reasoning__empty">
                  {{ $t('decisions.no_reasoning') }}
                </p>
                <div v-else class="decision-reasoning__groups">
                  <div v-if="decision.approvalReasoning.length" class="decision-reasoning__group">
                    <p class="decision-reasoning__group-title">{{ $t('decisions.reasoning_approvals') }}</p>
                    <div v-for="vote in decision.approvalReasoning" :key="vote.id" class="decision-reasoning__item">
                      <p class="decision-reasoning__line">
                        <span class="decision-reasoning__vote decision-reasoning__vote--approve">✔</span>
                        <strong>{{ vote.userLabel }}</strong>
                        <span v-if="vote.justification">: "{{ vote.preview }}"</span>
                        <span v-else> {{ $t('decisions.reasoning_voted_approve') }}</span>
                      </p>
                      <button
                        v-if="vote.shouldTruncate"
                        type="button"
                        class="decision-reasoning__toggle"
                        @click="toggleJustification(vote.id)"
                      >
                        {{ vote.isExpanded ? $t('decisions.show_less') : $t('decisions.show_more') }}
                      </button>
                    </div>
                  </div>
                  <div v-if="decision.rejectionReasoning.length" class="decision-reasoning__group">
                    <p class="decision-reasoning__group-title">{{ $t('decisions.reasoning_rejections') }}</p>
                    <div v-for="vote in decision.rejectionReasoning" :key="vote.id" class="decision-reasoning__item">
                      <p class="decision-reasoning__line">
                        <span class="decision-reasoning__vote decision-reasoning__vote--reject">✖</span>
                        <strong>{{ vote.userLabel }}</strong>
                        <span v-if="vote.justification">: "{{ vote.preview }}"</span>
                        <span v-else> {{ $t('decisions.reasoning_voted_reject') }}</span>
                      </p>
                      <button
                        v-if="vote.shouldTruncate"
                        type="button"
                        class="decision-reasoning__toggle"
                        @click="toggleJustification(vote.id)"
                      >
                        {{ vote.isExpanded ? $t('decisions.show_less') : $t('decisions.show_more') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

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
                <span>{{ decision.goalsImpact }}</span>
                <span v-if="decision.persistedAt">{{ decision.persistedAt }}</span>
              </div>

              <div class="decision-card__actions">
                <template v-if="!decision.decisionId">
                  <v-btn
                    variant="tonal"
                    color="#667eea"
                    size="large"
                    :loading="activeDecisionId === decision.scenarioId && decisionAction === 'create'"
                    @click="trackDecision(decision.scenarioId)"
                  >
                    <v-icon start>mdi-bookmark-plus-outline</v-icon>
                    {{ $t('decisions.track_decision') }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-tooltip
                    v-if="decision.isOpenDecision && !decision.canApply"
                    :text="$t('decisions.not_enough_approvals')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <span v-bind="props">
                        <v-btn
                          variant="flat"
                          color="success"
                          size="x-large"
                          class="decision-card__execute-btn"
                          disabled
                        >
                          <v-icon start>mdi-flash-outline</v-icon>
                          {{ $t('decisions.execute_decision') }}
                        </v-btn>
                      </span>
                    </template>
                  </v-tooltip>
                  <v-btn
                    v-else-if="decision.isOpenDecision"
                    variant="flat"
                    color="success"
                    size="x-large"
                    class="decision-card__execute-btn"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'apply'"
                    @click="applyDecision(decision.decisionId)"
                  >
                    <v-icon start>mdi-flash-outline</v-icon>
                    {{ $t('decisions.execute_decision') }}
                  </v-btn>
                </template>
                <div class="decision-card__secondary-actions">
                  <v-btn
                    v-if="decision.decisionId"
                    variant="text"
                    size="small"
                    color="#0ea5e9"
                    @click="copyPublicDecisionLink(decision.decisionId)"
                  >
                    <v-icon start size="16">mdi-link-variant</v-icon>
                    Copy public link
                  </v-btn>
                  <v-btn
                    v-if="decision.isOpenDecision"
                    variant="outlined"
                    size="small"
                    color="error"
                    :loading="activeDecisionId === decision.decisionId && decisionAction === 'reject'"
                    @click="updateDecisionStatus(decision.decisionId || '', 'REJECTED')"
                  >
                    <v-icon start size="16">mdi-close</v-icon>
                    {{ $t('decisions.reject_action') }}
                  </v-btn>
                  <v-btn variant="text" size="small" color="#667eea" @click="openScenario(decision.scenarioId)">
                    <v-icon start size="16">mdi-pencil-outline</v-icon>
                    {{ $t('decisions.open_scenario') }}
                  </v-btn>
                  <v-btn variant="text" size="small" color="#667eea" @click="viewImpact">
                    <v-icon start size="16">mdi-chart-line</v-icon>
                    {{ $t('decisions.view_impact') }}
                  </v-btn>
                </div>
              </div>

              <div v-if="decision.decisionId" class="decision-comments">
                <v-expansion-panels variant="accordion" class="decision-discussion">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <div class="decision-comments__header">
                        <strong>{{ $t('decisions.team_discussion_title') }}</strong>
                        <span>{{ $t('decisions.comments_count_label', { count: decision.comments.length }) }}</span>
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-if="decision.comments.length" class="decision-comments__list">
                        <div
                          v-for="comment in decision.comments"
                          :key="comment.id"
                          class="decision-comment"
                        >
                          <div class="decision-comment__avatar">{{ comment.initials }}</div>
                          <div class="decision-comment__content">
                            <p>{{ comment.body }}</p>
                            <span v-if="comment.createdAt">{{ comment.authorLabel }} • {{ formatDate(comment.createdAt) }}</span>
                          </div>
                        </div>
                      </div>
                      <p v-else class="decision-comments__empty">
                        {{ $t('decisions.no_comments_hint') }}
                      </p>

                      <div class="decision-comments__composer">
                        <v-text-field
                          v-model="commentDrafts[decision.decisionId]"
                          :label="$t('decisions.add_comment_placeholder')"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          :disabled="!decision.isOpenDecision"
                          @keyup.enter="addDecisionComment(decision.decisionId)"
                        />
                        <v-btn
                          color="#667eea"
                          variant="tonal"
                          :disabled="!commentDrafts[decision.decisionId]?.trim() || !decision.isOpenDecision"
                          :loading="activeDecisionId === decision.decisionId && decisionAction === 'comment'"
                          @click="addDecisionComment(decision.decisionId)"
                        >
                          <v-icon start>mdi-comment-plus-outline</v-icon>
                          {{ $t('decisions.add_comment') }}
                        </v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
                <p v-if="!decision.isOpenDecision" class="decision-comments__hint">
                  {{ $t('decisions.discussion_closed_hint') }}
                </p>
              </div>
              <div v-if="decision.decisionId && decision.isOpenDecision && !decision.canApply" class="decision-apply-hint">
                <v-icon size="16" color="#ef4444">mdi-information-outline</v-icon>
                <span>{{ decision.applyBlockedReason || $t('decisions.not_enough_approvals') }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <v-icon color="#94a3b8" size="28">mdi-lightbulb-auto-outline</v-icon>
            <p>{{ $t('decisions.empty') }}</p>
            <v-btn color="#667eea" variant="tonal" @click="goToScenarios">
              <v-icon start>mdi-layers-triple-outline</v-icon>
              {{ $t('decisions.empty_cta') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>

    <v-dialog v-model="voteDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{ $t('decisions.vote_dialog_title') }}</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="voteDialog.justification"
            :label="$t('decisions.vote_dialog_placeholder')"
            variant="outlined"
            counter="500"
            maxlength="500"
            auto-grow
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeVoteDialog">{{ $t('decisions.cancel') }}</v-btn>
          <v-btn
            color="#4f46e5"
            variant="flat"
            :loading="Boolean(voteDialog.decisionId) && activeDecisionId === voteDialog.decisionId && (decisionAction === 'vote-approve' || decisionAction === 'vote-reject')"
            @click="submitVoteFromDialog"
          >
            {{ $t('decisions.submit_vote') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario, type ScenarioDeltaType, type ScenarioSimulationResponse } from '@/services/ScenarioService'
import DecisionService, { type DecisionComment, type DecisionVote, type DecisionVoteValue, type PersistedDecision, type PersistedDecisionStatus } from '@/services/DecisionService'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const DECISIONS_STORAGE_KEY = 'decisions-scenarios'

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const activeDecisionId = ref<string | null>(null)
const decisionAction = ref<'create' | 'apply' | 'reject' | 'comment' | 'vote-approve' | 'vote-reject' | 'vote-clear' | null>(null)
const savedScenarios = ref<SavedScenario[]>([])
const selectedScenarioIds = ref<string[]>([])
const simulations = ref<Array<{ scenario: SavedScenario; result: ScenarioSimulationResponse }>>([])
const persistedDecisions = ref<PersistedDecision[]>([])
const commentDrafts = ref<Record<string, string>>({})
const expandedJustifications = ref<Record<string, boolean>>({})
const voteDialog = ref<{
  open: boolean
  decisionId: string | null
  voteValue: DecisionVoteValue | null
  justification: string
}>({
  open: false,
  decisionId: null,
  voteValue: null,
  justification: '',
})

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const formatSignedCurrency = (value: number) => {
  const formatted = formatCurrency(Math.abs(Number(value || 0)))
  const compact = formatted.replace(/\s+/g, '')
  return `${Number(value || 0) >= 0 ? '+' : '-'}${compact}`
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(
        locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR'
      )
    : ''

const getCommentInitials = (authorId?: string) => {
  const label = String(authorId || '').trim()
  if (!label) return 'U'
  return label.slice(0, 2).toUpperCase()
}

const getVotePreview = (vote: DecisionVote) => {
  const fullText = String(vote.justification || '').trim()
  const isExpanded = Boolean(expandedJustifications.value[vote.id])
  const shouldTruncate = fullText.length > 140
  const preview = shouldTruncate && !isExpanded ? `${fullText.slice(0, 140)}...` : fullText
  return { fullText, preview, isExpanded, shouldTruncate }
}

const getSavedScenarioPayload = (scenario: SavedScenario) => ({
  id: scenario.id,
  budgetId: scenario.budgetId,
  name: scenario.name,
  months: scenario.months || 6,
  deltas: [
    ...(scenario.deltas || []).map((delta) => ({
      label: delta.label,
      type: delta.type,
      amount: Number(delta.amount || 0),
      startMonthOffset: Number(delta.startMonthOffset || 0),
    })),
    ...((scenario.lines || [])
      .map((line) => {
        const delta = Number(line.adjustedAmount || 0) - Number(line.originalAmount || 0)
        if (!delta) return null
        if (line.type === 'INCOME') {
          return {
            label: `Baseline adjustment: ${line.category}`,
            type: (delta > 0 ? 'MONTHLY_INCOME' : 'MONTHLY_EXPENSE') as ScenarioDeltaType,
            amount: Math.abs(delta),
            startMonthOffset: 0,
          }
        }
        return {
          label: `Baseline adjustment: ${line.category}`,
          type: (delta > 0 ? 'MONTHLY_EXPENSE' : 'MONTHLY_INCOME') as ScenarioDeltaType,
          amount: Math.abs(delta),
          startMonthOffset: 0,
        }
      })
      .filter((item): item is { label: string; type: ScenarioDeltaType; amount: number; startMonthOffset: number } => Boolean(item))),
  ],
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
  if (persistedStatus === 'OPEN') return 'info'
  if (scenarioStatus === 'ACTION_NEEDED') return 'error'
  if (scenarioStatus === 'WATCH') return 'warning'
  if (scenarioStatus === 'STABLE') return 'info'
  return 'default'
}

const decisionCards = computed(() =>
  simulations.value.map(({ scenario, result }) => {
    const persisted = persistedDecisions.value.find((decision) => decision.scenarioId === scenario.id)
    const teamReasoning = (persisted?.votes || []).map((vote) => {
      const previewData = getVotePreview(vote)
      return {
        ...vote,
        userLabel: t('decisions.user_label', { id: String(vote.userId || '').slice(0, 8) }),
        justification: previewData.fullText,
        preview: previewData.preview,
        isExpanded: previewData.isExpanded,
        shouldTruncate: previewData.shouldTruncate,
      }
    })
    const approvalReasoning = teamReasoning.filter((vote) => vote.voteValue === 'APPROVE')
    const rejectionReasoning = teamReasoning.filter((vote) => vote.voteValue === 'REJECT')
    return {
      scenarioId: scenario.id,
      decisionId: persisted?.id || null,
      title: scenario.name,
      scenarioLabel: t('decisions.scenario_label', { name: scenario.name }),
      status: statusLabel(result.decisionStatus, persisted?.status),
      persistedStatus: persisted?.status || null,
      statusColor: statusColor(result.decisionStatus, persisted?.status),
      consequenceMessage: result.scenarioMonthlyImpact < 0
        ? t('decisions.consequence_negative', { month: result.firstRiskMonth || t('decisions.no_risk_month') })
        : result.scenarioMonthlyImpact > 0
          ? t('decisions.consequence_positive')
          : t('decisions.consequence_neutral'),
      finalBalance: result.projectedFinalBalance,
      availableForGoals: result.availableForGoals,
      riskMonth: result.firstRiskMonth || t('decisions.no_risk_month'),
      impactDisplay: formatSignedCurrency(result.scenarioMonthlyImpact),
      impactTone: result.scenarioMonthlyImpact > 0 ? 'decision-impact--positive' : result.scenarioMonthlyImpact < 0 ? 'decision-impact--negative' : 'decision-impact--neutral',
      goalsImpact: t('decisions.goals_impact_label', { count: result.impactedGoalsCount }),
      persistedAt: persisted?.createdAt ? t('decisions.created_at_label', { date: new Date(persisted.createdAt).toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR') }) : '',
      comments: (persisted?.comments || []).map((comment) => ({
        ...comment,
        initials: getCommentInitials(comment.authorId),
        authorLabel: t('decisions.user_label', { id: String(comment.authorId || '').slice(0, 8) }),
      })),
      approveVotes: persisted?.approveVotes || 0,
      rejectVotes: persisted?.rejectVotes || 0,
      voteSummaryText: t('decisions.votes_breakdown', { approve: persisted?.approveVotes || 0, reject: persisted?.rejectVotes || 0 }),
      currentUserVote: persisted?.currentUserVote || null,
      currentUserVoteJustification: persisted?.currentUserVoteJustification || null,
      teamReasoning,
      approvalReasoning,
      rejectionReasoning,
      isOpenDecision: persisted?.status === 'OPEN',
      canApply: Boolean(persisted?.canCurrentUserApply),
      applyBlockedReason: persisted?.applyBlockedReason || null,
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
    await loadPersistedDecisions()

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

const loadPersistedDecisions = async () => {
  const decisionsResponse = await DecisionService.list()
  persistedDecisions.value = Array.isArray(decisionsResponse.data) ? decisionsResponse.data : []
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

const viewImpact = async () => {
  await router.push({ path: '/dashboard', query: { refresh: String(Date.now()) } })
}

const newDecisionFromScenario = async () => {
  const preferredScenario =
    simulations.value.find((entry) => selectedScenarioIds.value.includes(entry.scenario.id))?.scenario ||
    simulations.value[0]?.scenario

  if (!preferredScenario?.id) {
    await goToScenarios()
    return
  }

  await trackDecision(preferredScenario.id)
}

const trackDecision = async (scenarioId: string) => {
  activeDecisionId.value = scenarioId
  decisionAction.value = 'create'
  successMessage.value = ''
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
  decisionAction.value = status === 'REJECTED' ? 'reject' : null
  successMessage.value = ''
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

const applyDecision = async (decisionId: string) => {
  activeDecisionId.value = decisionId
  decisionAction.value = 'apply'
  successMessage.value = ''
  try {
    const { data } = await DecisionService.applyDecision(decisionId)
    persistedDecisions.value = persistedDecisions.value.map((decision) =>
      decision.id === decisionId
        ? { ...decision, status: data.status, appliedAt: data.appliedAt }
        : decision
    )
    successMessage.value = t('decisions.decision_applied_success', { net: formatCurrency(data.updatedBudget?.net || 0) })
  } catch (applyError) {
    console.error(applyError)
    error.value = t('decisions.persist_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const copyPublicDecisionLink = async (decisionId: string) => {
  const publicUrl = `${window.location.origin}/decision/${decisionId}/public`
  try {
    await navigator.clipboard.writeText(publicUrl)
    successMessage.value = 'Public link copied'
  } catch (copyError) {
    try {
      const input = document.createElement('input')
      input.value = publicUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      successMessage.value = 'Public link copied'
    } catch (fallbackError) {
      console.error(copyError, fallbackError)
      error.value = 'Could not copy public link'
    }
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

const voteDecision = async (decisionId: string, voteValue: DecisionVoteValue, justification?: string | null) => {
  activeDecisionId.value = decisionId
  decisionAction.value = voteValue === 'APPROVE' ? 'vote-approve' : 'vote-reject'
  try {
    await DecisionService.vote(decisionId, voteValue, justification)
    await loadPersistedDecisions()
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
    await DecisionService.removeVote(decisionId)
    await loadPersistedDecisions()
  } catch (voteError) {
    console.error(voteError)
    error.value = t('decisions.vote_error')
  } finally {
    activeDecisionId.value = null
    decisionAction.value = null
  }
}

const openVoteDialog = (decisionId: string, voteValue: DecisionVoteValue) => {
  voteDialog.value.open = true
  voteDialog.value.decisionId = decisionId
  voteDialog.value.voteValue = voteValue
  voteDialog.value.justification = ''
}

const closeVoteDialog = () => {
  voteDialog.value.open = false
  voteDialog.value.decisionId = null
  voteDialog.value.voteValue = null
  voteDialog.value.justification = ''
}

const submitVoteFromDialog = async () => {
  const decisionId = voteDialog.value.decisionId
  const voteValue = voteDialog.value.voteValue
  if (!decisionId || !voteValue) {
    return
  }
  const justification = voteDialog.value.justification.trim()
  await voteDecision(decisionId, voteValue, justification || undefined)
  closeVoteDialog()
}

const toggleJustification = (voteId: string) => {
  expandedJustifications.value[voteId] = !expandedJustifications.value[voteId]
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
  padding: 20px;
  background: rgba(102, 126, 234, 0.04);
  border: 1px solid rgba(102, 126, 234, 0.14);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 16px;
}

.v-theme--dark .decision-card {
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
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

.decision-impact {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.decision-impact__label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.decision-impact__value {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 800;
  line-height: 1;
}

.decision-impact__subtitle {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

.decision-impact__details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: #475569;
  font-size: 0.88rem;
}

.decision-impact__details strong {
  color: #0f172a;
}

.decision-impact--positive {
  color: #15803d;
}

.decision-impact--negative {
  color: #dc2626;
}

.decision-impact--neutral {
  color: #64748b;
}

.v-theme--dark .decision-impact {
  background: rgba(15, 23, 42, 0.35);
  border-color: rgba(148, 163, 184, 0.14);
}

.v-theme--dark .decision-impact__details strong {
  color: #ffffff;
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
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.decision-card__execute-btn {
  width: 100%;
  justify-content: flex-start;
  min-height: 52px;
  font-size: 1rem;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.18);
}

.decision-card__secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.decision-status-chip {
  font-weight: 700;
}

.decision-votes {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-votes--featured {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(102, 126, 234, 0.18);
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

.decision-vote-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.decision-vote-btn:hover {
  transform: translateY(-1px);
}

.decision-votes__hint {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.decision-votes__current {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.decision-reasoning {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-reasoning__header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  color: #475569;
  font-size: 0.9rem;
}

.decision-reasoning__empty {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.decision-reasoning__groups {
  display: grid;
  gap: 10px;
}

.decision-reasoning__group {
  display: grid;
  gap: 6px;
}

.decision-reasoning__group-title {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  font-weight: 700;
}

.decision-reasoning__item {
  display: grid;
  gap: 4px;
}

.decision-reasoning__line {
  margin: 0;
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.4;
}

.decision-reasoning__vote {
  display: inline-block;
  width: 14px;
  margin-right: 2px;
  font-weight: 700;
}

.decision-reasoning__vote--approve {
  color: #15803d;
}

.decision-reasoning__vote--reject {
  color: #dc2626;
}

.decision-reasoning__toggle {
  width: fit-content;
  border: 0;
  background: transparent;
  color: #4f46e5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.decision-comments {
  display: grid;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.decision-discussion {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
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
  grid-template-columns: 36px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.decision-comment__avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
  font-size: 0.78rem;
  font-weight: 700;
}

.decision-comment__content {
  display: grid;
  gap: 4px;
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

.decision-comments__hint,
.decision-apply-hint {
  margin: 0;
  display: flex;
  gap: 6px;
  align-items: center;
  color: #b91c1c;
  font-size: 0.85rem;
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

  .decision-card__actions {
    align-items: stretch;
  }

  .decision-card__secondary-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
