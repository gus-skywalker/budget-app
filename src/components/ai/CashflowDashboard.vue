<template>
  <section class="ai-card">
    <header>
      <h2>{{ t('cashflow.flow_title') }}</h2>
      <p>{{ t('ai.cashflow.description') }}</p>
    </header>

    <div v-if="!enabled" class="locked-state">
      <p>{{ t('ai.common.advanced_cashflow_locked') }}</p>
      <button type="button" @click="$emit('upgrade')">{{ t('ai.common.upgrade_cta') }}</button>
    </div>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.cashflow.months') }}
        <input v-model.number="months" type="number" min="1" max="12" />
      </label>

      <button type="submit" :disabled="isLoading || !enabled">{{ isLoading ? t('ai.common.loading') : t('ai.cashflow.update') }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="insights" class="results">
      <div class="cashflow-answer" :class="`cashflow-answer--${decisionTone}`">
        <span class="cashflow-answer__eyebrow">{{ t('cashflow.reading_label') }}</span>
        <h3>{{ decisionStatusLabel }}</h3>
        <p>{{ insights.primaryDriver || t('cashflow.reading_fallback') }}</p>
        <div v-if="insights.recommendedAction" class="cashflow-answer__action">
          <strong>{{ t('ai.cashflow.recommended_action') }}</strong>
          <p>{{ insights.recommendedAction }}</p>
          <strong v-if="(insights.recommendedActionAmount || 0) > 0">{{ formatCurrency(insights.recommendedActionAmount || 0) }}</strong>
        </div>
      </div>

      <div class="metrics">
        <article>
          <h4>{{ t('ai.cashflow.current_balance') }}</h4>
          <strong>{{ formatCurrency(insights.currentBalance) }}</strong>
        </article>
        <article>
          <h4>{{ t('ai.cashflow.monthly_average') }}</h4>
          <strong>{{ formatCurrency(insights.averageMonthlyBalance) }}</strong>
        </article>
      </div>

      <div class="decision-cards">
        <article>
          <h4>{{ t('ai.cashflow.available_for_goals') }}</h4>
          <strong>{{ formatCurrency(insights.availableForGoals || 0) }}</strong>
        </article>
        <article>
          <h4>{{ t('ai.cashflow.required_adjustment') }}</h4>
          <strong>{{ formatCurrency(insights.requiredMonthlyAdjustment || 0) }}</strong>
        </article>
        <article>
          <h4>{{ t('ai.cashflow.goals_impact') }}</h4>
          <strong>{{ goalsImpactLabel }}</strong>
        </article>
      </div>

      <div v-if="insights.opportunityMessage" class="action-cards">
        <article v-if="insights.opportunityMessage">
          <h4>{{ t('ai.cashflow.opportunity') }}</h4>
          <p>{{ insights.opportunityMessage }}</p>
        </article>
      </div>

      <div v-if="displayInsights.length" class="insights-section">
        <h3>{{ t('ai.cashflow.insights_title') }}</h3>
        <p class="insight" v-for="text in displayInsights" :key="text">{{ text }}</p>
      </div>

      <h3 class="cashflow-monthly-title">{{ t('cashflow.monthly_detail_title') }}</h3>
      <div class="cashflow-table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ t('ai.cashflow.month') }}</th>
              <th>{{ t('ai.cashflow.income') }}</th>
              <th>{{ t('ai.cashflow.expenses') }}</th>
              <th>{{ t('ai.cashflow.projected_balance') }}</th>
              <th>{{ t('ai.cashflow.status') }}</th>
              <th>{{ t('ai.cashflow.alerts') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in insights.forecast" :key="row.month">
              <td :data-label="t('ai.cashflow.month')">{{ row.month }}</td>
              <td :data-label="t('ai.cashflow.income')">{{ formatCurrency(row.predictedIncome) }}</td>
              <td :data-label="t('ai.cashflow.expenses')">{{ formatCurrency(row.predictedExpenses) }}</td>
              <td :data-label="t('ai.cashflow.projected_balance')">{{ formatCurrency(row.projectedBalance) }}</td>
              <td :data-label="t('ai.cashflow.status')">
                <span :class="['chip', row.status]">{{ statusLabel(row.status) }}</span>
              </td>
              <td :data-label="t('ai.cashflow.alerts')">
                <div v-if="row.alert">
                  <p>{{ row.alert.message }}</p>
                  <small v-for="suggestion in row.alert.suggestions" :key="suggestion">• {{ suggestion }}</small>
                </div>
                <span v-else>{{ t('ai.cashflow.no_alerts') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { CashflowInsightsResponse } from '../../services/aiService'

const { t, locale } = useI18n()

const props = withDefaults(defineProps<{ enabled?: boolean }>(), {
  enabled: true
})
defineEmits<{ (event: 'upgrade'): void }>()

const months = ref(6)
const isLoading = ref(false)
const error = ref('')
const insights = ref<CashflowInsightsResponse | null>(null)
const duplicateInsightPatterns = [
  /^fluxo de caixa estável/i,
  /^cash flow is stable/i,
  /^flujo de caja estable/i,
  /^flux de trésorerie stable/i
]

const formatCurrency = (value: number) =>
  value.toLocaleString(
    locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR',
    { style: 'currency', currency: 'BRL' }
  )

const displayInsights = computed(() => {
  if (!insights.value?.insights?.length) {
    return []
  }

  const unique = new Set<string>()
  const filtered = insights.value.insights
    .map((text) => text?.trim())
    .filter((text): text is string => Boolean(text))
    .filter((text) => !duplicateInsightPatterns.some((pattern) => pattern.test(text)))
    .filter((text) => {
      const normalized = text.toLowerCase()
      if (unique.has(normalized)) {
        return false
      }
      unique.add(normalized)
      return true
    })

  return filtered.slice(0, 3)
})

const decisionTone = computed(() => {
  const status = insights.value?.decisionStatus
  if (status === 'ACTION_NEEDED') return 'deficit'
  if (status === 'WATCH') return 'watch'
  return 'neutral'
})

const decisionStatusLabel = computed(() => {
  const status = insights.value?.decisionStatus
  if (status === 'ACTION_NEEDED') return t('ai.cashflow.decision_action_needed')
  if (status === 'WATCH') return t('ai.cashflow.decision_watch')
  if (status === 'STABLE') return t('ai.cashflow.decision_stable')
  return t('ai.cashflow.decision_no_data')
})

const goalsImpactLabel = computed(() => {
  const atRisk = insights.value?.goalsAtRiskCount || 0
  const onTrack = insights.value?.goalsOnTrackCount || 0
  if (atRisk > 0) {
    return t('ai.cashflow.goals_at_risk_count', { count: atRisk })
  }
  if (onTrack > 0) {
    return t('ai.cashflow.goals_on_track_count', { count: onTrack })
  }
  return t('ai.cashflow.goals_no_data')
})

const statusLabel = (status: string) => {
  const normalized = status?.toLowerCase()
  if (normalized === 'surplus') {
    return t('ai.cashflow.status_surplus')
  }
  if (normalized === 'deficit') {
    return t('ai.cashflow.status_deficit')
  }
  return status
}

const handleSubmit = async () => {
  if (!props.enabled) {
    error.value = t('ai.common.advanced_cashflow_locked')
    return
  }
  error.value = ''
  isLoading.value = true
  insights.value = null

  try {
    const { data } = await AiService.getCashflowInsights({
      months: months.value
    })
    insights.value = data
  } catch (err) {
    error.value = t('ai.cashflow.error_fetch')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.results { display: grid; gap: 1rem; }
.cashflow-answer {
  display: grid;
  gap: .55rem;
  padding: clamp(20px, 3vw, 28px);
  border: 1px solid var(--cb-border-card);
  border-radius: 16px;
  background: var(--cb-surface-soft);
}
.cashflow-answer--deficit { border-left: 4px solid var(--cb-risk); }
.cashflow-answer--watch { border-left: 4px solid var(--cb-warning); }
.cashflow-answer--neutral { border-left: 4px solid var(--cb-border-card); }
.cashflow-answer__eyebrow { font-size: .75rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; color: var(--cb-ink-secondary); }
.cashflow-answer h3 { margin: 0; font-family: var(--cb-font-heading); font-size: clamp(1.25rem, 2.5vw, 1.8rem); color: var(--cb-ink); }
.cashflow-answer p { margin: 0; color: var(--cb-ink-secondary); line-height: 1.5; }
.cashflow-answer__action { display: grid; gap: .35rem; margin-top: .5rem; padding-top: 1rem; border-top: 1px solid var(--cb-border-card); }
.cashflow-answer__action strong { color: var(--cb-ink); }
.cashflow-table-scroll { max-width: 100%; overflow-x: auto; }
.cashflow-table-scroll table { min-width: 680px; }
.cashflow-monthly-title { margin: .25rem 0 0; color: var(--cb-ink); font-size: 1rem; }

@media (max-width: 600px) {
  .cashflow-table-scroll { overflow: visible; }
  .cashflow-table-scroll table { min-width: 0; }
  .cashflow-table-scroll thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
  .cashflow-table-scroll tbody { display: grid; gap: .75rem; }
  .cashflow-table-scroll tr { display: grid; gap: .35rem; padding: .85rem; border: 1px solid var(--cb-border-card); border-radius: 12px; }
  .cashflow-table-scroll td { display: flex; justify-content: space-between; align-items: flex-start; gap: .75rem; border: 0; padding: .2rem 0; text-align: right; }
  .cashflow-table-scroll td::before { content: attr(data-label); flex: 0 0 44%; color: var(--cb-ink-secondary); font-weight: 700; text-align: left; }
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.decision-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.metrics article {
  border: 1px solid var(--cb-border-card);
  border-radius: 10px;
  padding: 0.75rem;
}

.decision-cards article {
  border: 1px solid var(--cb-border-card);
  border-radius: 10px;
  padding: 0.75rem;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.action-cards article {
  border: 1px solid var(--cb-border-card);
  border-radius: 10px;
  padding: 0.9rem;
  background: var(--cb-surface-soft);
}

.action-cards h4,
.action-cards p {
  margin: 0;
}

.action-cards article {
  display: grid;
  gap: 0.45rem;
}

.insight {
  background: var(--cb-surface-soft);
  border-left: 4px solid var(--cb-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.insights-section {
  display: grid;
  gap: 0.5rem;
}

.insights-section h3 {
  margin: 0.25rem 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--cb-ink);
}

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.surplus { background: var(--cb-positive-bg); color: var(--cb-positive); }
.chip.deficit { background: var(--cb-risk-bg); color: var(--cb-risk); }
</style>
