<template>
  <div class="cb-page experience-page experience-page--cashflow">
    <div class="cb-container">
      <page-header :title="t('cashflow.title')" :meta="t('cashflow.subtitle')" />

      <div class="cb-scope-note">
        <v-icon size="14" color="var(--cb-ink-muted)">mdi-account-group-outline</v-icon>
        <span>{{ t('transactionVisibility.cashflowBadge') }} — {{ t('transactionVisibility.cashflowScopeNote') }}</span>
      </div>

      <section class="cb-card cashflow-intro" aria-labelledby="cashflow-intro-title">
        <div>
          <span class="cashflow-intro__eyebrow">{{ t('cashflow.guide_eyebrow') }}</span>
          <h2 id="cashflow-intro-title">{{ t('cashflow.guide_title') }}</h2>
          <p>{{ t('cashflow.guide_description') }}</p>
        </div>
        <v-icon class="cashflow-intro__icon" size="48" aria-hidden="true">mdi-chart-timeline-variant</v-icon>
      </section>

      <section class="cb-card cf-card" :aria-label="t('cashflow.flow_title')">
        <div class="cb-card__body">
          <PlanTierBadge v-if="billingSummary && !canUseAdvancedCashflow" tier="TEAM" />
          <CashflowDashboard :enabled="canUseAdvancedCashflow" @upgrade="goToChoosePlan('advanced-cashflow')" />
        </div>
      </section>

      <details class="cb-card cashflow-explore">
        <summary class="cashflow-explore__summary">
          <div class="insights-heading">
            <h2 class="cb-card__title">
              <v-icon color="var(--cb-primary)" size="16" class="mr-2">mdi-brain</v-icon>
              {{ t('cashflow.insights_title') }}
            </h2>
            <PlanTierBadge v-if="billingSummary && !canUseAi" tier="STARTER" />
            <p class="insights-subtitle">{{ t('cashflow.insights_subtitle') }}</p>
          </div>
          <span class="experimental-badge">{{ t('cashflow.experimental_badge') }}</span>
          <v-icon class="cashflow-explore__chevron" size="22" aria-hidden="true">mdi-chevron-down</v-icon>
        </summary>
        <div class="cb-card__body cashflow-explore__body">
          <p class="experimental-note">{{ t('cashflow.experimental_note') }}</p>
          <div class="insights-context">
            <div class="insights-context__item">
              <v-icon size="18" color="var(--cb-primary)">mdi-database-outline</v-icon>
              <span>{{ t('cashflow.insights_context_history') }}</span>
            </div>
            <div class="insights-context__item">
              <v-icon size="18" color="var(--cb-warning)">mdi-flask-outline</v-icon>
              <span>{{ t('cashflow.insights_context_experimental') }}</span>
            </div>
          </div>
          <div v-if="hasCreditCardContext" class="credit-card-context">
            <div class="credit-card-context__header">
              <h3>{{ t('cashflow.credit_card_context_title') }}</h3>
              <p>{{ t('cashflow.credit_card_context_subtitle') }}</p>
            </div>
            <div class="credit-card-context__grid">
              <div v-if="pendingCreditCardAmount > 0" class="cc-card cc-card--warning">
                <span>{{ t('cashflow.credit_card_pending_title') }}</span>
                <strong>{{ formatCurrency(pendingCreditCardAmount) }}</strong>
                <p>{{ t('cashflow.credit_card_pending_message', { amount: formatCurrency(pendingCreditCardAmount) }) }}</p>
              </div>
              <div v-if="recurringCreditCardAverage > 0" class="cc-card">
                <span>{{ t('cashflow.credit_card_recurring_title') }}</span>
                <strong>{{ formatCurrency(recurringCreditCardAverage) }}</strong>
                <p>{{ t('cashflow.credit_card_recurring_message', { count: recurringCreditCardCount, amount: formatCurrency(recurringCreditCardAverage) }) }}</p>
              </div>
              <div v-if="creditCardShare > 0" class="cc-card">
                <span>{{ t('cashflow.credit_card_share_title') }}</span>
                <strong>{{ creditCardShareLabel }}</strong>
                <p>{{ t('cashflow.credit_card_share_message', { share: creditCardShareLabel }) }}</p>
              </div>
            </div>
          </div>
          <div class="insights-grid">
            <MonthlyExpensesPrediction :enabled="canUseAi" @upgrade="goToChoosePlan('ai')" />
            <AnomalyDetectionTable :enabled="canUseAi" @upgrade="goToChoosePlan('ai')" />
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import CashflowDashboard from '@/components/ai/CashflowDashboard.vue'
import MonthlyExpensesPrediction from '@/components/ai/MonthlyExpensesPrediction.vue'
import AnomalyDetectionTable from '@/components/ai/AnomalyDetectionTable.vue'
import AiService from '@/services/aiService'
import BillingOrchestrationService, { type BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import { useUserStore } from '@/plugins/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PlanTierBadge from '@/components/PlanTierBadge.vue'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const predictionSummary = ref<any | null>(null)
const billingSummary = ref<BillingSummaryResponse | null>(null)

const currentWorkspaceId = computed(() =>
  userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces[0]?.workspaceId || ''
)

const capabilityValue = (name: keyof NonNullable<BillingSummaryResponse['capabilities']>) => {
  const capabilities = billingSummary.value?.capabilities
  if (!capabilities) return false
  const explicit = capabilities[name]
  if (typeof explicit === 'boolean') return explicit
  return Boolean(capabilities.advancedToolsEnabled || billingSummary.value?.hasPremiumAccess)
}
const canUseAi = computed(() => capabilityValue('aiEnabled'))
const canUseAdvancedCashflow = computed(() => capabilityValue('advancedCashflowEnabled'))

const creditCardShare = computed(() => Number(predictionSummary.value?.creditCardShare || 0))
const creditCardShareLabel = computed(() => `${Math.round(creditCardShare.value * 100)}%`)
const recurringCreditCardAverage = computed(() => Number(predictionSummary.value?.recurringCreditCardAverage || 0))
const recurringCreditCardCount = computed(() => Number(predictionSummary.value?.recurringCreditCardCount || 0))
const pendingCreditCardAmount = computed(() => Number(predictionSummary.value?.pendingCreditCardAmount || 0))
const hasCreditCardContext = computed(() =>
  creditCardShare.value > 0 || recurringCreditCardAverage.value > 0 || pendingCreditCardAmount.value > 0
)

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const loadBillingCapabilities = async () => {
  const workspaceId = currentWorkspaceId.value
  if (!workspaceId) {
    billingSummary.value = null
    return
  }
  try {
    const { data } = await BillingOrchestrationService.getBillingSummary(workspaceId)
    billingSummary.value = data || null
  } catch (error) {
    console.error('Error loading plan capabilities:', error)
    billingSummary.value = null
  }
}

const goToChoosePlan = (feature: string) => {
  router.push({ name: 'choose-plan', query: { feature } })
}

onMounted(async () => {
  await loadBillingCapabilities()
  if (!canUseAi.value) {
    predictionSummary.value = null
    return
  }
  try {
    const { data } = await AiService.predictMonthlyExpenses({ forecastMonths: 3 })
    predictionSummary.value = data
  } catch (error) {
    console.error('Error fetching credit card prediction context:', error)
    predictionSummary.value = null
  }
})
</script>

<style scoped>
.cb-scope-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .82rem;
  color: var(--cb-ink-muted);
  margin-bottom: 20px;
}

