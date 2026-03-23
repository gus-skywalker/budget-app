<template>
  <section class="ai-card">
    <header>
      <div class="title-row">
        <h2>{{ t('ai.monthly_prediction.title') }}</h2>
        <span class="experimental-badge">{{ t('ai.common.experimental') }}</span>
      </div>
      <p>{{ t('ai.monthly_prediction.description') }}</p>
      <small class="experimental-note">{{ t('ai.monthly_prediction.experimental_note') }}</small>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.monthly_prediction.months_to_forecast') }}
        <input v-model.number="forecastMonths" type="number" min="1" max="12" />
      </label>

      <label>
        {{ t('ai.monthly_prediction.category_optional') }}
        <input v-model.number="categoryId" type="number" min="1" placeholder="123" />
      </label>

      <div class="transactions">
        <div class="transactions__header">
          <h3>{{ t('ai.monthly_prediction.transactions_expenses') }}</h3>
          <button type="button" class="ghost" @click="addTransaction">+ {{ t('ai.common.add') }}</button>
        </div>
        <div v-if="!transactions.length" class="empty">{{ t('ai.monthly_prediction.empty_transactions') }}</div>
        <div v-for="(tx, index) in transactions" :key="tx.localId" class="transaction-row">
          <input v-model="tx.description" :placeholder="t('common.description')" required />
          <input v-model.number="tx.amount" type="number" min="0" step="0.01" :placeholder="t('common.amount')" required />
          <input v-model="tx.date" type="date" required />
          <select v-model="tx.currency">
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
          <button type="button" class="danger" @click="removeTransaction(index)">{{ t('ai.common.remove') }}</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? t('ai.common.calculating') : t('ai.monthly_prediction.submit') }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="prediction" class="results">
      <h3>{{ t('ai.monthly_prediction.result') }}</h3>
      <p>{{ t('ai.monthly_prediction.total_predicted') }}: <strong>{{ formatCurrency(prediction.totalPredicted) }}</strong></p>
      <p v-if="prediction.modelAccuracy">{{ t('ai.monthly_prediction.estimated_accuracy') }}: {{ (prediction.modelAccuracy * 100).toFixed(1) }}%</p>
      <table>
        <thead>
          <tr>
            <th>{{ t('ai.monthly_prediction.month') }}</th>
            <th>{{ t('ai.monthly_prediction.predicted_amount') }}</th>
            <th>{{ t('ai.monthly_prediction.confidence') }}</th>
            <th>{{ t('ai.monthly_prediction.range') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in prediction.predictions" :key="item.month + item.categoryId">
            <td>{{ item.month }}</td>
            <td>{{ formatCurrency(item.predictedAmount) }}</td>
            <td>{{ (item.confidence * 100).toFixed(0) }}%</td>
            <td>{{ formatCurrency(item.minExpected || 0) }} - {{ formatCurrency(item.maxExpected || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { AiTransaction, MonthlyExpensesPredictionResponse } from '../../services/aiService'

const { t } = useI18n()

interface UiTransaction extends AiTransaction {
  localId: string
}

const forecastMonths = ref(3)
const categoryId = ref<number | null>(null)
const transactions = reactive<UiTransaction[]>([])
const isLoading = ref(false)
const error = ref('')
const prediction = ref<MonthlyExpensesPredictionResponse | null>(null)

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
    error.value = t('ai.monthly_prediction.error_add_expense')
    return
  }

  error.value = ''
  isLoading.value = true
  prediction.value = null

  const payload = {
    forecastMonths: forecastMonths.value,
    categoryId: categoryId.value ?? undefined,
    historicalTransactions: transactions.map((tx) => {
      const { localId, ...rest } = tx
      void localId
      return rest as AiTransaction
    })
  }

  try {
    const { data } = await AiService.predictMonthlyExpenses(payload)
    prediction.value = data
  } catch (err) {
    error.value = t('ai.monthly_prediction.error_forecast')
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

.transaction-row {
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
}
</style>
