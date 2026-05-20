<template>
  <div class="planning-page">
    <v-container class="modern-container debt-scenario-builder">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('contentExperience.planning.debtBuilder.title') }}</h1>
          <p class="page-subtitle">{{ t('contentExperience.planning.debtBuilder.subtitle') }}</p>
        </div>
        <v-btn variant="text" color="#667eea" @click="router.push({ name: 'planning-scenarios' })">
          <v-icon start>mdi-arrow-left</v-icon>
          {{ t('contentExperience.planning.scenarioBuilder.backToList') }}
        </v-btn>
      </div>

      <div class="wizard-shell">
        <div class="wizard-steps">
          <span class="wizard-step">{{ t('contentExperience.planning.debtBuilder.stepFlow') }}</span>
          <v-progress-linear :model-value="progress" color="#667eea" height="8" rounded />
        </div>

        <section class="wizard-panel">
          <h2>{{ t('contentExperience.planning.debtBuilder.step1Title') }}</h2>
          <p>{{ t('contentExperience.planning.debtBuilder.step1Description') }}</p>

          <v-text-field
            v-model="snapshot.scenarioName"
            :label="t('contentExperience.planning.debtBuilder.titleField')"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <div class="wizard-grid">
            <v-text-field
              v-model.number="snapshot.debtInput.totalAmount"
              :label="t('contentExperience.planning.debtBuilder.totalAmount')"
              type="number"
              min="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
            <v-text-field
              v-model.number="snapshot.debtInput.availableCash"
              :label="t('contentExperience.planning.debtBuilder.availableCash')"
              type="number"
              min="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </div>
        </section>

        <section class="wizard-panel">
          <div class="panel-header">
            <div>
              <h2>{{ t('contentExperience.planning.debtBuilder.step2Title') }}</h2>
              <p>{{ t('contentExperience.planning.debtBuilder.step2Description') }}</p>
            </div>
            <v-btn variant="tonal" color="#667eea" @click="addOption">
              <v-icon start>mdi-plus</v-icon>
              {{ t('contentExperience.planning.debtBuilder.addOption') }}
            </v-btn>
          </div>

          <div class="options-list">
            <div
              v-for="(option, index) in snapshot.debtInput.options"
              :key="`${index}-${option.name}`"
              class="option-card"
            >
              <div class="option-card__header">
                <strong>{{ t('contentExperience.planning.debtBuilder.optionLabel', { index: index + 1 }) }}</strong>
                <v-btn
                  v-if="snapshot.debtInput.options.length > 2"
                  icon
                  variant="text"
                  color="error"
                  @click="removeOption(index)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </div>

              <div class="wizard-grid">
                <v-text-field
                  v-model="option.name"
                  :label="t('contentExperience.planning.debtBuilder.optionName')"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-select
                  v-model="option.type"
                  :items="optionTypes"
                  :label="t('contentExperience.planning.debtBuilder.optionType')"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.financedAmount"
                  :label="t('contentExperience.planning.debtBuilder.financedAmount')"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.installments"
                  :label="t('contentExperience.planning.debtBuilder.installments')"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.monthlyInterestRate"
                  :label="t('contentExperience.planning.debtBuilder.monthlyInterestRate')"
                  type="number"
                  min="0"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.iofAmount"
                  label="IOF"
                  type="number"
                  min="0"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.totalInstallmentAmount"
                  :label="t('contentExperience.planning.debtBuilder.totalAmountPaid')"
                  type="number"
                  min="0"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.expectedPayoffDays"
                  :label="t('contentExperience.planning.debtBuilder.expectedPayoffDays')"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-select
                  v-model="option.liquidityCertainty"
                  :items="liquidityOptions"
                  :label="t('contentExperience.planning.debtBuilder.liquidityCertainty')"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>

              <v-textarea
                v-model="option.notes"
                :label="t('contentExperience.planning.debtBuilder.notes')"
                rows="2"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>
          </div>
        </section>

        <section class="wizard-panel">
          <h2>{{ t('contentExperience.planning.debtBuilder.step3Title') }}</h2>
          <p>{{ t('contentExperience.planning.debtBuilder.step3Description') }}</p>
          <div class="compare-preview">
            <div class="summary-item">
              <span>{{ t('contentExperience.planning.debtBuilder.debtRemainingAfterCash') }}</span>
              <strong>{{
                formatCurrency(
                  Math.max(
                    0,
                    Number(snapshot.debtInput.totalAmount || 0) -
                      Number(snapshot.debtInput.availableCash || 0)
                  )
                )
              }}</strong>
            </div>
            <div class="summary-item">
              <span>{{ t('contentExperience.planning.debtBuilder.optionsConfigured') }}</span>
              <strong>{{ snapshot.debtInput.options.length }}</strong>
            </div>
          </div>
        </section>

        <section class="wizard-panel">
          <h2>{{ t('contentExperience.planning.debtBuilder.step4Title') }}</h2>
          <p>{{ t('contentExperience.planning.debtBuilder.step4Description') }}</p>
        </section>

        <v-alert
          v-if="validationErrors.length"
          type="warning"
          variant="tonal"
          density="comfortable"
        >
          {{ validationErrors[0] }}
        </v-alert>

        <div class="wizard-footer">
          <v-btn variant="text" @click="router.push({ name: 'planning-scenarios' })">
            {{ t('contentExperience.planning.debtBuilder.cancel') }}
          </v-btn>
          <v-btn color="#667eea" size="large" :loading="isSimulating" @click="simulate">
            <v-icon start>mdi-scale-balance</v-icon>
            {{ t('contentExperience.planning.debtBuilder.compareOptions') }}
          </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BudgetService from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import {
  buildDebtScenarioPayload,
  clearDebtSnapshot,
  createDebtOption,
  createDebtSnapshot,
  debtScenarioTemplates,
  loadDebtSnapshot,
  normalizeDebtSnapshot,
  saveDebtSnapshot,
  snapshotFromSavedDebtScenario,
  validateDebtSnapshot,
  type DebtScenarioSnapshot
} from '@/utils/debtScenario'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const isSimulating = ref(false)
const validationErrors = ref<string[]>([])
const progress = 100
const snapshot = reactive<DebtScenarioSnapshot>(createDebtSnapshot())
const requestedTemplate = computed(() =>
  String(route.query.template || '')
    .trim()
    .toLowerCase()
)

