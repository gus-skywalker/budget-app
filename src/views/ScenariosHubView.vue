<template>
  <div class="planning-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('planning.scenarios.title') }}</h1>
          <p class="page-subtitle">{{ t('planning.scenarios.subtitle') }}</p>
        </div>
        <div class="page-header__actions">
          <v-btn color="#667eea" @click="createScenario">
            <v-icon start>mdi-plus-circle-outline</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </div>
      </div>

      <div class="saved-scenarios-panel">
        <div class="saved-scenarios-panel__header">
          <div>
            <h3>{{ t('planning.scenarios.saved_title') }}</h3>
            <p>{{ t('planning.scenarios.saved_subtitle') }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="empty-results">
          <v-icon color="#94a3b8">mdi-timer-sand</v-icon>
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
                <span :class="['status-chip', scenarioTone(scenario)]">{{ scenarioLabel(scenario) }}</span>
                <span v-if="isScenarioLockedForEdit(scenario.id)" class="status-chip status-chip--locked">Votes locked</span>
              </div>
            </div>

            <p>{{ scenario.summary || scenario.description || t('planning.scenarios.saved_no_summary') }}</p>

            <div class="saved-scenario-card__meta">
              <span>{{ t('planning.scenarios.monthly_impact') }}: {{ formatCurrency(Number(scenario.scenarioMonthlyImpact || 0)) }}</span>
            </div>

            <div class="saved-scenario-card__actions">
              <v-tooltip
                v-if="isScenarioLockedForEdit(scenario.id)"
                text="This scenario has votes. Create a new version to preserve decision history."
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
                v-else
                variant="text"
                density="comfortable"
                size="small"
                @click.stop="editScenario(scenario.id)"
              >
                <v-icon start>mdi-pencil-outline</v-icon>
                {{ editActionLabel(scenario.id) }}
              </v-btn>
              <v-btn variant="text" density="comfortable" size="small" color="#4f46e5" :loading="creatingDecisionId === scenario.id" @click.stop="createDecisionFromScenario(scenario)">
                <v-icon start>mdi-lightbulb-outline</v-icon>
                {{ t('planning.scenarios.create_decision_from_scenario') }}
              </v-btn>
              <v-tooltip
                v-if="hasScenarioDecision(scenario.id)"
                text="Cannot delete: this scenario is linked to a decision. Keep it for audit history."
                location="top"
              >
                <template #activator="{ props }">
                  <span v-bind="props" class="disabled-action-wrap" @click.stop>
                    <v-btn
                      variant="text"
                      density="comfortable"
                      size="small"
                      color="error"
                      disabled
                    >
                      <v-icon start>mdi-delete-outline</v-icon>
                      {{ t('planning.scenarios.delete_action') }}
                    </v-btn>
                  </span>
                </template>
              </v-tooltip>
              <v-btn
                v-else
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

        <div v-else class="empty-results">
          <v-icon color="#94a3b8">mdi-content-save-outline</v-icon>
          <p>{{ t('planning.scenarios.saved_placeholder') }}</p>
          <v-btn color="#667eea" variant="tonal" @click="createScenario">
            <v-icon start>mdi-plus</v-icon>
            {{ t('planning.scenarios.new_scenario') }}
          </v-btn>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ScenarioService, { type SavedScenario } from '@/services/ScenarioService'
import DecisionService from '@/services/DecisionService'

const { t, locale } = useI18n()
const router = useRouter()
const DECISIONS_FLASH_SUCCESS_KEY = 'decisions-flash-success'

const isLoading = ref(false)
const creatingDecisionId = ref<string | null>(null)
const errorMessage = ref('')
const savedScenarios = ref<SavedScenario[]>([])
const scenariosLockedForMutation = ref<Set<string>>(new Set())
const scenariosWithAnyDecision = ref<Set<string>>(new Set())

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' },
  )

const scenarioTone = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return 'status-chip--danger'
  if (scenario.decisionStatus === 'WATCH') return 'status-chip--warning'
  return 'status-chip--success'
}

const scenarioLabel = (scenario: SavedScenario) => {
  if (scenario.decisionStatus === 'ACTION_NEEDED') return t('planning.scenarios.status_action_needed')
  if (scenario.decisionStatus === 'WATCH') return t('planning.scenarios.status_watch')
  if (scenario.decisionStatus === 'STABLE') return t('planning.scenarios.status_stable')
  return t('planning.scenarios.status_no_data')
}

const loadSavedScenarios = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [{ data }, { data: decisions }] = await Promise.all([
      ScenarioService.list(),
      DecisionService.list(),
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

const openResult = async (scenarioId: string) => {
  await router.push({ name: 'planning-scenarios-result', params: { id: scenarioId } })
}

const editScenario = async (scenarioId: string) => {
  if (isScenarioLockedForEdit(scenarioId)) {
    await router.push({ name: 'planning-scenarios-new', query: { cloneFrom: scenarioId, locked: '1' } })
    return
  }
  await router.push({ name: 'planning-scenarios-edit', params: { id: scenarioId } })
}

const isScenarioLockedForEdit = (scenarioId: string) => scenariosLockedForMutation.value.has(scenarioId)
const hasScenarioDecision = (scenarioId: string) => scenariosWithAnyDecision.value.has(scenarioId)

const editActionLabel = (scenarioId: string) =>
  isScenarioLockedForEdit(scenarioId) ? 'Create new version' : t('planning.scenarios.edit_action')

const deleteScenario = async (scenario: SavedScenario) => {
  if (hasScenarioDecision(scenario.id)) {
    errorMessage.value = 'This scenario cannot be deleted because it is linked to a decision.'
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
      JSON.stringify({ scenarioName: scenario.name || t('planning.scenarios.default_name') }),
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
.saved-scenarios-panel {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 20px;
  margin-top: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-header__actions {
  display: flex;
  gap: 8px;
}

.saved-scenarios-panel__header h3 {
  margin: 0;
}

.saved-scenarios-panel__header p {
  color: #64748b;
  margin-top: 4px;
}

.saved-scenarios-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.saved-scenario-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-scenario-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.saved-scenario-card__header-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.saved-scenario-card__meta {
  color: #64748b;
  font-size: 0.86rem;
}

.saved-scenario-card__actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.disabled-action-wrap {
  display: inline-flex;
}

.status-chip {
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-chip--danger {
  color: #991b1b;
  background: rgba(185, 28, 28, 0.15);
}

.status-chip--warning {
  color: #92400e;
  background: rgba(217, 119, 6, 0.15);
}

.status-chip--success {
  color: #166534;
  background: rgba(22, 163, 74, 0.16);
}

.status-chip--locked {
  color: #7c2d12;
  background: rgba(251, 146, 60, 0.2);
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  padding: 40px 16px;
  text-align: center;
}

.v-theme--dark .saved-scenarios-panel {
  background: rgba(17, 24, 39, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.24);
}

.v-theme--dark .saved-scenarios-panel__header p,
.v-theme--dark .saved-scenario-card__meta,
.v-theme--dark .empty-results {
  color: #cbd5e1;
}

.v-theme--dark .saved-scenario-card {
  background: rgba(30, 41, 59, 0.78);
  border-color: rgba(148, 163, 184, 0.2);
  color: #f8fafc;
}
</style>
