<template>
  <section class="report-analytics">
    <div class="report-analytics__toolbar">
      <div>
        <span class="report-analytics__eyebrow">{{ t('reportAnalytics.eyebrow') }}</span>
        <h2>{{ t('reportAnalytics.title') }}</h2>
      </div>
      <v-select v-model="selectedPeriod" :items="periodOptions" item-title="label" item-value="value"
        density="comfortable" variant="outlined" hide-details class="report-analytics__period" />
    </div>

    <v-alert v-if="loadError" type="error" variant="tonal" closable @click:close="loadError = false">
      {{ t('reportAnalytics.loadError') }}
    </v-alert>

    <div class="report-analytics__hero">
      <div class="report-analytics__metric">
        <span>{{ t('reportAnalytics.totalSpent') }}</span>
        <strong>{{ formatMoney(summary.expenses) }}</strong>
        <small :class="comparisonClass">{{ comparisonLabel }}</small>
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

    <template v-else>
      <div class="report-analytics__grid">
        <article class="report-panel report-panel--categories">
          <div class="report-panel__header">
            <div>
              <h3>{{ t('reportAnalytics.categorySpend') }}</h3>
              <p>{{ t('reportAnalytics.categorySpendSubtitle') }}</p>
            </div>
          </div>

          <div v-if="categoryRows.length" class="category-chart">
            <div class="category-chart__donut" :style="{ background: donutGradient }" aria-hidden="true">
              <div class="category-chart__hole">
                <span>{{ categoryRows.length }}</span>
                <small>{{ t('reportAnalytics.categories') }}</small>
              </div>
            </div>
            <div class="category-chart__legend">
              <button v-for="row in visibleCategoryRows" :key="row.key" type="button"
                class="category-chart__row category-chart__row--interactive" @click="openDrillDown(row)">
                <span class="category-chart__swatch" :style="{ background: row.color }"></span>
                <span class="category-chart__name">
                  <strong>{{ row.label }}</strong>
                  <small>{{ t('reportAnalytics.transactionCount', { count: row.transactionCount }) }} · {{ formatPercent(row.share) }}</small>
                </span>
                <strong class="category-chart__amount">{{ formatMoney(row.amount) }}</strong>
                <v-icon size="18">mdi-chevron-right</v-icon>
              </button>
              <v-btn v-if="categoryRows.length > initialCategoryLimit" variant="text" size="small"
                @click="showAllCategories = !showAllCategories">
                {{ showAllCategories ? t('reportAnalytics.showLess') : t('reportAnalytics.showAll', { count: categoryRows.length }) }}
              </v-btn>
            </div>
          </div>
          <p v-else class="report-analytics__empty">{{ t('reportAnalytics.noCategorizedExpenses') }}</p>
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
              <div><span>{{ t('reportAnalytics.income') }}</span><strong>{{ formatMoney(summary.income) }}</strong></div>
              <div><span>{{ t('reportAnalytics.expenses') }}</span><strong>{{ formatMoney(summary.expenses) }}</strong></div>
              <div><span>{{ t('reportAnalytics.excluded') }}</span><strong>{{ formatMoney(summary.excluded) }}</strong></div>
            </div>
          </div>
        </article>
      </div>

      <article v-if="uncategorizedRow" class="report-panel uncategorized-card">
        <div>
          <span class="uncategorized-card__eyebrow">{{ t('reportAnalytics.pendingReview') }}</span>
          <h3>{{ t('reportAnalytics.uncategorized') }}</h3>
          <p>{{ t('reportAnalytics.uncategorizedDescription') }}</p>
        </div>
        <div class="uncategorized-card__metric">
          <strong>{{ formatMoney(uncategorizedRow.amount) }}</strong>
          <span>{{ t('reportAnalytics.transactionCount', { count: uncategorizedRow.transactionCount }) }} · {{ formatPercent(uncategorizedRow.share) }}</span>
        </div>
        <v-btn color="primary" variant="flat" @click="openDrillDown(uncategorizedRow)">
          {{ t('reportAnalytics.reviewTransactions') }}
        </v-btn>
      </article>
    </template>

    <v-dialog v-model="drillDownOpen" :fullscreen="mobile" max-width="760" scrollable>
      <v-card class="drill-down">
        <v-card-title class="drill-down__header">
          <div>
            <small>{{ periodLabel }}</small>
            <h3>{{ selectedCategory?.label }}</h3>
            <p>{{ formatMoney(selectedCategory?.amount || 0) }} · {{ t('reportAnalytics.transactionCount', { count: drillDownTotal }) }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" :aria-label="t('common.close')" @click="drillDownOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="drillDownLoading" class="report-analytics__loading"><v-progress-circular indeterminate /></div>
          <v-alert v-else-if="drillDownError" type="error" variant="tonal">{{ t('reportAnalytics.drillDownError') }}</v-alert>
          <div v-else-if="drillDownItems.length" class="drill-down__list">
            <article v-for="item in drillDownItems" :key="item.id" class="drill-down__transaction">
              <div class="drill-down__transaction-main">
                <strong>{{ item.description }}</strong>
                <span>{{ formatDate(item.date) }} · {{ item.accountName || t('reportAnalytics.accountUnavailable') }}</span>
                <small>{{ categorizationSourceLabel(item.categorizationSource) }}</small>
              </div>
              <strong>{{ formatMoney(Math.abs(Number(item.amount))) }}</strong>
              <v-select :model-value="item.categoryId ?? null" :items="categoryOptions" item-title="label" item-value="id"
                :label="t('common.category')" density="compact" variant="outlined" hide-details clearable
                :loading="updatingTransactionId === item.id" :disabled="Boolean(updatingTransactionId) || !item.accountId"
                @update:model-value="updateTransactionCategory(item, $event)" />
            </article>
          </div>
          <p v-else class="report-analytics__empty">{{ t('reportAnalytics.noTransactionsInCategory') }}</p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="drill-down__footer">
          <v-btn v-if="canOpenTransactionsPage" variant="text" prepend-icon="mdi-open-in-new" @click="openTransactionsPage">
            {{ t('reportAnalytics.openTransactions') }}
          </v-btn>
          <v-spacer />
          <v-pagination v-if="drillDownPages > 1" v-model="drillDownPage" :length="drillDownPages" density="comfortable" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import DataService from '@/services/DataService'
import FinancialReadService from '@/services/FinancialReadService'
import ReportService, { type ReportAnalytics, type ReportCategoryAggregate } from '@/services/ReportService'
import type { TransactionRequest, TransactionView } from '@/types/financialRead'
import { localizeCategory } from '@/utils/categoryLocalization'

type PeriodKey = 'week' | 'month' | 'lastMonth' | 'threeMonths' | 'sixMonths' | 'twelveMonths' | 'year'

type CategoryRow = ReportCategoryAggregate & { key: string; label: string; color: string; share: number; uncategorized: boolean }

const { t, te, locale } = useI18n()
const router = useRouter()
const { mobile } = useDisplay()
const reportService = new ReportService()
const selectedPeriod = ref<PeriodKey>('month')
const isLoading = ref(false)
const loadError = ref(false)
const analytics = ref<ReportAnalytics | null>(null)
const previousAnalytics = ref<ReportAnalytics | null>(null)
const showAllCategories = ref(false)
const initialCategoryLimit = 7
const drillDownOpen = ref(false)
const drillDownLoading = ref(false)
const drillDownError = ref(false)
const drillDownItems = ref<TransactionView[]>([])
const drillDownTotal = ref(0)
const drillDownPage = ref(1)
const drillDownLimit = 12
const selectedCategory = ref<CategoryRow | null>(null)
const categories = ref<any[]>([])
const updatingTransactionId = ref<string | null>(null)
const warnedCategoryCodes = new Set<string>()

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

const loadAnalytics = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    const current = resolveRange(selectedPeriod.value)
    const previous = previousRange(selectedPeriod.value)
    const [currentResponse, previousResponse] = await Promise.all([
      reportService.analytics(current.fromDate, current.toDate),
      reportService.analytics(previous.fromDate, previous.toDate),
    ])
    analytics.value = currentResponse.data
    previousAnalytics.value = previousResponse.data
  } catch (error) {
    console.error('Failed to load report analytics', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

const summary = computed(() => analytics.value || { income: 0, expenses: 0, net: 0, excluded: 0 })

const comparisonPercent = computed(() => {
  if (!previousAnalytics.value?.expenses) return null
  return ((summary.value.expenses - previousAnalytics.value.expenses) / previousAnalytics.value.expenses) * 100
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

const localizedCategory = (category: ReportCategoryAggregate | any) => localizeCategory(category, {
  translate: (key) => t(key),
  hasTranslation: (key) => te(key),
  onMissingCode: (code) => {
    if (warnedCategoryCodes.has(code)) return
    warnedCategoryCodes.add(code)
    console.warn(`[reports] Missing localized category code: ${code}`)
  },
})

const toCategoryRow = (row: ReportCategoryAggregate, index: number, uncategorized = false): CategoryRow => ({
  ...row,
  key: uncategorized ? 'uncategorized' : String(row.categoryId ?? row.categoryCode ?? index),
  label: uncategorized ? t('reportAnalytics.uncategorized') : localizedCategory(row),
  color: row.displayColor || colors[index % colors.length],
  share: summary.value.expenses ? (Number(row.amount) / summary.value.expenses) * 100 : 0,
  uncategorized,
})

const categoryRows = computed(() => (analytics.value?.categories || []).map((row, index) => toCategoryRow(row, index)))
const visibleCategoryRows = computed(() => showAllCategories.value ? categoryRows.value : categoryRows.value.slice(0, initialCategoryLimit))
const uncategorizedRow = computed(() => analytics.value?.uncategorized ? toCategoryRow(analytics.value.uncategorized, 0, true) : null)

const donutGradient = computed(() => {
  if (!categoryRows.value.length) {
    return 'conic-gradient(var(--cb-border-soft) 0deg 360deg)'
  }
  const total = categoryRows.value.reduce((sum, row) => sum + Number(row.amount), 0)
  let cursor = 0
  const segments = categoryRows.value.map((row) => {
    const start = cursor
    const size = (row.amount / Math.max(total, 1)) * 360
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

const currentRange = computed(() => resolveRange(selectedPeriod.value))
const periodLabel = computed(() => {
  const { fromDate, toDate } = currentRange.value
  return t('reportAnalytics.periodLabel', { from: formatDate(fromDate), to: formatDate(toDate) })
})

const drillDownPages = computed(() => Math.ceil(drillDownTotal.value / drillDownLimit))
const canOpenTransactionsPage = computed(() => selectedPeriod.value === 'month' || selectedPeriod.value === 'lastMonth')
const categoryOptions = computed(() => categories.value
  .filter((category) => category.active !== false && (category.type || 'EXPENSE') === 'EXPENSE')
  .map((category) => ({ id: category.id, label: localizedCategory(category) })))

const loadCategories = async () => {
  if (categories.value.length) return
  const response = await DataService.listCategories()
  categories.value = response.data || []
}

const loadDrillDown = async () => {
  if (!selectedCategory.value) return
  drillDownLoading.value = true
  drillDownError.value = false
  try {
    const range = currentRange.value
    const response = await FinancialReadService.fetchTransactions({
      ...range,
      direction: 'OUTFLOW',
      excludedFromPlanning: false,
      visibilityScope: 'WORKSPACE',
      categoryId: selectedCategory.value.uncategorized ? undefined : selectedCategory.value.categoryId || undefined,
      uncategorized: selectedCategory.value.uncategorized ? true : undefined,
      limit: drillDownLimit,
      offset: (drillDownPage.value - 1) * drillDownLimit,
    })
    drillDownItems.value = response.data.items || []
    drillDownTotal.value = response.data.total || 0
  } catch (error) {
    console.error('Failed to load category drill-down', error)
    drillDownError.value = true
  } finally {
    drillDownLoading.value = false
  }
}

const openDrillDown = async (row: CategoryRow) => {
  selectedCategory.value = row
  drillDownPage.value = 1
  drillDownOpen.value = true
  await Promise.all([loadDrillDown(), loadCategories()])
}

const updateTransactionCategory = async (item: TransactionView, categoryId: number | null) => {
  if (!item.accountId) return
  updatingTransactionId.value = item.id
  try {
    const payload: TransactionRequest = {
      transactionDate: item.date,
      description: item.description,
      source: item.source || 'MANUAL',
      status: item.status === 'PENDING' || item.status === 'CANCELLED' ? item.status : 'POSTED',
      visibilityScope: item.visibilityScope === 'PRIVATE' ? 'PRIVATE' : 'WORKSPACE',
      entries: [{
        accountId: item.accountId,
        direction: item.direction,
        amount: Math.abs(Number(item.amount)),
        categoryId,
        paymentMethodId: item.paymentMethodId ?? null,
        paymentMethodName: item.paymentMethodName ?? null,
        categorizationSource: 'USER',
        categorizationReason: 'report-drilldown',
      }],
    }
    await FinancialReadService.updateTransaction(item.id, payload)
    await loadAnalytics()
    await loadDrillDown()
  } catch (error) {
    console.error('Failed to update category from report drill-down', error)
    drillDownError.value = true
  } finally {
    updatingTransactionId.value = null
  }
}

const openTransactionsPage = () => {
  const range = currentRange.value
  const start = new Date(`${range.fromDate}T00:00:00Z`)
  router.push({
    name: 'transactions',
    query: {
      month: String(start.getUTCMonth() + 1),
      year: String(start.getUTCFullYear()),
      ...(selectedCategory.value?.uncategorized
        ? { uncategorized: '1' }
        : {
            categoryId: String(selectedCategory.value?.categoryId || ''),
            category: selectedCategory.value?.categoryCode || selectedCategory.value?.label,
          }),
    },
  })
}

const localeCode = computed(() => {
  if (locale.value === 'pt') return 'pt-BR'
  if (locale.value === 'en') return 'en-US'
  return locale.value
})

const formatMoney = (value: number) => new Intl.NumberFormat(localeCode.value, {
  style: 'currency',
  currency: analytics.value?.currency || 'BRL',
}).format(Number(value || 0))

const formatPercent = (value: number) => new Intl.NumberFormat(localeCode.value, {
  style: 'percent', maximumFractionDigits: 1,
}).format(Number(value || 0) / 100)

const formatDate = (value: string) => new Intl.DateTimeFormat(localeCode.value, { dateStyle: 'medium', timeZone: 'UTC' })
  .format(new Date(`${value}T00:00:00Z`))

const categorizationSourceLabel = (source?: string | null) => {
  const normalized = String(source || 'UNKNOWN').toUpperCase()
  const key = `transactions.details.categorization_sources.${normalized}`
  return te(key) ? t(key) : t('transactions.details.categorization_sources.UNKNOWN')
}

watch(selectedPeriod, () => {
  showAllCategories.value = false
  drillDownOpen.value = false
  loadAnalytics()
})
watch(drillDownPage, loadDrillDown)
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
  grid-template-columns: 14px minmax(0, 1fr) auto 18px;
}

.category-chart__row--interactive {
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  padding: 8px;
  text-align: left;
  width: 100%;
}

.category-chart__row--interactive:hover,
.category-chart__row--interactive:focus-visible {
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
  outline: none;
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
  display: grid;
  gap: 2px;
}

.category-chart__name strong,
.category-chart__name small {
  white-space: normal;
}

.category-chart__name small {
  color: var(--cb-ink-muted);
  font-size: .75rem;
}

.category-chart__amount {
  max-width: 100%;
  text-align: right;
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

.uncategorized-card {
  align-items: center;
  border-left: 4px solid var(--cb-warning, #f59e0b);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.uncategorized-card h3,
.uncategorized-card p,
.drill-down__header h3,
.drill-down__header p {
  margin: 0;
}

.uncategorized-card p,
.uncategorized-card__metric span,
.drill-down__header small,
.drill-down__header p,
.drill-down__transaction span,
.drill-down__transaction small {
  color: var(--cb-ink-muted);
}

.uncategorized-card__eyebrow {
  color: var(--cb-warning, #b45309);
  font-size: .75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.uncategorized-card__metric {
  display: grid;
  text-align: right;
}

.drill-down__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
}

.drill-down__header h3 {
  white-space: normal;
}

.drill-down__list {
  display: grid;
  gap: 12px;
}

.drill-down__transaction {
  align-items: center;
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto minmax(190px, .65fr);
  padding: 14px;
  min-width: 0;
}

.drill-down {
  max-height: min(92vh, 900px);
  overflow: hidden;
}

.drill-down__transaction > strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: right;
}

.drill-down__transaction :deep(.v-select) {
  min-width: 0;
  width: 100%;
}

.drill-down__transaction-main {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.drill-down__transaction-main strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drill-down__footer {
  flex-wrap: wrap;
  padding: 12px 20px;
}

@media (max-width: 960px) {
  .report-analytics__hero,
  .report-analytics__grid,
  .category-chart,
  .flow-map,
  .uncategorized-card {
    grid-template-columns: 1fr;
  }

  .uncategorized-card__metric {
    text-align: left;
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

  .drill-down__transaction {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .category-chart__row {
    grid-template-columns: 14px minmax(0, 1fr) 18px;
  }

  .category-chart__amount {
    grid-column: 2 / -1;
    justify-self: start;
    text-align: left;
    white-space: normal;
  }

  .drill-down__transaction > strong {
    text-align: left;
  }
}
</style>
