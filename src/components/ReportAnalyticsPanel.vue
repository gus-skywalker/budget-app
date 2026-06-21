<template>
  <section class="report-analytics">
    <div class="report-analytics__toolbar">
      <div>
        <span class="report-analytics__eyebrow">{{ t('reportAnalytics.eyebrow') }}</span>
        <h2>{{ t('reportAnalytics.title') }}</h2>
      </div>
      <v-select
        v-model="selectedPeriod"
        :items="periodOptions"
        item-title="label"
        item-value="value"
        density="comfortable"
        variant="outlined"
        hide-details
        class="report-analytics__period"
      />
    </div>

    <div class="report-analytics__hero">
      <div class="report-analytics__metric">
        <span>{{ t('reportAnalytics.totalSpent') }}</span>
        <strong>{{ formatMoney(summary.expenses) }}</strong>
        <small :class="comparisonClass">
          {{ comparisonLabel }}
        </small>
      </div>
      <div class="report-analytics__metric report-analytics__metric--compact">
        <span>{{ t('reportAnalytics.income') }}</span>
        <strong>{{ formatMoney(summary.income) }}</strong>
      </div>
      <div class="report-analytics__metric report-analytics__metric--compact">
        <span>{{ t('reportAnalytics.partialResult') }}</span>
        <strong :class="summary.net >= 0 ? 'is-positive' : 'is-negative'">{{ formatMoney(summary.net) }}</strong>
      </div>
    </div>

    <div v-if="isLoading" class="report-analytics__loading">
      <v-progress-circular indeterminate color="var(--cb-primary)" size="34" />
    </div>

    <div v-else class="report-analytics__grid">
      <article class="report-panel report-panel--categories">
        <div class="report-panel__header">
          <div>
            <h3>{{ t('reportAnalytics.categorySpend') }}</h3>
            <p>{{ t('reportAnalytics.categorySpendSubtitle') }}</p>
          </div>
        </div>

        <div v-if="categoryRows.length" class="category-chart">
          <div class="category-chart__donut" :style="{ background: donutGradient }">
            <div class="category-chart__hole">
              <span>{{ categoryRows.length }}</span>
              <small>{{ t('reportAnalytics.categories') }}</small>
            </div>
          </div>
          <div class="category-chart__legend">
            <div v-for="row in categoryRows.slice(0, 7)" :key="row.key" class="category-chart__row">
              <span class="category-chart__swatch" :style="{ background: row.color }"></span>
              <span class="category-chart__name">{{ row.label }}</span>
              <strong>{{ formatMoney(row.amount) }}</strong>
            </div>
          </div>
        </div>
        <p v-else class="report-analytics__empty">{{ t('reportAnalytics.noExpenses') }}</p>
      </article>

      <article class="report-panel report-panel--result">
        <div class="report-panel__header">
          <div>
            <h3>{{ t('reportAnalytics.resultTitle') }}</h3>
            <p>{{ t('reportAnalytics.resultSubtitle') }}</p>
          </div>
        </div>

        <div class="result-meter">
          <div class="result-meter__track">
            <span class="result-meter__income" :style="{ width: `${incomeShare}%` }"></span>
            <span class="result-meter__expense" :style="{ width: `${expenseShare}%` }"></span>
          </div>
          <div class="result-meter__labels">
            <div>
              <span>{{ t('reportAnalytics.income') }}</span>
              <strong>{{ formatMoney(summary.income) }}</strong>
            </div>
            <div>
              <span>{{ t('reportAnalytics.expenses') }}</span>
              <strong>{{ formatMoney(summary.expenses) }}</strong>
            </div>
            <div>
              <span>{{ t('reportAnalytics.excluded') }}</span>
              <strong>{{ formatMoney(summary.excluded) }}</strong>
            </div>
          </div>
        </div>
      </article>
    </div>

    <article v-if="!isLoading" class="report-panel report-panel--flow">
      <div class="report-panel__header">
        <div>
          <h3>{{ t('reportAnalytics.flowTitle') }}</h3>
          <p>{{ t('reportAnalytics.flowSubtitle') }}</p>
        </div>
      </div>

      <div v-if="categoryRows.length" class="flow-map">
        <div class="flow-map__source">
          <span>{{ t('reportAnalytics.income') }}</span>
          <strong>{{ formatMoney(summary.income) }}</strong>
        </div>
        <div class="flow-map__middle">
          <span>{{ t('reportAnalytics.expenses') }}</span>
          <strong>{{ formatMoney(summary.expenses) }}</strong>
        </div>
        <div class="flow-map__destinations">
          <div v-for="row in categoryRows.slice(0, 8)" :key="`flow-${row.key}`" class="flow-map__row">
            <div class="flow-map__label">
              <span>{{ row.label }}</span>
              <strong>{{ formatMoney(row.amount) }}</strong>
            </div>
            <div class="flow-map__bar">
              <span :style="{ width: `${row.share}%`, background: row.color }"></span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="report-analytics__empty">{{ t('reportAnalytics.noFlow') }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FinancialReadService from '@/services/FinancialReadService'
import type { TransactionView } from '@/types/financialRead'

type PeriodKey = 'week' | 'month' | 'lastMonth' | 'threeMonths' | 'sixMonths' | 'twelveMonths' | 'year'

const { t, locale } = useI18n()
const selectedPeriod = ref<PeriodKey>('month')
const isLoading = ref(false)
const transactions = ref<TransactionView[]>([])
const previousTransactions = ref<TransactionView[]>([])

const periodOptions = computed(() => [
  { value: 'week', label: t('reportAnalytics.periods.week') },
  { value: 'month', label: t('reportAnalytics.periods.month') },
  { value: 'lastMonth', label: t('reportAnalytics.periods.lastMonth') },
  { value: 'threeMonths', label: t('reportAnalytics.periods.threeMonths') },
  { value: 'sixMonths', label: t('reportAnalytics.periods.sixMonths') },
  { value: 'twelveMonths', label: t('reportAnalytics.periods.twelveMonths') },
  { value: 'year', label: t('reportAnalytics.periods.year') },
])

const colors = ['#647da8', '#08b6b3', '#ff2d2d', '#f57c00', '#bf2de2', '#0b87ef', '#4d46e8', '#12819a', '#26c561', '#ef4444']

const toIsoDate = (date: Date) => date.toISOString().split('T')[0]

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addMonths = (date: Date, months: number) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

const resolveRange = (period: PeriodKey, reference = new Date()) => {
  const today = startOfDay(reference)
  if (period === 'week') {
    return { fromDate: toIsoDate(addDays(today, -6)), toDate: toIsoDate(today) }
  }
  if (period === 'lastMonth') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const last = new Date(today.getFullYear(), today.getMonth(), 0)
    return { fromDate: toIsoDate(first), toDate: toIsoDate(last) }
  }
  if (period === 'threeMonths') {
    return { fromDate: toIsoDate(addMonths(today, -3)), toDate: toIsoDate(today) }
  }
  if (period === 'sixMonths') {
    return { fromDate: toIsoDate(addMonths(today, -6)), toDate: toIsoDate(today) }
  }
  if (period === 'twelveMonths') {
    return { fromDate: toIsoDate(addMonths(today, -12)), toDate: toIsoDate(today) }
  }
  if (period === 'year') {
    return { fromDate: toIsoDate(new Date(today.getFullYear(), 0, 1)), toDate: toIsoDate(today) }
  }
  return { fromDate: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)), toDate: toIsoDate(today) }
}

