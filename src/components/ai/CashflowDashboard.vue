<template>
  <section class="ai-card">
    <header>
      <h2>{{ t('ai.cashflow.title') }}</h2>
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
          <h4>{{ t('ai.cashflow.decision_status') }}</h4>
          <strong :class="['decision-pill', decisionTone]">{{ decisionStatusLabel }}</strong>
        </article>
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

      <div v-if="insights.primaryDriver || insights.recommendedAction || insights.opportunityMessage" class="action-cards">
        <article v-if="insights.primaryDriver">
          <h4>{{ t('ai.cashflow.primary_driver') }}</h4>
          <p>{{ insights.primaryDriver }}</p>
        </article>
        <article v-if="insights.recommendedAction">
          <h4>{{ t('ai.cashflow.recommended_action') }}</h4>
          <p>{{ insights.recommendedAction }}</p>
          <strong v-if="(insights.recommendedActionAmount || 0) > 0">{{ formatCurrency(insights.recommendedActionAmount || 0) }}</strong>
        </article>
        <article v-if="insights.opportunityMessage">
          <h4>{{ t('ai.cashflow.opportunity') }}</h4>
          <p>{{ insights.opportunityMessage }}</p>
        </article>
      </div>

      <div v-if="displayInsights.length" class="insights-section">
        <h3>{{ t('ai.cashflow.insights_title') }}</h3>
        <p class="insight" v-for="text in displayInsights" :key="text">{{ text }}</p>
      </div>

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
            <td>{{ row.month }}</td>
            <td>{{ formatCurrency(row.predictedIncome) }}</td>
            <td>{{ formatCurrency(row.predictedExpenses) }}</td>
            <td>{{ formatCurrency(row.projectedBalance) }}</td>
            <td>
              <span :class="['chip', row.status]">{{ statusLabel(row.status) }}</span>
            </td>
            <td>
              <div v-if="row.alert">
                <p>{{ row.alert.message }}</p>
                <small v-for="suggestion in row.alert.suggestions" :key="suggestion">• {{ suggestion }}</small>
              </div>
              <span v-else>{{ t('ai.cashflow.no_alerts') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { CashflowInsightsResponse } from '../../services/aiService'

const { t } = useI18n()

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
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

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
  return 'surplus'
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

.decision-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
}

.chip.surplus { background: var(--cb-positive-bg); color: var(--cb-positive); }
.chip.deficit { background: var(--cb-risk-bg); color: var(--cb-risk); }
.decision-pill.surplus { background: var(--cb-positive-bg); color: var(--cb-positive); }
.decision-pill.watch { background: var(--cb-warning-bg); color: var(--cb-warning); }
.decision-pill.deficit { background: var(--cb-risk-bg); color: var(--cb-risk); }
</style>
