<template>
  <section class="daily-analysis" :class="{ 'daily-analysis--collapsed': !expanded }" aria-labelledby="daily-analysis-title">
    <header class="daily-analysis__header">
      <div class="daily-analysis__heading">
        <h2 id="daily-analysis-title" class="daily-analysis__title">{{ $t('expense.daily_report_title') }}</h2>
        <p class="daily-analysis__summary">
          {{ $t('expense.daily_report_window_total', { total: formatMoney(total) }) }}
        </p>
      </div>

      <div class="daily-analysis__actions">
        <button
          v-if="selectedDate"
          type="button"
          class="daily-analysis__clear"
          @click="$emit('clear-date')"
        >
          {{ $t('expense.daily_report_clear_day') }}
        </button>
        <button
          type="button"
          class="daily-analysis__toggle"
          :aria-expanded="expanded"
          aria-controls="daily-analysis-content"
          @click="expanded = !expanded"
        >
          {{ expanded ? $t('expense.daily_report_collapse') : $t('expense.daily_report_expand') }}
          <span aria-hidden="true">{{ expanded ? '−' : '+' }}</span>
        </button>
      </div>
    </header>

    <div v-if="expanded" id="daily-analysis-content" class="daily-analysis__content">
      <div v-if="loading" class="daily-analysis__state" role="status">
        {{ $t('expense.daily_report_loading') }}
      </div>
      <div v-else-if="error" class="daily-analysis__state daily-analysis__state--error" role="alert">
        <span>{{ $t('expense.daily_report_error') }}</span>
        <button type="button" @click="$emit('retry')">{{ $t('expense.daily_report_retry') }}</button>
      </div>
      <template v-else>
        <div class="daily-analysis__metrics" :aria-label="$t('expense.daily_report_metrics_label')">
          <div>
            <span>{{ $t('expense.daily_report_total_window') }}</span>
            <strong>{{ formatMoney(total) }}</strong>
          </div>
          <div>
            <span>{{ $t('expense.daily_report_average') }}</span>
            <strong>{{ formatMoney(average) }}</strong>
          </div>
          <div>
            <span>{{ $t('expense.daily_report_highest') }}</span>
            <strong>{{ highestDay ? formatMoney(highestDay.total) : formatMoney(0) }}</strong>
          </div>
        </div>

        <p v-if="!hasSpend" class="daily-analysis__empty">{{ $t('expense.daily_report_empty') }}</p>

        <div v-if="hasSpend" class="daily-analysis__chart-scroll">
          <div class="daily-analysis__chart" role="group" :aria-label="$t('expense.daily_report_chart_label')">
            <button
              v-for="day in rows"
              :key="day.date"
              type="button"
              class="daily-analysis__day"
              :class="{
                'daily-analysis__day--selected': selectedDate === day.date,
                'daily-analysis__day--highest': isHighest(day),
              }"
              :aria-pressed="selectedDate === day.date"
              :aria-label="dayAriaLabel(day)"
              @click="$emit('select-date', day.date)"
            >
              <span class="daily-analysis__value">{{ formatCompactMoney(day.total) }}</span>
              <span class="daily-analysis__bar-track" aria-hidden="true">
                <span class="daily-analysis__bar" :style="{ height: `${barHeight(day.total)}%` }"></span>
              </span>
              <span class="daily-analysis__date">{{ formatShortDate(day.date) }}</span>
              <span v-if="isHighest(day)" class="daily-analysis__highest-mark">
                {{ $t('expense.daily_report_highest_mark') }}
              </span>
              <span v-else class="daily-analysis__count">
                {{ $t('expense.daily_report_transaction_count', { count: day.count }) }}
              </span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DailyExpenseAnalysis',
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    selectedDate: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select-date', 'clear-date', 'retry'],
  data() {
    const mobile = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 720px)').matches
    return {
      expanded: !mobile,
    }
  },
  computed: {
    total() {
      return this.rows.reduce((sum, day) => sum + Number(day.total || 0), 0)
    },
    average() {
      return this.rows.length ? this.total / this.rows.length : 0
    },
    highestDay() {
      if (!this.rows.length) return null
      return this.rows.reduce((highest, day) => Number(day.total || 0) > Number(highest.total || 0) ? day : highest)
    },
    hasSpend() {
      return this.total > 0
    },
    maximum() {
      return Math.max(...this.rows.map((day) => Number(day.total || 0)), 0)
    },
  },
  methods: {
    localeCode() {
      const locale = this.$i18n?.locale || 'pt'
      return ({ pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR' })[locale] || locale
    },
    formatMoney(value) {
      return new Intl.NumberFormat(this.localeCode(), { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
    },
    formatCompactMoney(value) {
      return new Intl.NumberFormat(this.localeCode(), {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(Number(value || 0))
    },
    parseDate(value) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null
      const date = new Date(`${value}T00:00:00`)
      return Number.isNaN(date.getTime()) ? null : date
    },
    formatShortDate(value) {
      const date = this.parseDate(value)
      if (!date) return value
      return new Intl.DateTimeFormat(this.localeCode(), { weekday: 'short', day: '2-digit' }).format(date)
    },
    formatLongDate(value) {
      const date = this.parseDate(value)
      if (!date) return value
      return new Intl.DateTimeFormat(this.localeCode(), { dateStyle: 'full' }).format(date)
    },
    isHighest(day) {
      return this.maximum > 0 && Number(day.total || 0) === this.maximum
    },
    barHeight(value) {
      const amount = Number(value || 0)
      if (!amount || !this.maximum) return 0
      return Math.max((amount / this.maximum) * 100, 8)
    },
    dayAriaLabel(day) {
      return this.$t('expense.daily_report_day_aria', {
        date: this.formatLongDate(day.date),
        total: this.formatMoney(day.total),
        count: day.count,
        highest: this.isHighest(day) ? this.$t('expense.daily_report_highest_mark') : '',
      })
    },
  },
}
</script>

<style scoped>
.daily-analysis {
  background: var(--cb-surface-card);
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  box-shadow: var(--cb-shadow-soft);
  margin-bottom: 12px;
  padding: 14px 16px 12px;
  min-width: 0;
}

.daily-analysis__header,
.daily-analysis__actions,
.daily-analysis__metrics,
.daily-analysis__chart {
  display: flex;
}

.daily-analysis__header {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.daily-analysis__heading {
  min-width: 0;
}

.daily-analysis__title {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 0.96rem;
  font-weight: 700;
  margin: 0;
}

.daily-analysis__summary {
  color: var(--cb-ink-muted);
  font-size: 0.8rem;
  margin: 2px 0 0;
  overflow-wrap: anywhere;
}

.daily-analysis__actions {
  align-items: center;
  flex: 0 0 auto;
  gap: 6px;
}

.daily-analysis__toggle,
.daily-analysis__clear,
.daily-analysis__state button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--cb-accent);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  min-height: 36px;
  padding: 6px 8px;
}

.daily-analysis__clear {
  color: var(--cb-ink-secondary);
}

.daily-analysis__toggle:focus-visible,
.daily-analysis__clear:focus-visible,
.daily-analysis__state button:focus-visible,
.daily-analysis__day:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--cb-accent) 35%, transparent);
  outline-offset: 2px;
}

