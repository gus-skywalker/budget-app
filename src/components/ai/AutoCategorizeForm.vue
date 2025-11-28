<template>
  <section class="ai-card">
    <header>
      <h2>Classificação Automática</h2>
      <p>Descreva as despesas e receba sugestões de categoria com confiança.</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <div class="transactions">
        <div class="transactions__header">
          <h3>Despesas para sugerir</h3>
          <button type="button" class="ghost" @click="addExpense">+ Adicionar</button>
        </div>
        <div v-if="!expenses.length" class="empty">Informe ao menos uma despesa.</div>
        <div v-for="(expense, index) in expenses" :key="expense.localId" class="transaction-row">
          <input v-model="expense.description" placeholder="Descrição" required />
          <input v-model.number="expense.amount" type="number" min="0" step="0.01" placeholder="Valor" required />
          <input v-model.number="expense.paymentMethodId" type="number" min="0" placeholder="Pagamento" />
          <button type="button" class="danger" @click="removeExpense(index)">x</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Consultando...' : 'Obter sugestões' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="suggestions.length" class="results">
      <h3>Sugestões</h3>
      <article v-for="item in suggestions" :key="item.expenseId" class="suggestion-card">
        <h4>{{ item.expenseId || 'Despesa' }}</h4>
        <p>
          Categoria sugerida: <strong>{{ item.suggestedCategory.name }}</strong>
          ({{ (item.suggestedCategory.confidence * 100).toFixed(0) }}%)
        </p>
        <p>Alternativas:</p>
        <ul>
          <li v-for="alt in item.alternativeCategories" :key="alt.id">
            {{ alt.name }} - {{ (alt.confidence * 100).toFixed(0) }}%
          </li>
        </ul>
        <small>{{ item.reasoning }}</small>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import AiService from '../../services/aiService'
import type { AutoCategorizeExpenseInput, AutoCategorizeResponse } from '../../services/aiService'

interface UiExpense extends AutoCategorizeExpenseInput {
  localId: string
}

const expenses = reactive<UiExpense[]>([])
const isLoading = ref(false)
const error = ref('')
const suggestions = ref<AutoCategorizeResponse['suggestions']>([])

const addExpense = () => {
  expenses.push({
    localId: crypto.randomUUID(),
    amount: 0,
    description: ''
  })
}

const removeExpense = (index: number) => {
  expenses.splice(index, 1)
}

const handleSubmit = async () => {
  if (!expenses.length) {
    error.value = 'Inclua pelo menos uma despesa.'
    return
  }
  if (expenses.some((expense) => !expense.description || expense.amount <= 0)) {
    error.value = 'Descreva e informe o valor de todas as despesas.'
    return
  }

  error.value = ''
  isLoading.value = true
  suggestions.value = []

  const payload = {
    expenses: expenses.map((expense) => {
      const { localId, ...rest } = expense
      void localId
      return rest as AutoCategorizeExpenseInput
    })
  }

  try {
    const { data } = await AiService.autoCategorize(payload)
    suggestions.value = data.suggestions
  } catch (err) {
    error.value = 'Falha ao obter sugestões.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import './styles.css';

.suggestion-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
</style>