const optionTypes = [
  {
    title: t('contentExperience.planning.debtBuilder.optionTypes.installment'),
    value: 'INSTALLMENT'
  },
  {
    title: t('contentExperience.planning.debtBuilder.optionTypes.shortTermCredit'),
    value: 'SHORT_TERM_CREDIT'
  },
  { title: t('contentExperience.planning.debtBuilder.optionTypes.manual'), value: 'MANUAL' }
]

const liquidityOptions = [
  { title: t('contentExperience.planning.debtBuilder.liquidity.certain'), value: 'CERTAIN' },
  {
    title: t('contentExperience.planning.debtBuilder.liquidity.uncertain'),
    value: 'UNCERTAIN'
  },
  { title: t('contentExperience.planning.debtBuilder.liquidity.none'), value: 'NONE' }
]

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en'
      ? 'en-US'
      : locale.value === 'fr'
        ? 'fr-FR'
        : locale.value === 'es'
          ? 'es-ES'
          : 'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )

const addOption = () => {
  snapshot.debtInput.options.push(createDebtOption())
}

const removeOption = (index: number) => {
  snapshot.debtInput.options.splice(index, 1)
}

const applyRouteTemplate = () => {
  const templateMap: Record<string, keyof typeof debtScenarioTemplates> = {
    'pay-now-or-installments': 'pay_now_or_installments',
    pay_now_or_installments: 'pay_now_or_installments',
    payment: 'pay_now_or_installments'
  }
  const templateKey = templateMap[requestedTemplate.value]
  if (!templateKey) return false

  const templatedSnapshot = debtScenarioTemplates[templateKey]()
  templatedSnapshot.budgetId = snapshot.budgetId
  Object.assign(snapshot, normalizeDebtSnapshot(templatedSnapshot))
  return true
}

