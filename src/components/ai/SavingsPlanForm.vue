<template>
  <section class="ai-card">
    <header>
      <h2>Plano de Economia</h2>
      <p>Informe sua meta e receba recomendações automáticas.</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        Meta mensal (R$)
        <input v-model.number="goal" type="number" min="0" step="10" />
      </label>

      <label>
        Data alvo
        <input v-model="targetDate" type="date" />
      </label>

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Calculando...' : 'Gerar plano' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="plan" class="results">
      <h3>Resultado</h3>
      <p>{{ summaryText }}</p>
      <ul>
        <li>Economia recomendada: <strong>{{ formatCurrency(plan.recommendedMonthlySavings) }}</strong></li>
        <li>Saldo projetado: {{ formatCurrency(plan.projectedBalanceByTargetDate) }}</li>
        <li>Probabilidade de sucesso: {{ (plan.probabilityOfSuccess * 100).toFixed(0) }}%</li>
      </ul>

      <h4>Ações sugeridas</h4>
      <div class="actions">
        <article v-for="action in plan.actions" :key="action.id" class="action-card">
          <h5>{{ action.description }}</h5>
          <p>Impacto estimado: {{ formatCurrency(action.estimatedMonthlyImpact) }}</p>
          <p>Dificuldade: {{ action.difficultyLevel }}</p>
          <p>Confiança: {{ (action.confidence * 100).toFixed(0) }}%</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiService from '../../services/aiService'
import type { SavingsPlan } from '../../services/aiService'

const goal = ref<number | null>(200)
const targetDate = ref('')
const isLoading = ref(false)
const error = ref('')
const plan = ref<SavingsPlan | null>(null)
const summaryText = ref('')

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const handleSubmit = async () => {
  if (goal.value !== null && goal.value < 0) {
    error.value = 'Meta inválida.'
    return
  }

  error.value = ''
  isLoading.value = true
  plan.value = null

  const payload = {
    savingsGoalAmount: goal.value ?? undefined,
    targetDate: targetDate.value || undefined
  }

  try {
    const { data } = await AiService.getSavingsRecommendations(payload)
    plan.value = data.plan
    summaryText.value = data.summaryText || 'Plano gerado.'
  } catch (err) {
    error.value = 'Não foi possível gerar o plano agora.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.action-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
}
</style>
