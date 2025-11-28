<template>
  <section class="ai-card">
    <header>
      <h2>Detecção de Anomalias</h2>
      <p>Envie as despesas recentes para identificar gastos fora do padrão.</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        Sensibilidade
        <input v-model.number="sensitivity" type="number" min="0.5" max="3" step="0.1" />
      </label>

      <div class="transactions">
        <div class="transactions__header">
          <h3>Despesas</h3>
          <button type="button" class="ghost" @click="addTransaction">+ Adicionar</button>
        </div>
        <div v-if="!transactions.length" class="empty">Inclua despesas para análise.</div>
        <div v-for="(tx, index) in transactions" :key="tx.localId" class="transaction-row">
          <input v-model="tx.description" placeholder="Descrição" required />
          <input v-model.number="tx.amount" type="number" min="0" step="0.01" placeholder="Valor" required />
          <input v-model="tx.date" type="date" required />
          <button type="button" class="danger" @click="removeTransaction(index)">x</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Processando...' : 'Detectar anomalias' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="response" class="results">
      <h3>Resumo</h3>
      <ul>
        <li>Total analisado: {{ response.summary.totalTransactionsAnalyzed }}</li>
        <li>Anomalias: {{ response.summary.anomaliesCount }}</li>
        <li>Valor anômalo: {{ formatCurrency(response.summary.totalAnomalousAmount) }}</li>
      </ul>

      <table v-if="response.anomalies.length">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Desvio</th>
            <th>Severidade</th>
            <th>Sugestão</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in response.anomalies" :key="item.expense.id || item.expense.description">
            <td>{{ item.expense.date || '—' }}</td>
            <td>{{ item.expense.description || 'Sem descrição' }}</td>
            <td>{{ formatCurrency(item.expense.amount) }}</td>
            <td>{{ item.deviation.toFixed(2) }}</td>
            <td>
              <span :class="['chip', item.severity]">{{ item.severity }}</span>
            </td>
            <td>{{ item.suggestion || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">Sem dados suficientes ou sem anomalias.</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AiService from '../../services/aiService'
import type { AiTransaction, AnomalyDetectionResponse } from '../../services/aiService'

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
    error.value = 'Adicione despesas para análise.'
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
    error.value = 'Não foi possível detectar anomalias agora.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.high { background: #fee2e2; color: #b91c1c; }
.chip.medium { background: #ffedd5; color: #9a3412; }
</style>
