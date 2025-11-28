<template>
  <section class="ai-card">
    <header>
      <h2>Previsão Mensal de Despesas</h2>
      <p>Envie suas transações para obter uma projeção dos próximos meses.</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        Meses para prever
        <input v-model.number="forecastMonths" type="number" min="1" max="12" />
      </label>

      <label>
        Categoria (opcional)
        <input v-model.number="categoryId" type="number" min="1" placeholder="123" />
      </label>

      <div class="transactions">
        <div class="transactions__header">
          <h3>Transações (apenas despesas)</h3>
          <button type="button" class="ghost" @click="addTransaction">+ Adicionar</button>
        </div>
        <div v-if="!transactions.length" class="empty">Adicione ao menos uma despesa.</div>
        <div v-for="(tx, index) in transactions" :key="tx.localId" class="transaction-row">
          <input v-model="tx.description" placeholder="Descrição" required />
          <input v-model.number="tx.amount" type="number" min="0" step="0.01" placeholder="Valor" required />
          <input v-model="tx.date" type="date" required />
          <select v-model="tx.currency">
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
          <button type="button" class="danger" @click="removeTransaction(index)">remover</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Calculando...' : 'Gerar Previsão' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="prediction" class="results">
      <h3>Resultado</h3>
      <p>Total previsto: <strong>{{ formatCurrency(prediction.totalPredicted) }}</strong></p>
      <p v-if="prediction.modelAccuracy">Acurácia estimada: {{ (prediction.modelAccuracy * 100).toFixed(1) }}%</p>
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Valor previsto</th>
            <th>Confiança</th>
            <th>Intervalo</th>
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
import AiService from '../../services/aiService'
import type { AiTransaction, MonthlyExpensesPredictionResponse } from '../../services/aiService'

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
    error.value = 'Adicione ao menos uma despesa.'
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
    error.value = 'Não foi possível gerar a previsão. Tente novamente.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.transaction-row {
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
}
</style>