const simulate = async () => {
  validationErrors.value = validateDebtSnapshot(snapshot)
  if (validationErrors.value.length) return

  isSimulating.value = true
  try {
    snapshot.debtInput.title = snapshot.scenarioName
    saveDebtSnapshot(snapshot)
    const { data } = await ScenarioService.simulate(buildDebtScenarioPayload(snapshot))
    window.sessionStorage.setItem(
      'planning-scenario-latest-result',
      JSON.stringify({
        scenarioId: snapshot.currentScenarioId || 'preview',
        result: data
      })
    )
    await router.push({
      name: 'planning-scenarios-result',
      params: { id: snapshot.currentScenarioId || 'preview' },
      query: { scenarioType: snapshot.scenarioType, simulatedAt: Date.now().toString() }
    })
  } finally {
    isSimulating.value = false
  }
}

const loadCurrentBudget = async () => {
  try {
    const { data, status } = await BudgetService.getCurrent(
      new Date().getMonth() + 1,
      new Date().getFullYear()
    )
    if (status !== 204 && data?.id) {
      snapshot.budgetId = data.id
    }
  } catch {
    // Keep manual flow working even if current budget cannot be loaded.
  }
}

onMounted(async () => {
  await loadCurrentBudget()
  const routeId = String(route.params.id || '')
  if (routeId) {
    const { data } = await ScenarioService.list()
    const source = (Array.isArray(data) ? data : []).find((item) => item.id === routeId)
    if (source?.sourceType === 'MANUAL_TYPED') {
      Object.assign(snapshot, snapshotFromSavedDebtScenario(source))
      return
    }
  }

  const cloneFrom = typeof route.query.cloneFrom === 'string' ? route.query.cloneFrom : ''
  if (cloneFrom) {
    const { data } = await ScenarioService.list()
    const source = (Array.isArray(data) ? data : []).find((item) => item.id === cloneFrom)
    if (source?.sourceType === 'MANUAL_TYPED') {
      const cloned = snapshotFromSavedDebtScenario(source)
      cloned.currentScenarioId = null
      cloned.scenarioName = t('planning.scenarios.versioned_name', { name: cloned.scenarioName })
      cloned.debtInput.title = cloned.scenarioName
      Object.assign(snapshot, normalizeDebtSnapshot(cloned))
      return
    }
  }

  const restored = loadDebtSnapshot()
  if (restored) {
    Object.assign(snapshot, restored)
    applyRouteTemplate()
    return
  }

  clearDebtSnapshot()
  applyRouteTemplate()
})

watch(
  () => snapshot,
  () => {
    snapshot.debtInput.title = snapshot.scenarioName
    saveDebtSnapshot(snapshot)
  },
  { deep: true }
)
</script>

<style scoped>
.debt-scenario-builder {
  max-width: 1120px;
}

.wizard-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 20px;
  min-width: 0;
}

.wizard-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wizard-step {
  font-size: 0.85rem;
  color: #6366f1;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wizard-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 1));
}

.wizard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  border: 1px solid rgba(99, 102, 241, 0.14);
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.option-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.compare-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.summary-item {
  border-radius: 14px;
  padding: 14px;
  background: rgba(79, 70, 229, 0.06);
  border: 1px solid rgba(79, 70, 229, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item span {
  color: #64748b;
  font-size: 0.9rem;
}

.summary-item strong {
  color: #0f172a;
  font-size: 1.1rem;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

@media (max-width: 960px) {
  .page-header,
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .debt-scenario-builder {
    padding-inline: 0;
  }

  .wizard-shell,
  .wizard-panel,
  .option-card {
    padding: 16px;
  }

  .wizard-grid,
  .compare-preview {
    grid-template-columns: 1fr;
  }

  .page-header :deep(.v-btn),
  .panel-header :deep(.v-btn),
  .wizard-footer :deep(.v-btn) {
    width: 100%;
  }

  .wizard-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
