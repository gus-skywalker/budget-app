<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="t('planning.scenarios.title')" :meta="t('planning.scenarios.subtitle')">
        <template #actions>
          <v-btn v-if="canWriteScenarios" color="var(--cb-primary)" @click="createScenario">
            <v-icon start>mdi-plus-circle-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
          <v-btn v-if="canWriteScenarios" variant="tonal" color="var(--cb-accent)" @click="createDebtScenario">
            <v-icon start>mdi-credit-card-fast-outline</v-icon>
            {{ t('planning.scenarios.debt_payment_decision') }}
          </v-btn>
        </template>
      </page-header>

      <div class="cb-card">
        <div class="cb-card__header">
          <div>
            <h3 class="cb-card__title">{{ t('planning.scenarios.saved_title') }}</h3>
            <p class="scenarios-subtitle">{{ t('planning.scenarios.saved_subtitle') }}</p>
          </div>
        </div>
        <div class="cb-card__body scenarios-body">

          <div v-if="isLoading" class="cb-empty-state">
            <v-icon size="40" color="var(--cb-ink-muted)">mdi-timer-sand</v-icon>
            <p>{{ t('planning.scenarios.comparing') }}</p>
          </div>

          <div v-else-if="savedScenarios.length" class="saved-scenarios-list">
          <button
            v-for="scenario in savedScenarios"
            :key="scenario.id"
            type="button"
            class="saved-scenario-card"
            @click="openResult(scenario.id)"
          >
            <div class="saved-scenario-card__header">
              <strong>{{ scenario.name }}</strong>
              <div class="saved-scenario-card__header-tags">
                <span :class="['status-chip', scenarioTone(scenario)]">{{
                  scenarioLabel(scenario)
                }}</span>
                <span
                  v-if="isScenarioLockedForEdit(scenario.id)"
                  class="status-chip status-chip--locked"
                  >{{ t('planning.scenarios.votes_locked') }}</span
                >
              </div>
            </div>

            <p>
              {{
                scenario.summary || scenario.description || t('planning.scenarios.saved_no_summary')
              }}
            </p>

            <div class="saved-scenario-card__meta">
              <span
                >{{ t('planning.scenarios.monthly_impact') }}:
                {{ formatCurrency(scenarioMonthlyImpact(scenario)) }}</span
              >
            </div>

            <div class="saved-scenario-card__actions">
              <v-tooltip
                v-if="canWriteScenarios && isScenarioLockedForEdit(scenario.id)"
                :text="t('planning.scenarios.locked_edit_tooltip')"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="text"
                    density="comfortable"
                    size="small"
                    @click.stop="editScenario(scenario.id)"
                  >
                    <v-icon start>mdi-pencil-outline</v-icon>
                    {{ editActionLabel(scenario.id) }}
                  </v-btn>
                </template>
              </v-tooltip>
              <v-btn
                v-else-if="canWriteScenarios"
                variant="text"
                density="comfortable"
                size="small"
                @click.stop="editScenario(scenario.id)"
              >
                <v-icon start>mdi-pencil-outline</v-icon>
                {{ editActionLabel(scenario.id) }}
              </v-btn>
              <v-btn
                variant="text"
                density="comfortable"
                size="small"
                color="var(--cb-primary)"
                :loading="creatingDecisionId === scenario.id"
                @click.stop="createDecisionFromScenario(scenario)"
              >
                <v-icon start>mdi-lightbulb-outline</v-icon>
                {{ t('planning.scenarios.create_decision_from_scenario') }}
              </v-btn>
              <v-tooltip
                v-if="canWriteScenarios && hasScenarioDecision(scenario.id)"
                :text="t('planning.scenarios.linked_delete_tooltip')"
                location="top"
              >
                <template #activator="{ props }">
                  <span v-bind="props" class="disabled-action-wrap" @click.stop>
                    <v-btn variant="text" density="comfortable" size="small" color="error" disabled>
                      <v-icon start>mdi-delete-outline</v-icon>
                      {{ t('planning.scenarios.delete_action') }}
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>
              <v-btn
                v-else-if="canWriteScenarios"
                variant="text"
                density="comfortable"
                size="small"
                color="error"
                @click.stop="deleteScenario(scenario)"
              >
                <v-icon start>mdi-delete-outline</v-icon>
                {{ t('planning.scenarios.delete_action') }}
              </v-btn>
            </div>
          </button>
          </div>

          <div v-else class="cb-empty-state">
            <v-icon size="40" color="var(--cb-ink-muted)">mdi-content-save-outline</v-icon>
            <p>{{ t('planning.scenarios.saved_placeholder') }}</p>
            <v-btn v-if="canWriteScenarios" color="var(--cb-primary)" variant="tonal" @click="createScenario">
              <v-icon start>mdi-plus</v-icon>
              {{ t('planning.scenarios.new_scenario') }}
            </v-btn>
          </div>

          <alert-strip v-if="errorMessage" variant="risk" :description="errorMessage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario } from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'
