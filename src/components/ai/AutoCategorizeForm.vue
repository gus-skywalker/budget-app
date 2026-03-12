<template>
  <section class="ai-card">
    <header>
      <h2>{{ t('ai.auto_categorize.title') }}</h2>
      <p>{{ t('ai.auto_categorize.description') }}</p>
    </header>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <div class="transactions">
        <div class="transactions__header">
          <h3>{{ t('ai.auto_categorize.expenses_to_suggest') }}</h3>
          <button type="button" class="ghost" @click="addExpense">+ {{ t('ai.common.add') }}</button>
        </div>
        <div v-if="!expenses.length" class="empty">{{ t('ai.auto_categorize.empty_expenses') }}</div>
        <div v-for="(expense, index) in expenses" :key="expense.localId" class="transaction-row">
          <input v-model="expense.description" :placeholder="t('common.description')" required />
          <input v-model.number="expense.amount" type="number" min="0" step="0.01" :placeholder="t('common.amount')" required />
          <input v-model.number="expense.paymentMethodId" type="number" min="0" :placeholder="t('common.payment_method')" />
          <button type="button" class="danger" @click="removeExpense(index)">x</button>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">{{ isLoading ? t('ai.common.loading') : t('ai.auto_categorize.submit') }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="suggestions.length" class="results">
      <h3>{{ t('ai.auto_categorize.suggestions') }}</h3>
      <article v-for="item in suggestions" :key="item.expenseId" class="suggestion-card">
        <h4>{{ item.expenseId || t('ai.auto_categorize.expense') }}</h4>
        <p>
          {{ t('ai.auto_categorize.suggested_category') }}: <strong>{{ item.suggestedCategory.name }}</strong>
          ({{ (item.suggestedCategory.confidence * 100).toFixed(0) }}%)
        </p>
        <p>{{ t('ai.auto_categorize.alternatives') }}:</p>
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
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import type { AutoCategorizeExpenseInput, AutoCategorizeResponse } from '../../services/aiService'

const { t } = useI18n()

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
    error.value = t('ai.auto_categorize.error_add_expense')
    return
  }
  if (expenses.some((expense) => !expense.description || expense.amount <= 0)) {
    error.value = t('ai.auto_categorize.error_fill_expenses')
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
    error.value = t('ai.auto_categorize.error_suggestions')
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
