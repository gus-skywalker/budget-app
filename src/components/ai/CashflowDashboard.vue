<template>
  <section class="ai-card">
    <header>
      <h2>Fluxo de Caixa</h2>
      <p>Visualize o saldo atual e a projeção dos próximos meses.</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        Meses
        <input v-model.number="months" type="number" min="1" max="12" />
      </label>

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Consultando...' : 'Atualizar' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="insights" class="results">
      <div class="metrics">
        <article>
          <h4>Saldo atual</h4>
          <strong>{{ formatCurrency(insights.currentBalance) }}</strong>
        </article>
        <article>
          <h4>Média mensal</h4>
          <strong>{{ formatCurrency(insights.averageMonthlyBalance) }}</strong>
        </article>
      </div>

      <p class="insight" v-for="text in insights.insights" :key="text">{{ text }}</p>

      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Receita</th>
            <th>Despesas</th>
            <th>Saldo projetado</th>
            <th>Status</th>
            <th>Alertas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in insights.forecast" :key="row.month">
            <td>{{ row.month }}</td>
            <td>{{ formatCurrency(row.predictedIncome) }}</td>
            <td>{{ formatCurrency(row.predictedExpenses) }}</td>
            <td>{{ formatCurrency(row.projectedBalance) }}</td>
            <td>
              <span :class="['chip', row.status]">{{ row.status }}</span>
            </td>
            <td>
              <div v-if="row.alert">
                <p>{{ row.alert.message }}</p>
                <small v-for="suggestion in row.alert.suggestions" :key="suggestion">• {{ suggestion }}</small>
              </div>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiService from '../../services/aiService'
import type { CashflowInsightsResponse } from '../../services/aiService'

const months = ref(6)
const isLoading = ref(false)
const error = ref('')
const insights = ref<CashflowInsightsResponse | null>(null)

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const { data } = await AiService.getCashflowInsights({
      months: months.value
    })
    insights.value = data
  } catch (err) {
    error.value = 'Falha ao buscar fluxo de caixa.'
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

.chip {
  border-radius: 999px;
  padding: 0.15rem 0.75rem;
  text-transform: capitalize;
  font-weight: 600;
}

.chip.surplus { background: #dcfce7; color: #15803d; }
.chip.deficit { background: #fee2e2; color: #b91c1c; }
</style>