const previousRange = (period: PeriodKey) => {
  const current = resolveRange(period)
  const start = new Date(`${current.fromDate}T00:00:00`)
  const end = new Date(`${current.toDate}T00:00:00`)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  const previousEnd = addDays(start, -1)
  const previousStart = addDays(previousEnd, -(days - 1))
  return { fromDate: toIsoDate(previousStart), toDate: toIsoDate(previousEnd) }
}

const fetchRangeTransactions = async (fromDate: string, toDate: string) => {
  const items: TransactionView[] = []
  let offset = 0
  const limit = 200
  while (true) {
    const { data } = await FinancialReadService.fetchTransactions({ fromDate, toDate, limit, offset })
    items.push(...(data.items || []))
    offset += data.items?.length || 0
    if (!data.items?.length || offset >= data.total || items.length >= 1200) {
      break
    }
  }
  return items
}

const loadAnalytics = async () => {
  isLoading.value = true
  try {
    const current = resolveRange(selectedPeriod.value)
    const previous = previousRange(selectedPeriod.value)
    const [currentItems, previousItems] = await Promise.all([
      fetchRangeTransactions(current.fromDate, current.toDate),
      fetchRangeTransactions(previous.fromDate, previous.toDate),
    ])
    transactions.value = currentItems
    previousTransactions.value = previousItems
  } finally {
    isLoading.value = false
  }
}

