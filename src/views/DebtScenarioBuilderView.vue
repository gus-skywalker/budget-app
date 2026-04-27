<template>
  <div class="planning-page">
    <v-container class="modern-container debt-scenario-builder">
      <div class="page-header">
        <div>
          <h1 class="page-title">Debt payment decision</h1>
          <p class="page-subtitle">
            Compare paying now versus splitting the remaining balance with clear cost and risk
            trade-offs.
          </p>
        </div>
        <v-btn variant="text" color="#667eea" @click="router.push({ name: 'planning-scenarios' })">
          <v-icon start>mdi-arrow-left</v-icon>
          Scenario list
        </v-btn>
      </div>

      <div class="wizard-shell">
        <div class="wizard-steps">
          <span class="wizard-step">UC01 flow</span>
          <v-progress-linear :model-value="progress" color="#667eea" height="8" rounded />
        </div>

        <section class="wizard-panel">
          <h2>Step 1. Debt context</h2>
          <p>Start with the obligation and the cash you already have available.</p>

          <v-text-field
            v-model="snapshot.scenarioName"
            label="Title"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <div class="wizard-grid">
            <v-text-field
              v-model.number="snapshot.debtInput.totalAmount"
              label="Total amount"
              type="number"
              min="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
            <v-text-field
              v-model.number="snapshot.debtInput.availableCash"
              label="Available cash"
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
              <h2>Step 2. Payment options</h2>
              <p>Add at least two alternatives to compare cost, safety, and predictability.</p>
            </div>
            <v-btn variant="tonal" color="#667eea" @click="addOption">
              <v-icon start>mdi-plus</v-icon>
              Add option
            </v-btn>
          </div>

          <div class="options-list">
            <div
              v-for="(option, index) in snapshot.debtInput.options"
              :key="`${index}-${option.name}`"
              class="option-card"
            >
              <div class="option-card__header">
                <strong>Option {{ index + 1 }}</strong>
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
                  label="Option name"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-select
                  v-model="option.type"
                  :items="optionTypes"
                  label="Option type"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.financedAmount"
                  label="Financed amount"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.installments"
                  label="Installments"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.monthlyInterestRate"
                  label="Monthly interest rate (%)"
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
                  label="Total amount paid"
                  type="number"
                  min="0"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="option.expectedPayoffDays"
                  label="Expected payoff days"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-select
                  v-model="option.liquidityCertainty"
                  :items="liquidityOptions"
                  label="Liquidity certainty"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>

              <v-textarea
                v-model="option.notes"
                label="Notes"
                rows="2"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>
          </div>
        </section>

        <section class="wizard-panel">
          <h2>Step 3. Compare</h2>
          <p>
            Run the simulation to see the cheapest option, the safest option, and the recommended
            trade-off.
          </p>
          <div class="compare-preview">
            <div class="summary-item">
              <span>Debt remaining after cash</span>
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
              <span>Options configured</span>
              <strong>{{ snapshot.debtInput.options.length }}</strong>
            </div>
          </div>
        </section>

        <section class="wizard-panel">
          <h2>Step 4. Create decision</h2>
          <p>
            The result screen lets you save the scenario and create the decision using the existing
            Decision flow.
          </p>
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
            Cancel
          </v-btn>
          <v-btn color="#667eea" size="large" :loading="isSimulating" @click="simulate">
            <v-icon start>mdi-scale-balance</v-icon>
            Compare options
          </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BudgetService from '@/services/BudgetService'
import ScenarioService from '@/services/ScenarioService'
import {
  buildDebtScenarioPayload,
  clearDebtSnapshot,
  createDebtOption,
  createDebtSnapshot,
  loadDebtSnapshot,
  normalizeDebtSnapshot,
  saveDebtSnapshot,
  snapshotFromSavedDebtScenario,
  validateDebtSnapshot,
  type DebtScenarioSnapshot
} from '@/utils/debtScenario'

const router = useRouter()
const route = useRoute()

const isSimulating = ref(false)
const validationErrors = ref<string[]>([])
const progress = 100
const snapshot = reactive<DebtScenarioSnapshot>(createDebtSnapshot())

const optionTypes = [
  { title: 'Installment', value: 'INSTALLMENT' },
  { title: 'Short-term credit', value: 'SHORT_TERM_CREDIT' },
  { title: 'Manual', value: 'MANUAL' }
]

const liquidityOptions = [
  { title: 'Certain', value: 'CERTAIN' },
  { title: 'Uncertain', value: 'UNCERTAIN' },
  { title: 'None', value: 'NONE' }
]

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const addOption = () => {
  snapshot.debtInput.options.push(createDebtOption())
}

const removeOption = (index: number) => {
  snapshot.debtInput.options.splice(index, 1)
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
      cloned.scenarioName = `${cloned.scenarioName} (new)`
      cloned.debtInput.title = cloned.scenarioName
      Object.assign(snapshot, normalizeDebtSnapshot(cloned))
      return
    }
  }

  const restored = loadDebtSnapshot()
  if (restored) {
    Object.assign(snapshot, restored)
    return
  }

  clearDebtSnapshot()
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