import { useUserStore } from '@/plugins/userStore'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const isLoading = ref(false)
const creatingDecisionId = ref<string | null>(null)
const errorMessage = ref('')
const savedScenarios = ref<SavedScenario[]>([])
const scenariosLockedForMutation = ref<Set<string>>(new Set())
const scenariosWithAnyDecision = ref<Set<string>>(new Set())
const canWriteScenarios = computed(() => userStore.canWrite)

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

const scenarioTone = (scenario: SavedScenario) => {
  const status = scenarioDecisionStatus(scenario)
  if (status === 'ACTION_NEEDED') return 'status-chip--danger'
  if (status === 'WATCH') return 'status-chip--warning'
  return 'status-chip--success'
}

const scenarioLabel = (scenario: SavedScenario) => {
  const status = scenarioDecisionStatus(scenario)
  if (status === 'ACTION_NEEDED')
    return t('planning.scenarios.status_action_needed')
  if (status === 'WATCH') return t('planning.scenarios.status_watch')
  if (status === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
}

const scenarioMonthlyImpact = (scenario: SavedScenario): number => {
  if (scenario.scenarioMonthlyImpact != null) return Number(scenario.scenarioMonthlyImpact || 0)
  const months = Math.max(1, Number(scenario.months || 6))
  return (scenario.deltas || []).reduce((total, delta) => {
    const amount = Number(delta.amount || 0)
    const weightedAmount = String(delta.type || '').startsWith('ONE_TIME') ? amount / months : amount
    if (delta.type === 'MONTHLY_INCOME' || delta.type === 'ONE_TIME_INCOME') {
      return total + weightedAmount
    }
    if (delta.type === 'MONTHLY_EXPENSE' || delta.type === 'ONE_TIME_EXPENSE') {
      return total - weightedAmount
    }
    return total
  }, 0)
}

const scenarioDecisionStatus = (scenario: SavedScenario): string => {
  if (scenario.decisionStatus) return scenario.decisionStatus
  const impact = scenarioMonthlyImpact(scenario)
  if (impact < 0) return 'ACTION_NEEDED'
  if (impact > 0) return 'STABLE'
  return 'NO_DATA'
}

const loadSavedScenarios = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [{ data }, { data: decisions }] = await Promise.all([
      ScenarioService.list(),
      DecisionService.list()
    ])
    savedScenarios.value = Array.isArray(data) ? data : []
    const nextLocked = new Set<string>()
    const nextWithDecision = new Set<string>()
    ;(Array.isArray(decisions) ? decisions : []).forEach((decision) => {
      const scenarioId = String(decision?.scenarioId || '')
      if (!scenarioId) return
      nextWithDecision.add(scenarioId)
      const totalVotes = Number(decision?.approveVotes || 0) + Number(decision?.rejectVotes || 0)
      const status = String(decision?.status || '').toUpperCase()
      if (totalVotes > 0 || Boolean(status && status !== 'OPEN')) {
        nextLocked.add(scenarioId)
      }
    })
    scenariosLockedForMutation.value = nextLocked
    scenariosWithAnyDecision.value = nextWithDecision
  } catch (e) {
    console.error(e)
    savedScenarios.value = []
    scenariosLockedForMutation.value = new Set()
    scenariosWithAnyDecision.value = new Set()
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    isLoading.value = false
  }
}

const createScenario = async () => {
  await router.push({ name: 'planning-scenarios-new', query: { from: 'hub' } })
}

const createDebtScenario = async () => {
  await router.push({ name: 'planning-scenarios-debt-new', query: { from: 'hub' } })
}