.daily-analysis__content {
  height: 214px;
  margin-top: 10px;
  min-width: 0;
}

.daily-analysis__metrics {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 8px;
}

.daily-analysis__metrics > div {
  background: var(--cb-surface-subtle, rgba(23, 32, 51, 0.035));
  border-radius: 6px;
  min-width: 0;
  padding: 6px 8px;
}

.daily-analysis__metrics span,
.daily-analysis__metrics strong {
  display: block;
  min-width: 0;
}

.daily-analysis__metrics span {
  color: var(--cb-ink-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.daily-analysis__metrics strong {
  color: var(--cb-ink);
  font-size: 0.84rem;
  overflow-wrap: anywhere;
}

.daily-analysis__chart-scroll {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
}

.daily-analysis__chart {
  align-items: stretch;
  gap: 6px;
  height: 154px;
  min-width: 560px;
}

.daily-analysis__day {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--cb-ink-secondary);
  cursor: pointer;
  display: grid;
  flex: 1 1 0;
  grid-template-rows: 22px 78px 20px 18px;
  min-width: 74px;
  padding: 3px 5px;
}

.daily-analysis__day:hover {
  background: color-mix(in srgb, var(--cb-accent) 5%, transparent);
}

.daily-analysis__day--selected {
  background: color-mix(in srgb, var(--cb-accent) 10%, transparent);
  border-color: var(--cb-accent);
}

.daily-analysis__day--selected .daily-analysis__date::before {
  content: '✓ ';
  font-weight: 800;
}

.daily-analysis__value,
.daily-analysis__date,
.daily-analysis__highest-mark,
.daily-analysis__count {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daily-analysis__value {
  font-size: 0.7rem;
  font-weight: 700;
}

.daily-analysis__bar-track {
  align-self: stretch;
  background: color-mix(in srgb, var(--cb-border-soft) 68%, transparent);
  border-radius: 4px 4px 2px 2px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin: 2px auto;
  overflow: hidden;
  width: min(34px, 60%);
}

.daily-analysis__bar {
  background: var(--cb-accent);
  border-radius: 4px 4px 2px 2px;
  min-height: 0;
  transition: height 180ms ease;
  width: 100%;
}

.daily-analysis__day--highest .daily-analysis__bar {
  background: var(--cb-warning);
}

.daily-analysis__date {
  color: var(--cb-ink);
  font-size: 0.72rem;
  font-weight: 700;
}

.daily-analysis__highest-mark,
.daily-analysis__count {
  color: var(--cb-ink-muted);
  font-size: 0.62rem;
}

.daily-analysis__highest-mark {
  color: var(--cb-warning);
  font-weight: 800;
}

.daily-analysis__state,
.daily-analysis__empty {
  align-items: center;
  color: var(--cb-ink-muted);
  display: flex;
  font-size: 0.84rem;
  height: 100%;
  justify-content: center;
  margin: 0;
  text-align: center;
}

.daily-analysis__state--error {
  flex-direction: column;
  gap: 4px;
}

.daily-analysis__empty {
  height: auto;
  justify-content: flex-start;
  margin: 0 0 6px;
}

@media (max-width: 720px) {
  .daily-analysis {
    padding: 10px 12px;
  }

  .daily-analysis__header {
    align-items: flex-start;
  }

  .daily-analysis__actions {
    align-items: flex-end;
    flex-direction: column-reverse;
  }

  .daily-analysis__toggle,
  .daily-analysis__clear,
  .daily-analysis__state button {
    min-height: 44px;
  }

  .daily-analysis__content {
    height: 232px;
  }

  .daily-analysis--collapsed .daily-analysis__header {
    min-height: 48px;
  }
}

@media (max-width: 430px) {
  .daily-analysis__header {
    gap: 8px;
  }

  .daily-analysis__actions {
    gap: 0;
  }

  .daily-analysis__clear {
    padding-inline: 4px;
  }
}
</style>
