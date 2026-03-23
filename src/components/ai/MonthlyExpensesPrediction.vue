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

    <div class="history-context">
      <strong>{{ t('ai.monthly_prediction.history_scope_title') }}</strong>
      <span>{{ t('ai.monthly_prediction.history_scope_description') }}</span>
    </div>

    <form class="ai-form" @submit.prevent="handleSubmit">
      <label>
        {{ t('ai.monthly_prediction.months_to_forecast') }}
        <input v-model.number="forecastMonths" type="number" min="1" max="12" />
      </label>

      <label>
        {{ t('ai.monthly_prediction.category_optional') }}
        <select v-model="selectedCategory">
          <option value="">{{ t('ai.monthly_prediction.all_categories') }}</option>
          <option v-for="category in categories" :key="category.id" :value="String(category.id)">
            {{ category.name }}
          </option>
        </select>
      </label>

      <p class="history-note">
        {{
          selectedCategoryLabel
            ? t('ai.monthly_prediction.scope_category', { category: selectedCategoryLabel })
            : t('ai.monthly_prediction.scope_all_categories')
        }}
      </p>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? t('ai.common.calculating') : t('ai.monthly_prediction.submit') }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <section v-if="prediction" class="results">
      <h3>{{ t('ai.monthly_prediction.result') }}</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">{{ t('ai.monthly_prediction.total_predicted') }}</span>
          <strong>{{ formatCurrency(prediction.totalPredicted) }}</strong>
        </div>
        <div v-if="historicalAverage > 0" class="summary-card">
          <span class="summary-label">{{ t('ai.monthly_prediction.historical_average') }}</span>
          <strong>{{ formatCurrency(historicalAverage) }}</strong>
        </div>
        <div v-if="prediction.modelAccuracy" class="summary-card">
          <span class="summary-label">{{ t('ai.monthly_prediction.estimated_accuracy') }}</span>
          <strong>{{ (prediction.modelAccuracy * 100).toFixed(1) }}%</strong>
        </div>
      </div>
      <p v-if="trendInsight" class="history-note">{{ trendInsight }}</p>
      <table>
        <thead>
          <tr>
            <th>{{ t('ai.monthly_prediction.month') }}</th>
            <th>{{ t('ai.monthly_prediction.category') }}</th>
            <th>{{ t('ai.monthly_prediction.predicted_amount') }}</th>
            <th>{{ t('ai.monthly_prediction.trend') }}</th>
            <th>{{ t('ai.monthly_prediction.confidence') }}</th>
            <th>{{ t('ai.monthly_prediction.range') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in prediction.predictions" :key="`${item.month}-${item.category?.id ?? 'all'}`">
            <td>{{ item.month }}</td>
            <td>{{ item.category?.name || t('ai.monthly_prediction.all_categories') }}</td>
            <td>{{ formatCurrency(item.predictedAmount) }}</td>
            <td>{{ trendLabel(item.trend) }}</td>
            <td>{{ (item.confidence * 100).toFixed(0) }}%</td>
            <td>{{ formatCurrency(item.minExpected || 0) }} - {{ formatCurrency(item.maxExpected || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AiService from '../../services/aiService'
import DataService from '../../services/DataService'
import type { MonthlyExpensesPredictionResponse } from '../../services/aiService'

interface CategoryOption {
  id: number
  code?: string
  name: string
}

interface TranslatedCategoryOption {
  code: string
  name: string
}

const { t, locale } = useI18n()

const forecastMonths = ref(3)
const selectedCategory = ref('')
const categories = ref<CategoryOption[]>([])
const isLoading = ref(false)
const error = ref('')
const prediction = ref<MonthlyExpensesPredictionResponse | null>(null)

const selectedCategoryLabel = computed(() =>
  categories.value.find((category) => String(category.id) === selectedCategory.value)?.name || ''
)

const historicalAverage = computed(() => prediction.value?.predictions?.[0]?.historicalAverage || 0)

const trendLabel = (trend?: string) => {
  if (trend === 'up') return t('ai.monthly_prediction.trend_up')
  if (trend === 'down') return t('ai.monthly_prediction.trend_down')
  return t('ai.monthly_prediction.trend_stable')
}

const trendInsight = computed(() => {
  const firstPrediction = prediction.value?.predictions?.[0]
  if (!firstPrediction) {
    return ''
  }

  const category = firstPrediction.category?.name || selectedCategoryLabel.value || t('ai.monthly_prediction.all_categories').toLowerCase()
  const trend = firstPrediction.trend || 'stable'

  if (trend === 'up') {
    return t('ai.monthly_prediction.trend_insight_up', { category })
  }
  if (trend === 'down') {
    return t('ai.monthly_prediction.trend_insight_down', { category })
  }
  return t('ai.monthly_prediction.trend_insight_stable', { category })
})

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const loadCategories = async () => {
  try {
    const [catalogResponse, translatedResponse] = await Promise.all([
      DataService.listCategories(),
      DataService.fetchCategories(locale.value),
    ])

    const catalog = Array.isArray(catalogResponse?.data) ? catalogResponse.data : []
    const translated = Array.isArray(translatedResponse?.data) ? translatedResponse.data : []
    const translatedByCode = new Map<string, TranslatedCategoryOption>(
      translated
        .filter((item: any) => item?.code)
        .map((item: any) => [String(item.code), { code: String(item.code), name: String(item.name || '') }])
    )

    const mergedCategories: CategoryOption[] = catalog
      .filter((item: any) => item?.id && item?.name)
      .map((item: any) => {
        const translatedMatch = item.code ? translatedByCode.get(String(item.code)) : null
        return {
          id: Number(item.id),
          code: item.code,
          name: translatedMatch?.name || item.name,
        }
      })
    categories.value = mergedCategories.sort((left: CategoryOption, right: CategoryOption) =>
      left.name.localeCompare(right.name, locale.value)
    )
  } catch (loadError) {
    console.error(loadError)
    categories.value = []
  }
}

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true
  prediction.value = null

  try {
    const { data } = await AiService.predictMonthlyExpenses({
      forecastMonths: forecastMonths.value,
      categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
    })
    prediction.value = data
  } catch (err) {
    error.value = t('ai.monthly_prediction.error_forecast')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCategories)
watch(locale, loadCategories)
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

.history-context {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0 1.25rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.06);
  color: #334155;
}

.history-note {
  margin: -0.5rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.summary-card {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.92);
}

.summary-label {
  color: #64748b;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