const openResult = async (scenarioId: string) => {
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

const editScenario = async (scenarioId: string) => {
  const scenario = savedScenarios.value.find((item) => item.id === scenarioId)
  const debtScenario = scenario?.sourceType === 'MANUAL_TYPED'
  if (isScenarioLockedForEdit(scenarioId)) {
    await router.push({
      name: debtScenario ? 'planning-scenarios-debt-new' : 'planning-scenarios-new',
      query: { cloneFrom: scenarioId, locked: '1' }
    })
    return
  }
  await router.push({
    name: debtScenario ? 'planning-scenarios-debt-edit' : 'planning-scenarios-edit',
    params: { id: scenarioId }
  })
}

const isScenarioLockedForEdit = (scenarioId: string) =>
  scenariosLockedForMutation.value.has(scenarioId)
const hasScenarioDecision = (scenarioId: string) => scenariosWithAnyDecision.value.has(scenarioId)

const editActionLabel = (scenarioId: string) =>
  isScenarioLockedForEdit(scenarioId)
    ? t('planning.scenarios.create_new_version')
    : t('planning.scenarios.edit_action')

const deleteScenario = async (scenario: SavedScenario) => {
  if (hasScenarioDecision(scenario.id)) {
    errorMessage.value = t('planning.scenarios.linked_delete_error')
    return
  }
  const confirmed = window.confirm(t('planning.scenarios.delete_confirm', { name: scenario.name }))
  if (!confirmed) return
  errorMessage.value = ''
  try {
    await ScenarioService.remove(scenario.id)
    await loadSavedScenarios()
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.delete_error')
  }
}

const createDecisionFromScenario = async (scenario: SavedScenario) => {
  creatingDecisionId.value = scenario.id
  errorMessage.value = ''
  try {
    await DecisionService.createFromScenario(scenario.id)
    window.sessionStorage.setItem(
      DECISIONS_FLASH_SUCCESS_KEY,
      JSON.stringify({ scenarioName: scenario.name || t('planning.scenarios.default_name') })
    )
    await router.push({ name: 'decisions', query: { scenarios: scenario.id } })
  } catch (e) {
    console.error(e)
    errorMessage.value = t('planning.scenarios.error')
  } finally {
    creatingDecisionId.value = null
  }
}

onMounted(() => {
  void loadSavedScenarios()
})
</script>

<style scoped>
.scenarios-subtitle {
  font-size: 0.82rem;
  color: var(--cb-ink-muted);
  margin: 2px 0 0;
}

.scenarios-body {
  padding: 16px;
}

.saved-scenarios-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  min-width: 0;
}

.saved-scenario-card {
  border: 1px solid var(--cb-border-card);
  border-radius: var(--cb-radius-card);
  padding: 14px;
  text-align: left;
  background: var(--cb-surface-soft);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  overflow-wrap: anywhere;
  transition: box-shadow 0.15s ease, transform 0.12s ease;
}

.saved-scenario-card:hover {
  box-shadow: var(--cb-shadow-elevated);
  transform: translateY(-1px);
}

.saved-scenario-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.saved-scenario-card strong {
  color: var(--cb-ink);
  font-size: 0.95rem;
}

.saved-scenario-card > p {
  color: var(--cb-ink-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.saved-scenario-card__header-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.saved-scenario-card__meta {
  color: var(--cb-ink-muted);
  font-size: 0.86rem;
  min-width: 0;
}

.saved-scenario-card__actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
}

.disabled-action-wrap {
  display: inline-flex;
}

/* Status chips */
.status-chip {
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-chip--danger {
  color: var(--cb-risk);
  background: var(--cb-risk-bg);
}

.status-chip--warning {
  color: var(--cb-warning);
  background: var(--cb-warning-bg);
}

.status-chip--success {
  color: var(--cb-positive);
  background: var(--cb-positive-bg);
}

.status-chip--locked {
  color: #7c2d12;
  background: rgba(251, 146, 60, 0.2);
}

@media (max-width: 600px) {
  .saved-scenario-card__header,
  .saved-scenario-card__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .saved-scenario-card__header-tags {
    justify-content: flex-start;
  }

  .saved-scenarios-list {
    grid-template-columns: 1fr;
  }
}
</style>
