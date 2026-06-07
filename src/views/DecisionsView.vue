<template>
  <div class="cb-page">
    <div class="cb-container">

      <!-- Page Header -->
      <page-header :title="t('decisions.title')" :summary-items="decisionSummaryItems" />

      <!-- Success alert -->
      <alert-strip
        v-if="successMessage"
        variant="positive"
        :title="successMessage"
      >
        <template #actions>
          <v-btn size="x-small" variant="text" color="var(--cb-positive)" style="text-transform:none" @click="successMessage = ''">
            {{ t('common.close') }}
          </v-btn>
        </template>
      </alert-strip>

      <!-- Filter bar -->
      <div class="cb-filter-bar" style="margin-bottom:20px">
        <div class="cb-filter-chips">
          <button
            class="cb-chip"
            :class="{ 'cb-chip--active': decisionFilter === 'open' }"
            @click="decisionFilter = 'open'"
          >
            <v-icon size="12" start>mdi-clock-outline</v-icon>
            {{ t('decisions.filter_open', { count: openDecisionCount }) }}
          </button>
          <button
            class="cb-chip"
            :class="{ 'cb-chip--active': decisionFilter === 'withDecision' }"
            @click="decisionFilter = 'withDecision'"
          >
            <v-icon size="12" start>mdi-vote-outline</v-icon>
            {{ t('decisions.filter_with_decision', { count: withDecisionCount }) }}
          </button>
          <button
            class="cb-chip"
            :class="{ 'cb-chip--active': decisionFilter === 'closed' }"
            @click="decisionFilter = 'closed'"
          >
            <v-icon size="12" start>mdi-check-circle-outline</v-icon>
            {{ t('decisions.filter_closed', { count: closedDecisionCount }) }}
          </button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <v-btn size="small" class="cb-btn-primary" @click="openDecisionCreationDialog">
            <v-icon start size="14">mdi-plus-circle-outline</v-icon>
            {{ t('decisions.new_from_scenario') }}
          </v-btn>
          <v-btn size="small" variant="text" color="var(--cb-ink-secondary)" style="text-transform:none" @click="goToScenarios">
            <v-icon start size="14">mdi-arrow-left</v-icon>
            {{ t('decisions.back_to_scenarios') }}
          </v-btn>
          <v-btn
            v-if="selectedScenarioIds.length"
            size="small"
            variant="tonal"
            color="var(--cb-accent)"
            style="text-transform:none"
            @click="reviewSelectedScenario"
          >
            <v-icon start size="14">mdi-chart-timeline-variant</v-icon>
            {{ t('decisions.review_in_scenarios') }}
          </v-btn>
          <v-btn
            v-if="selectedScenarioIds.length"
            size="small"
            variant="text"
            color="var(--cb-accent)"
            style="text-transform:none"
            @click="goToInsights"
          >
            <v-icon start size="14">mdi-brain</v-icon>
            {{ t('decisions.open_in_insights') }}
          </v-btn>
        </div>
      </div>

      <!-- Loading / Error states -->
      <div v-if="isLoading" style="padding:48px;text-align:center">
        <v-progress-circular indeterminate color="var(--cb-primary)" size="32" />
      </div>
      <div v-else-if="error" style="padding:48px;text-align:center">
        <v-icon color="var(--cb-risk)" size="32" style="display:block;margin:0 auto 12px">mdi-alert-circle-outline</v-icon>
        <p style="color:var(--cb-ink-muted)">{{ error }}</p>
      </div>

      <!-- Decision Cards -->
      <template v-else-if="filteredDecisionCards.length">
        <!-- Source note -->
        <p v-if="decisionsSourceNote" style="font-size:.8rem;color:var(--cb-ink-muted);margin-bottom:16px">{{ decisionsSourceNote }}</p>

        <div class="cb-decisions-list">
          <div
            v-for="decision in filteredDecisionCards"
            :key="decision.scenarioId"
            class="cb-decision-card"
            :class="decisionFilter === 'open' ? 'cb-decision-card--open' : ''"
          >
            <!-- Card header -->
            <div class="cb-decision-card__head">
              <div>
                <h3 class="cb-decision-card__title">{{ decision.title }}</h3>
                <p class="cb-decision-card__scenario">{{ decision.scenarioLabel }}</p>
              </div>
              <v-chip size="small" variant="tonal" :color="decision.statusColor">
                {{ decision.status }}
              </v-chip>
            </div>

            <!-- Impact strip -->
            <div class="cb-decision-card__impact">
              <span class="cb-decision-card__impact-label">{{ t('decisions.impact_title') }}</span>
              <span class="cb-decision-card__impact-value" :class="decision.impactTone">{{ decision.impactDisplay }}</span>
              <span class="cb-decision-card__impact-meta">{{ t('decisions.impact_cashflow_subtitle') }}</span>
              <span>{{ t('decisions.final_balance_label') }}: <strong>{{ formatCurrency(decision.finalBalance) }}</strong></span>
              <span>{{ t('decisions.risk_month_label') }}: <strong>{{ decision.riskMonth }}</strong></span>
            </div>

            <p class="cb-decision-card__consequence">{{ decision.consequenceMessage }}</p>

            <!-- Voting section -->
            <div v-if="decision.decisionId" class="cb-decision-card__votes">
              <div class="cb-decision-card__votes-header">
                <strong>{{ t('decisions.team_decision_title') }}</strong>
                <span style="font-size:.8rem;color:var(--cb-ink-muted)">{{ t('decisions.votes_breakdown', { approve: decision.approveVotes, reject: decision.rejectVotes }) }}</span>
              </div>
              <v-alert
                v-if="!canUseCollaboration"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
                  <span>{{ t('decisions.collaboration_locked') }}</span>
                  <v-btn size="x-small" variant="tonal" color="var(--cb-accent)" @click="goToChoosePlan">
                    <v-icon start size="14">mdi-lock-open-outline</v-icon>
                    {{ t('decisions.collaboration_locked_cta') }}
                  </v-btn>
                </div>
              </v-alert>
              <p v-if="decision.approveVotes + decision.rejectVotes === 0" style="font-size:.8rem;color:var(--cb-ink-muted);margin:4px 0 8px">{{ t('decisions.no_votes_hint') }}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <v-btn
                  variant="tonal"
                  size="small"
                  :color="decision.currentUserVote === 'APPROVE' ? 'success' : undefined"
                  :disabled="!decision.isOpenDecision || !canUseCollaboration"
                  :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-approve'"
                  @click="openVoteDialog(decision.decisionId, 'APPROVE')"
                >
                  <v-icon start size="16">mdi-thumb-up-outline</v-icon>
                  {{ t('decisions.vote_approve') }}
                </v-btn>
                <v-btn
                  variant="tonal"
                  size="small"
                  :color="decision.currentUserVote === 'REJECT' ? 'error' : undefined"
                  :disabled="!decision.isOpenDecision || !canUseCollaboration"
                  :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-reject'"
                  @click="openVoteDialog(decision.decisionId, 'REJECT')"
                >
                  <v-icon start size="16">mdi-thumb-down-outline</v-icon>
                  {{ t('decisions.vote_reject') }}
                </v-btn>
                <v-btn
                  v-if="decision.currentUserVote"
                  variant="text"
                  size="small"
                  color="var(--cb-ink-muted)"
                  :disabled="!canUseCollaboration"
                  :loading="activeDecisionId === decision.decisionId && decisionAction === 'vote-clear'"
                  @click="clearDecisionVote(decision.decisionId)"
                >
                  <v-icon start size="14">mdi-close-circle-outline</v-icon>
                  {{ t('decisions.vote_clear') }}
                </v-btn>
                <span v-if="decision.currentUserVote" style="font-size:.75rem;color:var(--cb-accent);font-weight:600">
                  {{ t('decisions.vote_current', { vote: decision.currentUserVote === 'APPROVE' ? t('decisions.vote_approve') : t('decisions.vote_reject') }) }}
                </span>
              </div>
            </div>

            <!-- Reasoning -->
            <div v-if="decision.decisionId && decision.teamReasoning?.length" class="cb-decision-card__reasoning">
              <div v-if="decision.approvalReasoning.length">
                <p class="cb-decision-card__reasoning-group">{{ t('decisions.reasoning_approvals') }}</p>
                <div v-for="vote in decision.approvalReasoning" :key="vote.id" class="cb-decision-card__reasoning-item">
                  <span class="decision-reasoning__vote decision-reasoning__vote--approve">✔</span>
                  <strong>{{ vote.userLabel }}</strong>
                  <span v-if="vote.justification">: "{{ vote.preview }}"</span>
                  <span v-else> {{ t('decisions.reasoning_voted_approve') }}</span>
                  <button v-if="vote.shouldTruncate" type="button" class="decision-reasoning__toggle" @click="toggleJustification(vote.id)">
                    {{ vote.isExpanded ? t('decisions.show_less') : t('decisions.show_more') }}
                  </button>
                </div>
              </div>
              <div v-if="decision.rejectionReasoning.length">
                <p class="cb-decision-card__reasoning-group">{{ t('decisions.reasoning_rejections') }}</p>
                <div v-for="vote in decision.rejectionReasoning" :key="vote.id" class="cb-decision-card__reasoning-item">
                  <span class="decision-reasoning__vote decision-reasoning__vote--reject">✖</span>
                  <strong>{{ vote.userLabel }}</strong>
                  <span v-if="vote.justification">: "{{ vote.preview }}"</span>
                  <span v-else> {{ t('decisions.reasoning_voted_reject') }}</span>
                  <button v-if="vote.shouldTruncate" type="button" class="decision-reasoning__toggle" @click="toggleJustification(vote.id)">
                    {{ vote.isExpanded ? t('decisions.show_less') : t('decisions.show_more') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="cb-decision-card__metrics">
              <div class="cb-decision-card__metric">
                <span>{{ t('decisions.final_balance') }}</span>
                <strong>{{ formatCurrency(decision.finalBalance) }}</strong>
              </div>
              <div class="cb-decision-card__metric">
                <span>{{ t('decisions.available_for_goals') }}</span>
                <strong>{{ formatCurrency(decision.availableForGoals) }}</strong>
              </div>
              <div class="cb-decision-card__metric">
                <span>{{ t('decisions.risk_month') }}</span>
                <strong>{{ decision.riskMonth }}</strong>
              </div>
            </div>

            <div class="cb-decision-card__meta-row">
              <span>{{ decision.goalsImpact }}</span>
              <span v-if="decision.persistedAt" style="color:var(--cb-ink-muted);font-size:.75rem">{{ decision.persistedAt }}</span>
            </div>

            <!-- Primary Actions -->
            <div class="cb-decision-card__actions">
              <template v-if="!decision.decisionId">
                <v-btn
                  class="cb-btn-accent"
                  size="large"
                  :loading="activeDecisionId === decision.scenarioId && decisionAction === 'create'"
                  @click="trackDecision(decision.scenarioId)"
                >
                  <v-icon start size="16">mdi-bookmark-plus-outline</v-icon>
                  {{ t('decisions.track_decision') }}
                </v-btn>
              </template>
              <template v-else>
                <v-tooltip
                  v-if="decision.isOpenDecision && (!decision.canApply || !canUseCollaboration)"
                  :text="canUseCollaboration ? t('decisions.not_enough_approvals') : t('decisions.collaboration_locked')"
                  location="top"
                >
                  <template #activator="{ props }">
                    <span v-bind="props">
                      <v-btn variant="flat" color="success" size="large" disabled>
                        <v-icon start>mdi-flash-outline</v-icon>
                        {{ t('decisions.execute_decision') }}
                      </v-btn>
                    </span>
                  </template>
                </v-tooltip>
                <v-btn
                  v-else-if="decision.isOpenDecision"
                  variant="flat"
                  color="success"
                  size="large"
                  :loading="activeDecisionId === decision.decisionId && decisionAction === 'apply'"
                  @click="applyDecision(decision.decisionId)"
                >
                  <v-icon start>mdi-flash-outline</v-icon>
                  {{ t('decisions.execute_decision') }}
                </v-btn>
              </template>

              <!-- Secondary actions row -->
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                <v-btn v-if="decision.decisionId" variant="text" size="small" color="var(--cb-accent)" style="text-transform:none" @click="copyPublicDecisionLink(decision.decisionId)">
                  <v-icon start size="14">mdi-link-variant</v-icon>
                  {{ t('decisions.copy_public_link') }}
                </v-btn>
                <v-btn v-if="decision.isOpenDecision" variant="outlined" size="small" color="error" style="text-transform:none" :loading="activeDecisionId === decision.decisionId && decisionAction === 'reject'" @click="updateDecisionStatus(decision.decisionId || '', 'REJECTED')">
                  <v-icon start size="14">mdi-close</v-icon>
                  {{ t('decisions.reject_action') }}
                </v-btn>
                <v-btn variant="text" size="small" color="var(--cb-primary)" style="text-transform:none" @click="openScenario(decision.scenarioId)">
                  <v-icon start size="14">mdi-pencil-outline</v-icon>
                  {{ t('decisions.open_scenario') }}
                </v-btn>
                <v-btn variant="text" size="small" color="var(--cb-primary)" style="text-transform:none" @click="viewImpact">
                  <v-icon start size="14">mdi-chart-line</v-icon>
                  {{ t('decisions.view_impact') }}
                </v-btn>
              </div>
            </div>

            <!-- Discussion (collapsible) -->
            <div v-if="decision.decisionId" class="cb-decision-card__discussion">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <strong>{{ t('decisions.team_discussion_title') }}</strong>
                    <span style="margin-left:8px;font-size:.8rem;color:var(--cb-ink-muted)">{{ t('decisions.comments_count_label', { count: decision.comments.length }) }}</span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-alert
                      v-if="!canUseCollaboration"
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-3"
                    >
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
                        <span>{{ t('decisions.collaboration_locked_discussion') }}</span>
                        <v-btn size="x-small" variant="tonal" color="var(--cb-accent)" @click="goToChoosePlan">
                          <v-icon start size="14">mdi-lock-open-outline</v-icon>
                          {{ t('decisions.collaboration_locked_cta') }}
                        </v-btn>
                      </div>
                    </v-alert>
                    <div v-if="canUseCollaboration && decision.comments.length" style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
                      <div v-for="comment in decision.comments" :key="comment.id" style="display:flex;gap:10px;align-items:flex-start">
                        <div class="decision-comment__avatar">{{ comment.initials }}</div>
                        <div>
                          <p style="margin:0;font-size:.875rem">{{ comment.body }}</p>
                          <span v-if="comment.createdAt" style="font-size:.75rem;color:var(--cb-ink-muted)">{{ comment.authorLabel }} · {{ formatDate(comment.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    <p v-else-if="canUseCollaboration" style="font-size:.85rem;color:var(--cb-ink-muted);margin-bottom:12px">{{ t('decisions.no_comments_hint') }}</p>

                    <div style="display:flex;gap:8px;align-items:flex-start" v-if="decision.isOpenDecision && canUseCollaboration">
                      <v-text-field
                        v-model="commentDrafts[decision.decisionId]"
                        :label="t('decisions.add_comment_placeholder')"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        style="flex:1"
                        @keyup.enter="addDecisionComment(decision.decisionId)"
                      />
                      <v-btn
                        color="var(--cb-accent)"
                        variant="tonal"
                        :disabled="!commentDrafts[decision.decisionId]?.trim()"
                        :loading="activeDecisionId === decision.decisionId && decisionAction === 'comment'"
                        @click="addDecisionComment(decision.decisionId)"
                      >
                        <v-icon>mdi-comment-plus-outline</v-icon>
                      </v-btn>
                    </div>
                    <p v-if="!decision.isOpenDecision" style="font-size:.8rem;color:var(--cb-ink-muted);margin-top:8px">{{ t('decisions.discussion_closed_hint') }}</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <!-- Apply blocked hint -->
            <div v-if="decision.decisionId && decision.isOpenDecision && !decision.canApply" class="cb-decision-card__blocked-hint">
              <v-icon size="14" color="var(--cb-risk)">mdi-information-outline</v-icon>
              <span>{{ decision.applyBlockedReason || t('decisions.not_enough_approvals') }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else-if="!isLoading && !error" style="padding:64px 24px;text-align:center">
        <v-icon size="48" color="var(--cb-ink-disabled)" style="display:block;margin:0 auto 16px">mdi-lightbulb-auto-outline</v-icon>
        <p style="font-family:var(--cb-font-heading);font-size:1rem;font-weight:600;color:var(--cb-ink);margin:0 0 16px">{{ emptyDecisionMessage }}</p>
        <v-btn class="cb-btn-primary" @click="goToScenarios">
          <v-icon start size="14">mdi-layers-triple-outline</v-icon>
          {{ t('decisions.empty_cta') }}
        </v-btn>
      </div>

    </div><!-- end cb-container -->

    <!-- Vote dialog -->
    <v-dialog v-model="voteDialog.open" max-width="560">
      <v-card>
        <v-card-title>{{ t('decisions.vote_dialog_title') }}</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="voteDialog.justification"
            :label="t('decisions.vote_dialog_placeholder')"
            variant="outlined"
            counter="500"
            maxlength="500"
            auto-grow
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeVoteDialog">{{ t('decisions.cancel') }}</v-btn>
          <v-btn
            color="var(--cb-accent)"
            variant="flat"
            :loading="Boolean(voteDialog.decisionId) && activeDecisionId === voteDialog.decisionId && (decisionAction === 'vote-approve' || decisionAction === 'vote-reject')"
            @click="submitVoteFromDialog"
          >
            {{ t('decisions.submit_vote') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create decision from scenario dialog -->
    <v-dialog v-model="decisionCreationDialogOpen" max-width="640">
      <v-card>
        <v-card-title>{{ t('decisions.choose_scenario') }}</v-card-title>
        <v-card-text>
          <div v-if="availableScenariosForDecision.length" class="decision-create-list">
            <button
              v-for="scenario in availableScenariosForDecision"
              :key="scenario.id"
              type="button"
              class="decision-create-item"
              @click="selectedScenarioToCreate = scenario.id"
            >
              <div>
                <strong>{{ scenario.name }}</strong>
                <p>{{ scenario.summary || t('decisions.scenario_label', { name: scenario.name }) }}</p>
              </div>
              <v-icon v-if="selectedScenarioToCreate === scenario.id" color="var(--cb-accent)">mdi-check-circle</v-icon>
            </button>
          </div>
          <div v-else style="padding:32px;text-align:center">
            <v-icon color="var(--cb-ink-disabled)" size="28">mdi-lightbulb-auto-outline</v-icon>
            <p style="font-size:.875rem;color:var(--cb-ink-muted);margin-top:8px">{{ t('decisions.no_available_scenarios') }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDecisionCreationDialog">{{ t('decisions.cancel') }}</v-btn>
          <v-btn
            color="var(--cb-accent)"
            variant="flat"
            :disabled="!selectedScenarioToCreate"
            :loading="Boolean(selectedScenarioToCreate) && activeDecisionId === selectedScenarioToCreate && decisionAction === 'create'"
            @click="createDecisionFromSelectedScenario"
          >
            {{ t('decisions.create_decision') }}
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
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'
import ScenarioService, { type SavedScenario, type ScenarioDeltaType, type ScenarioSimulationResponse } from '@/services/ScenarioService'
import DecisionService, { type DecisionComment, type DecisionVote, type DecisionVoteValue, type PersistedDecision, type PersistedDecisionStatus } from '@/services/DecisionService'
import BillingOrchestrationService, { type BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import { useUserStore } from '@/plugins/userStore'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const activeDecisionId = ref<string | null>(null)
const decisionAction = ref<'create' | 'apply' | 'reject' | 'comment' | 'vote-approve' | 'vote-reject' | 'vote-clear' | null>(null)
const savedScenarios = ref<SavedScenario[]>([])
const selectedScenarioIds = ref<string[]>([])
const simulations = ref<Array<{ scenario: SavedScenario; result: ScenarioSimulationResponse }>>([])
const persistedDecisions = ref<PersistedDecision[]>([])
const billingSummary = ref<BillingSummaryResponse | null>(null)
const commentDrafts = ref<Record<string, string>>({})
const expandedJustifications = ref<Record<string, boolean>>({})
const decisionFilter = ref<'open' | 'withDecision' | 'closed'>('open')
const decisionCreationDialogOpen = ref(false)
const selectedScenarioToCreate = ref<string | null>(null)
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

const currentWorkspaceId = computed(() =>
  userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces[0]?.workspaceId || ''
)
const canUseCollaboration = computed(() => {
  const capabilities = billingSummary.value?.capabilities
  if (!capabilities) return false
  if (typeof capabilities.collaborationEnabled === 'boolean') return capabilities.collaborationEnabled
  return Boolean(capabilities.advancedToolsEnabled || billingSummary.value?.hasPremiumAccess)
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
  scenarioType: scenario.scenarioType,
  sourceType: scenario.sourceType,
  months: scenario.months || 6,
  debtInput: scenario.debtInput || undefined,
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
            label: t('planning.scenarios.baseline_adjustment_label', { category: line.category }),
            type: (delta > 0 ? 'MONTHLY_INCOME' : 'MONTHLY_EXPENSE') as ScenarioDeltaType,
            amount: Math.abs(delta),
            startMonthOffset: 0,
          }
        }
        return {
          label: t('planning.scenarios.baseline_adjustment_label', { category: line.category }),
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

const withDecisionCount = computed(() =>
  decisionCards.value.filter((decision) => Boolean(decision.decisionId)).length
)

const openDecisionCount = computed(() =>
  decisionCards.value.filter((decision) => decision.persistedStatus === 'OPEN').length
)

const closedDecisionCount = computed(() =>
  decisionCards.value.filter((decision) => Boolean(decision.persistedStatus) && decision.persistedStatus !== 'OPEN').length
)

const decisionSummaryItems = computed(() => [
  { label: t('decisions.filter_open', { count: openDecisionCount.value }), value: String(openDecisionCount.value) },
  { divider: true },
  { label: t('decisions.filter_with_decision', { count: withDecisionCount.value }), value: String(withDecisionCount.value) },
  { divider: true },
  { label: t('decisions.filter_closed', { count: closedDecisionCount.value }), value: String(closedDecisionCount.value) },
])

const filteredDecisionCards = computed(() => {
  if (decisionFilter.value === 'open') {
    return decisionCards.value.filter((decision) => decision.persistedStatus === 'OPEN')
  }
  if (decisionFilter.value === 'withDecision') {
    return decisionCards.value.filter((decision) => Boolean(decision.decisionId))
  }
  if (decisionFilter.value === 'closed') {
    return decisionCards.value.filter((decision) => Boolean(decision.persistedStatus) && decision.persistedStatus !== 'OPEN')
  }
  return []
})

const emptyDecisionMessage = computed(() => {
  if (decisionFilter.value === 'open') {
    return t('decisions.empty_open')
  }
  if (decisionFilter.value === 'withDecision') {
    return t('decisions.empty_with_decision')
  }
  if (decisionFilter.value === 'closed') {
    return t('decisions.empty_closed')
  }
  return t('decisions.empty')
})

const decisionsSourceNote = computed(() =>
  selectedScenarioIds.value.length
    ? t('decisions.source_selected', { count: selectedScenarioIds.value.length })
    : t('decisions.source_recent')
)

const availableScenariosForDecision = computed(() => {
  const scenarioIdsWithDecision = new Set(persistedDecisions.value.map((decision) => decision.scenarioId))
  return savedScenarios.value.filter((scenario) => !scenarioIdsWithDecision.has(scenario.id))
})

const resolveSelectedIds = () => {
  const fromQuery = typeof route.query.scenarios === 'string' ? route.query.scenarios : ''
  const raw = fromQuery
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
    const scenarioById = new Map(savedScenarios.value.map((scenario) => [scenario.id, scenario]))
    const persistedDecisionScenarioIds = [...persistedDecisions.value]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
      .map((decision) => decision.scenarioId)
      .filter(Boolean)

    // Keep selected scenario(s) first, then append scenarios already turned into decisions,
    // then fill with a few recent drafts for quick follow-up.
    const recentScenarioIds = savedScenarios.value.map((scenario) => scenario.id).slice(0, 6)
    const candidateScenarioIds = Array.from(new Set([
      ...preferredIds,
      ...persistedDecisionScenarioIds,
      ...recentScenarioIds,
    ]))

    const picked = candidateScenarioIds
      .map((id) => scenarioById.get(id))
      .filter((scenario): scenario is SavedScenario => Boolean(scenario))

    selectedScenarioIds.value = picked.map((scenario) => scenario.id)

    if (selectedScenarioIds.value.length) {
      await router.replace({
        query: {
          ...route.query,
          scenarios: selectedScenarioIds.value.join(','),
        },
      })
    } else {
      if (route.query.scenarios) {
        const nextQuery = { ...route.query }
        delete nextQuery.scenarios
        await router.replace({ query: nextQuery })
      }
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

const loadBillingCapabilities = async () => {
  const workspaceId = currentWorkspaceId.value
  if (!workspaceId) {
    billingSummary.value = null
    return
  }
  try {
    const { data } = await BillingOrchestrationService.getBillingSummary(workspaceId)
    billingSummary.value = data || null
  } catch (billingError) {
    console.error('Erro ao carregar capacidades do plano:', billingError)
    billingSummary.value = null
  }
}

const goToChoosePlan = async () => {
  await router.push({ name: 'choose-plan', query: { feature: 'collaboration' } })
}

const goToScenarios = async () => {
  await router.push({
    path: '/planning/scenarios',
  })
}

const reviewSelectedScenario = async () => {
  const scenarioId = selectedScenarioIds.value[0]
  if (!scenarioId) {
    await goToScenarios()
    return
  }
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

const openScenario = async (scenarioId: string) => {
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

const goToInsights = async () => {
  if (!selectedScenarioIds.value.length) {
    return
  }
  await router.push({
    path: '/insights',
    query: { scenarios: selectedScenarioIds.value.join(',') },
  })
}

const viewImpact = async () => {
  await router.push({ path: '/dashboard', query: { refresh: String(Date.now()) } })
}

const openDecisionCreationDialog = () => {
  selectedScenarioToCreate.value = availableScenariosForDecision.value[0]?.id || null
  decisionCreationDialogOpen.value = true
}

const closeDecisionCreationDialog = () => {
  decisionCreationDialogOpen.value = false
  selectedScenarioToCreate.value = null
}

const createDecisionFromSelectedScenario = async () => {
  if (!selectedScenarioToCreate.value) return
  await trackDecision(selectedScenarioToCreate.value)
  closeDecisionCreationDialog()
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
    const scenarioName = savedScenarios.value.find((scenario) => scenario.id === scenarioId)?.name || ''
    successMessage.value = scenarioName
      ? t('decisions.created_from_scenario', { name: scenarioName })
      : t('decisions.created_success')
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
  if (!canUseCollaboration.value) {
    error.value = t('decisions.collaboration_locked')
    await goToChoosePlan()
    return
  }
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
    successMessage.value = t('decisions.public_link_copied')
  } catch (copyError) {
    try {
      const input = document.createElement('input')
      input.value = publicUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      successMessage.value = t('decisions.public_link_copied')
    } catch (fallbackError) {
      console.error(copyError, fallbackError)
      error.value = t('decisions.public_link_copy_error')
    }
  }
}

const addDecisionComment = async (decisionId: string) => {
  if (!canUseCollaboration.value) {
    error.value = t('decisions.collaboration_locked_discussion')
    await goToChoosePlan()
    return
  }
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
  if (!canUseCollaboration.value) {
    error.value = t('decisions.collaboration_locked')
    await goToChoosePlan()
    return
  }
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
  if (!canUseCollaboration.value) {
    error.value = t('decisions.collaboration_locked')
    await goToChoosePlan()
    return
  }
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
  if (!canUseCollaboration.value) {
    error.value = t('decisions.collaboration_locked')
    void goToChoosePlan()
    return
  }
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
  const rawFlash = window.sessionStorage.getItem(DECISIONS_FLASH_SUCCESS_KEY)
  if (rawFlash) {
    window.sessionStorage.removeItem(DECISIONS_FLASH_SUCCESS_KEY)
    try {
      const parsed = JSON.parse(rawFlash) as { scenarioName?: string }
      const scenarioName = String(parsed?.scenarioName || '').trim()
      successMessage.value = scenarioName
        ? t('decisions.created_from_scenario', { name: scenarioName })
        : t('decisions.created_success')
    } catch {
      successMessage.value = t('decisions.created_success')
    }
  }
  await Promise.allSettled([
    loadBillingCapabilities(),
    loadDecisionCards(),
  ])
})
</script>

<style scoped>
/* ── Decision reasoning vote chips ─────── */
.decision-reasoning__toggle {
  width: fit-content;
  border: 0;
  background: transparent;
  color: var(--cb-accent);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.decision-reasoning__vote {
  display: inline-block;
  width: 14px;
  margin-right: 2px;
  font-weight: 700;
}

.decision-reasoning__vote--approve { color: var(--cb-positive); }
.decision-reasoning__vote--reject  { color: var(--cb-risk); }

/* ── Comment avatar ─────────────────────── */
.decision-comment__avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--cb-primary-bg);
  color: var(--cb-primary);
  font-size: 0.78rem;
  font-weight: 700;
}

/* ── Create-from-scenario picker ────────── */
.decision-create-list {
  display: grid;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
}

.decision-create-item {
  border: 1px solid var(--cb-border-card);
  border-radius: var(--cb-radius-card);
  padding: 12px;
  background: var(--cb-surface);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  color: var(--cb-ink);
}

.decision-create-item p {
  margin: 4px 0 0;
  color: var(--cb-ink-muted);
  font-size: 0.86rem;
}

/* ── Decision card (cb-* layout) ────────── */
.cb-decisions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cb-decision-card {
  background: var(--cb-surface);
  border-radius: var(--cb-radius-card);
  border: 1px solid var(--cb-border-card);
  padding: 20px 24px;
  box-shadow: var(--cb-shadow-card);
}

.cb-decision-card--open {
  border-left: 3px solid var(--cb-primary);
}

.cb-decision-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cb-decision-card__title {
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--cb-ink);
  margin: 0 0 2px;
}

.cb-decision-card__scenario {
  font-size: .8rem;
  color: var(--cb-ink-muted);
  margin: 0;
}

.cb-decision-card__impact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: center;
  background: rgba(23,32,51,.03);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: .82rem;
}

.cb-decision-card__impact-label {
  font-weight: 600;
  color: var(--cb-ink-secondary);
}

.cb-decision-card__impact-value {
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 700;
}

.cb-decision-card__impact-meta {
  color: var(--cb-ink-muted);
  font-size: .75rem;
}

.cb-decision-card__consequence {
  font-size: .875rem;
  color: var(--cb-ink-secondary);
  margin: 0 0 14px;
}

.cb-decision-card__votes {
  border-top: 1px solid var(--cb-border);
  padding-top: 14px;
  margin-bottom: 14px;
}

.cb-decision-card__votes-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: .875rem;
}

.cb-decision-card__reasoning {
  background: rgba(23,32,51,.03);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: .8rem;
}

.cb-decision-card__reasoning-group {
  font-weight: 600;
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--cb-ink-muted);
  margin: 8px 0 4px;
}

.cb-decision-card__reasoning-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.cb-decision-card__metrics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.cb-decision-card__metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: .8rem;
}

.cb-decision-card__metric span {
  color: var(--cb-ink-muted);
}

.cb-decision-card__metric strong {
  font-family: var(--cb-font-heading);
  font-size: .95rem;
  color: var(--cb-ink);
}

.cb-decision-card__meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .8rem;
  color: var(--cb-ink-muted);
  margin-bottom: 14px;
}

.cb-decision-card__actions {
  border-top: 1px solid var(--cb-border);
  padding-top: 14px;
  margin-bottom: 12px;
}

.cb-decision-card__discussion {
  margin-top: 12px;
}

.cb-decision-card__blocked-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .8rem;
  color: var(--cb-risk);
  margin-top: 8px;
}

@media (max-width: 900px) {
  .cb-decision-card__head {
    flex-direction: column;
  }
}
</style>