.cf-card {
  margin-bottom: 20px;
}

.cashflow-intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  padding: clamp(24px, 4vw, 38px);
}

.cashflow-intro__eyebrow {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--cb-accent-bg);
  color: var(--cb-ink);
  font-size: .74rem;
  font-weight: 750;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.cashflow-intro h2 {
  margin: 20px 0 10px;
  font-family: var(--cb-font-heading);
  font-size: clamp(1.55rem, 3vw, 2.45rem);
  letter-spacing: -.035em;
  line-height: 1.16;
}

.cashflow-intro p { max-width: 650px; margin: 0; color: var(--cb-ink-secondary); line-height: 1.55; }
.cashflow-intro__icon { color: var(--cb-accent); flex: none; }

.cashflow-explore { overflow: hidden; }
.cashflow-explore__summary {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 80px;
  padding: 20px 24px;
  cursor: pointer;
  list-style: none;
}
.cashflow-explore__summary::-webkit-details-marker { display: none; }
.cashflow-explore__summary .insights-heading { flex: 1; min-width: 0; }
.cashflow-explore__summary .cb-card__title { margin: 0; }
.cashflow-explore__chevron { transition: transform .2s ease; }
.cashflow-explore[open] .cashflow-explore__chevron { transform: rotate(180deg); }
.cashflow-explore__body { border-top: 1px solid var(--cb-border-card); }

@media (max-width: 600px) {
  .cashflow-intro__icon { display: none; }
  .cashflow-explore__summary { flex-wrap: wrap; }
  .cashflow-explore__summary .insights-heading { flex-basis: 100%; }
  .insights-grid { grid-template-columns: minmax(0, 1fr); }
}

.insights-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.insights-subtitle {
  font-size: 0.875rem;
  color: var(--cb-ink-secondary);
  margin: 4px 0 0;
}

.experimental-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--cb-warning);
  background: var(--cb-warning-bg);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.experimental-note {
  color: var(--cb-ink-secondary);
  font-size: 0.9rem;
  margin: 0 0 16px;
}

.insights-context {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.insights-context__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--cb-ink-secondary);
}

.insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-top: 20px;
}

/* Credit card context */
.credit-card-context {
  margin-bottom: 20px;
}

.credit-card-context__header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cb-ink);
  margin: 0 0 4px;
}

.credit-card-context__header p {
  font-size: 0.875rem;
  color: var(--cb-ink-secondary);
  margin: 0 0 12px;
}

.credit-card-context__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.cc-card {
  padding: 14px;
  border-radius: var(--cb-radius-card);
  background: var(--cb-surface-soft);
  border: 1px solid var(--cb-border-card);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cc-card span {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cb-ink-muted);
}

.cc-card strong {
  font-family: var(--cb-font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cb-ink);
}

.cc-card p {
  font-size: 0.82rem;
  color: var(--cb-ink-secondary);
  margin: 0;
  line-height: 1.4;
}

.cc-card--warning {
  background: var(--cb-warning-bg);
  border-color: var(--cb-warning);
}

.cc-card--warning strong {
  color: var(--cb-warning);
}
</style>
