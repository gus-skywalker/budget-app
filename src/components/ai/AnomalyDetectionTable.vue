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

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.anomaly.sensitivity') }}
        <input v-model.number="sensitivity" type="number" min="0.5" max="3" step="0.1" />
      </label>

      <div class="transactions">
        <div class="transactions__header">
          <h3>{{ t('ai.anomaly.expenses') }}</h3>
          <button type="button" class="ghost" @click="addTransaction">+ {{ t('ai.common.add') }}</button>
        </div>
        <div v-if="!transactions.length" class="empty">{{ t('ai.anomaly.empty_transactions') }}</div>
        <div v-for="(tx, index) in transactions" :key="tx.localId" class="transaction-row">
          <input v-model="tx.description" :placeholder="t('common.description')" required />
          <input v-model.number="tx.amount" type="number" min="0" step="0.01" :placeholder="t('common.amount')" required />
          <input v-model="tx.date" type="date" required />
          <button type="button" class="danger" @click="removeTransaction(index)">x</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">
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

      <table v-if="response.anomalies.length">
        <thead>
          <tr>
            <th>{{ t('common.date') }}</th>
            <th>{{ t('common.description') }}</th>
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
            <td>{{ formatCurrency(item.expense.amount) }}</td>
            <td>{{ item.deviation.toFixed(2) }}</td>
            <td>
              <span :class="['chip', item.severity]">{{ item.severity }}</span>
            </td>
            <td>{{ item.suggestion || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">{{ t('ai.anomaly.no_data') }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { AiTransaction, AnomalyDetectionResponse } from '../../services/aiService'

const { t } = useI18n()

interface UiTransaction extends AiTransaction {
  localId: string
}

const sensitivity = ref(1.5)
const transactions = reactive<UiTransaction[]>([])
const isLoading = ref(false)
const error = ref('')
const response = ref<AnomalyDetectionResponse | null>(null)

const addTransaction = () => {
  transactions.push({
    localId: crypto.randomUUID(),
    type: 'EXPENSE',
    amount: 0,
    currency: 'BRL',
    date: new Date().toISOString().substring(0, 10),
    description: ''
  })
}

const removeTransaction = (index: number) => {
  transactions.splice(index, 1)
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const handleSubmit = async () => {
  if (!transactions.length) {
    error.value = t('ai.anomaly.error_add_expenses')
    return
  }

  error.value = ''
  isLoading.value = true
  response.value = null

  const payload = {
    sensitivity: sensitivity.value,
    transactions: transactions.map((tx) => {
      const { localId, ...rest } = tx
      void localId
      return rest as AiTransaction
    })
  }

  try {
    const { data } = await AiService.detectAnomalies(payload)
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
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.experimental-note {
  display: block;
  color: #64748b;
  margin-top: 0.35rem;
}

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.high { background: #fee2e2; color: #b91c1c; }
.chip.medium { background: #ffedd5; color: #9a3412; }
</style>
