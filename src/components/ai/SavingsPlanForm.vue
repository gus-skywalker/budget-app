<template>
  <section class="ai-card">
    <header>
      <h2>{{ t('ai.savings_plan.title') }}</h2>
      <p>{{ t('ai.savings_plan.description') }}</p>
    </header>

    <div v-if="!goals.length" class="empty">
      {{ t('ai.savings_plan.empty_goals') }}
    </div>

    <div v-if="!enabled" class="locked-state">
      <p>{{ t('ai.common.ai_locked') }}</p>
      <button type="button" @click="$emit('upgrade')">{{ t('ai.common.upgrade_cta') }}</button>
    </div>

    <template v-else>
      <label>
        {{ t('ai.savings_plan.goal') }}
        <select v-model="selectedGoalId">
          <option value="">{{ t('ai.savings_plan.select_goal') }}</option>
          <option v-for="goal in goals" :key="goal.id" :value="goal.id">
            {{ goal.name }}
          </option>
        </select>
      </label>

      <div v-if="selectedGoal" class="goal-context">
        <p><strong>{{ t('ai.savings_plan.remaining_amount') }}:</strong> {{ formatCurrency(selectedGoal.remainingAmount ?? remainingAmount) }}</p>
        <p><strong>{{ t('ai.savings_plan.deadline') }}:</strong> {{ formatDate(selectedGoal.deadline) }}</p>
        <p><strong>{{ t('ai.savings_plan.monthly_target') }}:</strong> {{ formatCurrency(selectedGoal.suggestedContributionAmount ?? 0) }}</p>
      </div>

      <form class="ai-form" @submit.prevent="handleSubmit">
        <p class="context-note">{{ t('ai.savings_plan.context_note') }}</p>
        <button type="submit" :disabled="isLoading || !selectedGoal">
          {{ isLoading ? t('ai.common.calculating') : t('ai.savings_plan.submit') }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </template>

    <section v-if="plan" class="results">
      <h3>{{ t('ai.savings_plan.result') }}</h3>
      <p>{{ summaryText }}</p>
      <ul>
        <li>{{ t('ai.savings_plan.recommended_savings') }}: <strong>{{ formatCurrency(plan.recommendedMonthlySavings) }}</strong></li>
        <li>{{ t('ai.savings_plan.projected_balance') }}: {{ formatCurrency(plan.projectedBalanceByTargetDate) }}</li>
        <li>{{ t('ai.savings_plan.success_probability') }}: {{ (plan.probabilityOfSuccess * 100).toFixed(0) }}%</li>
      </ul>

      <h4>{{ t('ai.savings_plan.suggested_actions') }}</h4>
      <div class="actions">
        <article v-for="action in plan.actions" :key="action.id" class="action-card">
          <h5>{{ action.description }}</h5>
          <p>{{ t('ai.savings_plan.estimated_impact') }}: {{ formatCurrency(action.estimatedMonthlyImpact) }}</p>
          <p>{{ t('ai.savings_plan.difficulty') }}: {{ action.difficultyLevel }}</p>
          <p>{{ t('ai.monthly_prediction.confidence') }}: {{ (action.confidence * 100).toFixed(0) }}%</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import FinancialGoalService from '../../services/FinancialGoalService'
import type { SavingsPlan } from '../../services/aiService'

interface FinancialGoalLike {
  id: string
  name: string
  deadline: string
  targetAmount?: number
  initialAmount?: number
  remainingAmount?: number
  suggestedContributionAmount?: number
}

const { t, locale } = useI18n()

const props = withDefaults(defineProps<{ enabled?: boolean }>(), {
  enabled: true
})
defineEmits<{ (event: 'upgrade'): void }>()

const goals = ref<FinancialGoalLike[]>([])
const selectedGoalId = ref('')
const isLoading = ref(false)
const error = ref('')
const plan = ref<SavingsPlan | null>(null)
const summaryText = ref('')

const selectedGoal = computed(() => goals.value.find((goal) => goal.id === selectedGoalId.value) ?? null)

const remainingAmount = computed(() => {
  if (!selectedGoal.value) return 0
  if (typeof selectedGoal.value.remainingAmount === 'number') return selectedGoal.value.remainingAmount
  return Math.max(0, Number(selectedGoal.value.targetAmount || 0) - Number(selectedGoal.value.initialAmount || 0))
})

const formatCurrency = (value: number) =>
  value.toLocaleString(locale.value === 'en' ? 'en-US' : 'pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'pt-BR')
}

const loadGoals = async () => {
  try {
    const { data } = await FinancialGoalService.fetchFinancialGoals()
    goals.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    goals.value = []
  }
}

const handleSubmit = async () => {
  if (!props.enabled) {
    error.value = t('ai.common.ai_locked')
    return
  }
  if (!selectedGoal.value) {
    error.value = t('ai.savings_plan.error_select_goal')
    return
  }

  error.value = ''
  isLoading.value = true
  plan.value = null

  try {
    const { data } = await AiService.getSavingsRecommendations({
      savingsGoalAmount: remainingAmount.value || undefined,
      targetDate: selectedGoal.value.deadline || undefined,
    })
    plan.value = data.plan
    summaryText.value = data.summaryText || t('ai.savings_plan.generated')
  } catch (err) {
    error.value = t('ai.savings_plan.error_generate')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadGoals()
})
</script>

<style scoped>
@import './styles.css';

.goal-context {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background: rgba(102, 126, 234, 0.05);
}

.context-note {
  margin-bottom: 0.75rem;
  color: #667085;
}

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