const amountFor = (item: TransactionView) => Math.abs(Number(item.amount || 0))

const summarize = (items: TransactionView[]) => items.reduce((acc, item) => {
  const amount = amountFor(item)
  if (item.excludedFromPlanning) {
    acc.excluded += amount
    return acc
  }
  if (item.direction === 'INFLOW') acc.income += amount
  if (item.direction === 'OUTFLOW') acc.expenses += amount
  acc.net = acc.income - acc.expenses
  return acc
}, { income: 0, expenses: 0, net: 0, excluded: 0 })

const summary = computed(() => summarize(transactions.value))
const previousSummary = computed(() => summarize(previousTransactions.value))

const comparisonPercent = computed(() => {
  if (!previousSummary.value.expenses) return null
  return ((summary.value.expenses - previousSummary.value.expenses) / previousSummary.value.expenses) * 100
})

const comparisonClass = computed(() => {
  const value = comparisonPercent.value
  if (value === null || Math.abs(value) < 0.01) return 'is-neutral'
  return value > 0 ? 'is-negative' : 'is-positive'
})

const comparisonLabel = computed(() => {
  const value = comparisonPercent.value
  if (value === null) return t('reportAnalytics.noComparison')
  const prefix = value > 0 ? '+' : ''
  return t('reportAnalytics.comparison', { value: `${prefix}${value.toFixed(1)}%` })
})

const categoryRows = computed(() => {
  const totals = new Map<string, { label: string; amount: number; color: string }>()
  transactions.value
    .filter((item) => item.direction === 'OUTFLOW' && !item.excludedFromPlanning)
    .forEach((item) => {
      const key = item.categoryCode || item.categoryName || item.category || 'uncategorized'
      const label = item.categoryName || item.category || t('expenseItem.uncategorized')
      const current = totals.get(key) || {
        label,
        amount: 0,
        color: item.categoryDisplayColor || colors[totals.size % colors.length],
      }
      current.amount += amountFor(item)
      totals.set(key, current)
    })

  const total = Array.from(totals.values()).reduce((sum, item) => sum + item.amount, 0)
  return Array.from(totals.entries())
    .map(([key, item]) => ({
      key,
      ...item,
      share: total ? Math.max(2, (item.amount / total) * 100) : 0,
    }))
    .sort((left, right) => right.amount - left.amount)
})

const donutGradient = computed(() => {
  if (!categoryRows.value.length) {
    return 'conic-gradient(var(--cb-border-soft) 0deg 360deg)'
  }
  let cursor = 0
  const segments = categoryRows.value.map((row) => {
    const start = cursor
    const size = (row.amount / Math.max(summary.value.expenses, 1)) * 360
    cursor += size
    return `${row.color} ${start}deg ${cursor}deg`
  })
  return `conic-gradient(${segments.join(', ')})`
})

const incomeShare = computed(() => {
  const total = summary.value.income + summary.value.expenses
  return total ? (summary.value.income / total) * 100 : 50
})

const expenseShare = computed(() => {
  const total = summary.value.income + summary.value.expenses
  return total ? (summary.value.expenses / total) * 100 : 50
})

const localeCode = computed(() => {
  if (locale.value === 'pt') return 'pt-BR'
  if (locale.value === 'en') return 'en-US'
  return locale.value
})

const formatMoney = (value: number) => new Intl.NumberFormat(localeCode.value, {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0))

watch(selectedPeriod, loadAnalytics)
onMounted(loadAnalytics)
</script>

<style scoped>
.report-analytics {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.report-analytics__toolbar,
.report-analytics__hero,
.report-panel {
  background: var(--cb-surface-card);
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  box-shadow: var(--cb-shadow-soft);
}

.report-analytics__toolbar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px 18px;
}

