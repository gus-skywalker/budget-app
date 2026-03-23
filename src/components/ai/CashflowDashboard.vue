<template>
  <section class="ai-card">
    <header>
      <h2>{{ t('ai.cashflow.title') }}</h2>
      <p>{{ t('ai.cashflow.description') }}</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.cashflow.months') }}
        <input v-model.number="months" type="number" min="1" max="12" />
      </label>

      <button type="submit" :disabled="isLoading">{{ isLoading ? t('ai.common.loading') : t('ai.cashflow.update') }}</button>
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

.metrics article {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem;
}

.insight {
  background: #f8fafc;
  border-left: 4px solid #2563eb;
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
  color: #0f172a;
}

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.surplus { background: #dcfce7; color: #15803d; }
.chip.deficit { background: #fee2e2; color: #b91c1c; }
</style>
