<template>
  <section class="ai-card">
    <header>
      <div class="title-row">
        <h2>{{ t('ai.anomaly.title') }}</h2>
        <span class="experimental-badge">{{ t('ai.common.experimental') }}</span>
      </div>
      <p>{{ t('ai.anomaly.description') }}</p>
      <small class="experimental-note">{{ t('ai.anomaly.experimental_note') }}</small>
    </header>

    <div class="history-context">
      <strong>{{ t('ai.anomaly.history_scope_title') }}</strong>
      <span>{{ t('ai.anomaly.history_scope_description') }}</span>
    </div>

    <div v-if="!enabled" class="locked-state">
      <p>{{ t('ai.common.ai_locked') }}</p>
      <button type="button" @click="$emit('upgrade')">{{ t('ai.common.upgrade_cta') }}</button>
    </div>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.anomaly.window_days') }}
        <input v-model.number="windowDays" type="number" min="30" max="365" step="30" />
      </label>

      <label>
        {{ t('ai.anomaly.sensitivity') }}
        <input v-model.number="sensitivity" type="number" min="0.5" max="3" step="0.1" />
      </label>

      <p class="history-note">{{ t('ai.anomaly.scope_window', { days: windowDays }) }}</p>

      <button type="submit" :disabled="isLoading || !enabled">
        {{ isLoading ? t('ai.common.processing') : t('ai.anomaly.submit') }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="response" class="results">
      <h3>{{ t('ai.anomaly.summary') }}</h3>
      <ul>
        <li>{{ t('ai.anomaly.total_analyzed') }}: {{ response.summary.totalTransactionsAnalyzed }}</li>
        <li>{{ t('ai.anomaly.anomalies') }}: {{ response.summary.anomaliesCount }}</li>
        <li>{{ t('ai.anomaly.anomalous_amount') }}: {{ formatCurrency(response.summary.totalAnomalousAmount) }}</li>
      </ul>
      <p v-if="response.summary.summaryText" class="history-note">{{ response.summary.summaryText }}</p>

      <table v-if="response.anomalies.length">
        <thead>
          <tr>
            <th>{{ t('common.date') }}</th>
            <th>{{ t('common.description') }}</th>
            <th>{{ t('ai.anomaly.category') }}</th>
            <th>{{ t('common.amount') }}</th>
            <th>{{ t('ai.anomaly.deviation') }}</th>
            <th>{{ t('ai.anomaly.severity') }}</th>
            <th>{{ t('ai.anomaly.suggestion') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in response.anomalies" :key="item.expense.id || item.expense.description">
            <td>{{ item.expense.date || '—' }}</td>
            <td>{{ item.expense.description || t('ai.common.no_description') }}</td>
            <td>{{ item.expense.categoryName || t('ai.anomaly.uncategorized') }}</td>
            <td>{{ formatCurrency(item.expense.amount) }}</td>
            <td>{{ item.deviation.toFixed(2) }}</td>
            <td>
              <span :class="['chip', item.severity]">{{ severityLabel(item.severity) }}</span>
            </td>
            <td>{{ anomalySuggestion(item) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">{{ t('ai.anomaly.no_data') }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { AnomalyDetectionItem, AnomalyDetectionResponse, AnomalySeverity } from '../../services/aiService'

const { t } = useI18n()

const props = withDefaults(defineProps<{ enabled?: boolean }>(), {
  enabled: true
})
defineEmits<{ (event: 'upgrade'): void }>()

const sensitivity = ref(1.5)
const windowDays = ref(90)
const isLoading = ref(false)
const error = ref('')
const response = ref<AnomalyDetectionResponse | null>(null)

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const severityLabel = (severity: AnomalySeverity) =>
  severity === 'high' ? t('ai.anomaly.severity_high') : t('ai.anomaly.severity_medium')

const anomalySuggestion = (item: AnomalyDetectionItem) => {
  if (item.suggestion?.trim()) {
    return item.suggestion
  }
  if (item.expense.categoryName) {
    return item.severity === 'high'
      ? t('ai.anomaly.fallback_suggestion_high_category', { category: item.expense.categoryName })
      : t('ai.anomaly.fallback_suggestion_medium_category', { category: item.expense.categoryName })
  }
  return item.severity === 'high'
    ? t('ai.anomaly.fallback_suggestion_high')
    : t('ai.anomaly.fallback_suggestion_medium')
}

const handleSubmit = async () => {
  if (!props.enabled) {
    error.value = t('ai.common.ai_locked')
    return
  }
  error.value = ''
  isLoading.value = true
  response.value = null

  try {
    const { data } = await AiService.detectAnomalies({
      sensitivity: sensitivity.value,
      windowDays: windowDays.value,
    })
    response.value = data
  } catch (err) {
    error.value = t('ai.anomaly.error_detect')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.experimental-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  background: var(--cb-warning-bg);
  color: var(--cb-warning);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.experimental-note {
  display: block;
  color: var(--cb-ink-muted);
  margin-top: 0.35rem;
}

.history-context {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0 1.25rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: var(--cb-surface-soft);
  color: var(--cb-ink);
}

.history-note {
  margin: 0.75rem 0 0;
  color: var(--cb-ink-muted);
  font-size: 0.92rem;
}

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.high { background: var(--cb-risk-bg); color: var(--cb-risk); }
.chip.medium { background: var(--cb-warning-bg); color: var(--cb-warning); }
</style>