.report-analytics__eyebrow {
  color: var(--cb-ink-muted);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.report-analytics__toolbar h2,
.report-panel__header h3 {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  letter-spacing: 0;
  margin: 0;
}

.report-analytics__period {
  max-width: 220px;
}

.report-analytics__hero {
  display: grid;
  gap: 12px;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 24px;
}

.report-analytics__metric {
  display: grid;
  gap: 6px;
}

.report-analytics__metric span,
.report-panel__header p,
.result-meter__labels span {
  color: var(--cb-ink-muted);
  font-size: 0.82rem;
}

.report-analytics__metric strong {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 2.7rem;
  font-weight: 500;
  letter-spacing: 0;
}

.report-analytics__metric--compact strong {
  font-size: 1.6rem;
}

.report-analytics__metric small {
  font-weight: 800;
}

.is-positive {
  color: var(--cb-positive) !important;
}

.is-negative {
  color: var(--cb-risk) !important;
}

.is-neutral {
  color: var(--cb-ink-muted) !important;
}

.report-analytics__loading {
  align-items: center;
  background: var(--cb-surface-card);
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  min-height: 220px;
}

.report-analytics__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
}

.report-panel {
  padding: 18px;
}

.report-panel__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.report-panel__header p {
  margin: 4px 0 0;
}

.category-chart {
  align-items: center;
  display: grid;
  gap: 24px;
  grid-template-columns: 260px minmax(0, 1fr);
}

.category-chart__donut {
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  width: 100%;
}

.category-chart__hole {
  align-items: center;
  background: var(--cb-surface-card);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  height: 56%;
  justify-content: center;
  width: 56%;
}

.category-chart__hole span {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1.4rem;
  font-weight: 800;
}

.category-chart__hole small {
  color: var(--cb-ink-muted);
}

.category-chart__legend {
  display: grid;
  gap: 10px;
}

.category-chart__row {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 14px minmax(0, 1fr) auto;
}

.category-chart__swatch {
  border-radius: 999px;
  height: 14px;
  width: 14px;
}

.category-chart__name {
  color: var(--cb-ink-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-chart__row strong,
.result-meter__labels strong,
.flow-map strong {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
}

.result-meter {
  display: grid;
  gap: 26px;
  padding-top: 18px;
}

.result-meter__track {
  background: var(--cb-border-soft);
  border-radius: 999px;
  display: flex;
  height: 12px;
  overflow: hidden;
}

.result-meter__income {
  background: var(--cb-primary);
}

.result-meter__expense {
  background: color-mix(in srgb, var(--cb-risk) 70%, var(--cb-surface-card));
}

.result-meter__labels {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}

.result-meter__labels div {
  display: grid;
  gap: 6px;
}

.flow-map {
  align-items: stretch;
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(160px, 0.35fr) minmax(160px, 0.35fr) minmax(0, 1fr);
}

.flow-map__source,
.flow-map__middle {
  border-left: 10px solid var(--cb-positive);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 16px;
}

.flow-map__middle {
  border-left-color: var(--cb-risk);
}

.flow-map__source span,
.flow-map__middle span,
.flow-map__label span {
  color: var(--cb-primary);
  font-weight: 800;
}

.flow-map__destinations {
  display: grid;
  gap: 12px;
}

.flow-map__row {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(160px, 0.35fr) minmax(0, 1fr);
}

.flow-map__label {
  display: grid;
  justify-items: end;
}

.flow-map__bar {
  background: color-mix(in srgb, var(--cb-border-soft) 70%, transparent);
  border-radius: 999px;
  height: 22px;
  overflow: hidden;
}

.flow-map__bar span {
  border-radius: inherit;
  display: block;
  height: 100%;
}

.report-analytics__empty {
  color: var(--cb-ink-muted);
  margin: 0;
}

@media (max-width: 960px) {
  .report-analytics__hero,
  .report-analytics__grid,
  .category-chart,
  .flow-map {
    grid-template-columns: 1fr;
  }

  .flow-map__label {
    justify-items: start;
  }
}

@media (max-width: 640px) {
  .report-analytics__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .report-analytics__period {
    max-width: none;
  }

  .report-analytics__metric strong {
    font-size: 2rem;
  }

  .result-meter__labels,
  .flow-map__row {
    grid-template-columns: 1fr;
  }
}
</style>
