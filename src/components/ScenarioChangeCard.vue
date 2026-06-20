<template>
  <div class="scenario-change-card">
    <div class="scenario-change-card__top">
      <v-text-field
        :model-value="adjustment.label ?? ''"
        @update:model-value="$emit('update:label', $event)"
        :label="t('contentExperience.planning.adjustmentCard.label')"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-label"
        :style="{ borderRadius: '8px' }"
      />

      <button
        class="remove-btn"
        type="button"
        @click="$emit('remove')"
        :aria-label="t('contentExperience.planning.adjustmentCard.remove')"
      >
        <v-icon size="20">mdi-delete-outline</v-icon>
      </button>
    </div>

    <div class="segmented-control">
      <button
        v-for="option in flowOptions"
        :key="option"
        :class="['segment', { active: adjustment.flow === option }]"
        @click="$emit('update:flow', option)"
        type="button"
      >
        {{
          option === 'INCOME'
            ? t('contentExperience.planning.adjustmentCard.income')
            : t('contentExperience.planning.adjustmentCard.expense')
        }}
      </button>
    </div>

    <div class="change-inputs">
      <v-select
        :model-value="adjustment.valueMode"
        @update:model-value="updateValueMode"
        :items="valueModeOptions"
        item-title="title"
        item-value="value"
        :label="t('contentExperience.planning.adjustmentCard.valueMode', 'Value mode')"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
      />
      <v-select
        :model-value="adjustment.temporalType"
        @update:model-value="updateTemporalType"
        :items="temporalOptions"
        item-title="title"
        item-value="value"
        :label="t('contentExperience.planning.adjustmentCard.timing', 'Timing')"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
      />
      <v-text-field
        :model-value="displayAmount"
        @update:model-value="updateAmount"
        :label="amountLabel"
        type="number"
        min="0"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
        :style="{ borderRadius: '8px' }"
      />
      <v-select
        :model-value="adjustment.startMonthOffset"
        @update:model-value="updateStartMonth"
        :items="monthOptions"
        item-title="title"
        item-value="value"
        :label="t('contentExperience.planning.adjustmentCard.startMonth', 'Starts in')"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
      />
      <v-select
        v-if="adjustment.temporalType === 'FIXED_PERIOD'"
        :model-value="adjustment.endMonthOffset"
        @update:model-value="updateEndMonth"
        :items="endMonthOptions"
        item-title="title"
        item-value="value"
        :label="t('contentExperience.planning.adjustmentCard.endMonth', 'Ends in')"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        class="change-input"
      />
    </div>

    <div class="change-summary">
      <v-icon size="18">mdi-calendar-check-outline</v-icon>
      <span>{{ summaryText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ScenarioTemporalType } from '@/services/ScenarioService'
import type { AdjustmentValueMode } from '@/utils/scenarioWizard'

const props = defineProps<{
  adjustment: {
    label?: string
    flow: 'INCOME' | 'EXPENSE'
    valueMode: AdjustmentValueMode
    temporalType: ScenarioTemporalType
    amount: number
    percentage: number
    startMonthOffset: number
    endMonthOffset: number | null
    monthlyChange: number
    oneTimeChange: number
  }
}>()
const { t, locale } = useI18n()
const flowOptions = ['INCOME', 'EXPENSE'] as const
const emit = defineEmits([
  'update:label',
  'update:flow',
  'update:valueMode',
  'update:temporalType',
  'update:amount',
  'update:percentage',
  'update:startMonthOffset',
  'update:endMonthOffset',
  'update:monthlyChange',
  'update:oneTimeChange',
  'remove'
])

const valueModeOptions = computed(() => [
  { title: t('contentExperience.planning.adjustmentCard.amountMode', 'Fixed value'), value: 'AMOUNT' },
  { title: t('contentExperience.planning.adjustmentCard.percentageMode', 'Percentage of budget'), value: 'PERCENTAGE' },
])

const temporalOptions = computed(() => [
  { title: t('contentExperience.planning.adjustmentCard.ongoing', 'Every month') },
  { title: t('contentExperience.planning.adjustmentCard.fixedPeriod', 'For a period') },
  { title: t('contentExperience.planning.adjustmentCard.single', 'One time'), value: 'SINGLE' },
].map((item, index) => ({
  ...item,
  value: (['ONGOING', 'FIXED_PERIOD', 'SINGLE'] as const)[index],
})))

const monthFormatterLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const monthLabel = (offset: number) => {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + 1 + Math.max(0, Math.trunc(Number(offset || 0))))
  const label = new Intl.DateTimeFormat(monthFormatterLocale.value, {
    month: 'short',
    year: 'numeric',
  }).format(date)
  return label.replace('.', '')
}

const monthOptions = computed(() =>
  Array.from({ length: 24 }, (_, offset) => ({
    title: offset === 0
      ? t('contentExperience.planning.adjustmentCard.nextMonthLabel', { month: monthLabel(offset) })
      : monthLabel(offset),
    value: offset,
  })),
)

const normalizedStartOffset = computed(() => Math.max(0, Math.trunc(Number(props.adjustment.startMonthOffset || 0))))

const normalizedEndOffset = computed(() => {
  const raw = props.adjustment.endMonthOffset == null
    ? normalizedStartOffset.value
    : Number(props.adjustment.endMonthOffset || 0)
  return Math.max(normalizedStartOffset.value, Math.trunc(raw))
})

const endMonthOptions = computed(() =>
  monthOptions.value
    .filter((item) => item.value >= normalizedStartOffset.value)
    .map((item) => ({
      ...item,
      title: `${item.title} · ${durationLabel(item.value)}`,
    })),
)

const displayAmount = computed(() => {
  if (props.adjustment.valueMode === 'PERCENTAGE') {
    return props.adjustment.percentage || 0
  }
  return props.adjustment.amount || (
    props.adjustment.temporalType === 'SINGLE'
      ? props.adjustment.oneTimeChange
      : props.adjustment.monthlyChange
  )
})

const amountLabel = computed(() => {
  if (props.adjustment.valueMode === 'PERCENTAGE') {
    return t('contentExperience.planning.adjustmentCard.percentageChange', 'Percentage')
  }
  if (props.adjustment.temporalType === 'SINGLE') {
    return t('contentExperience.planning.adjustmentCard.oneTimeChange')
  }
  return t('contentExperience.planning.adjustmentCard.monthlyChange')
})

const valueSummary = computed(() => {
  const target = props.adjustment.flow === 'INCOME'
    ? t('contentExperience.planning.adjustmentCard.incomeTarget', 'income')
    : t('contentExperience.planning.adjustmentCard.expenseTarget', 'expense')
  const value = Number(displayAmount.value || 0)
  if (props.adjustment.valueMode === 'PERCENTAGE') {
    return t('contentExperience.planning.adjustmentCard.summaryPercentage', {
      target,
      value: formatNumber(value),
    })
  }
  return t('contentExperience.planning.adjustmentCard.summaryAmount', {
    target,
    value: formatCurrency(value),
  })
})

const durationMonths = computed(() => {
  if (props.adjustment.temporalType === 'SINGLE') return 1
  if (props.adjustment.temporalType === 'FIXED_PERIOD') {
    return normalizedEndOffset.value - normalizedStartOffset.value + 1
  }
  return null
})

const durationLabel = (endOffset: number) => {
  const months = endOffset - normalizedStartOffset.value + 1
  return t('contentExperience.planning.adjustmentCard.durationMonths', { count: months })
}

const timingSummary = computed(() => {
  const start = monthLabel(normalizedStartOffset.value)
  if (props.adjustment.temporalType === 'SINGLE') {
    return t('contentExperience.planning.adjustmentCard.summarySingle', { month: start })
  }
  if (props.adjustment.temporalType === 'FIXED_PERIOD') {
    return t('contentExperience.planning.adjustmentCard.summaryFixed', {
      start,
      end: monthLabel(normalizedEndOffset.value),
      count: durationMonths.value || 1,
    })
  }
  return t('contentExperience.planning.adjustmentCard.summaryOngoing', { month: start })
})

const summaryText = computed(() => `${timingSummary.value} · ${valueSummary.value}`)

const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString(monthFormatterLocale.value, {
    maximumFractionDigits: 2,
  })

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString(monthFormatterLocale.value, {
    style: 'currency',
    currency: 'BRL',
  })

const updateValueMode = (value: AdjustmentValueMode) => {
  emit('update:valueMode', value)
  if (value === 'PERCENTAGE') {
    emit('update:amount', 0)
    emit('update:percentage', props.adjustment.percentage || 0)
    return
  }
  const amount = props.adjustment.amount || props.adjustment.monthlyChange || props.adjustment.oneTimeChange || 0
  emit('update:amount', amount)
}

const updateTemporalType = (value: ScenarioTemporalType) => {
  emit('update:temporalType', value)
  if (value === 'FIXED_PERIOD' && props.adjustment.endMonthOffset == null) {
    emit('update:endMonthOffset', normalizedStartOffset.value)
  }
  if (value !== 'FIXED_PERIOD') {
    emit('update:endMonthOffset', null)
  }
}

const updateStartMonth = (value: number) => {
  const start = Math.max(0, Math.trunc(Number(value || 0)))
  emit('update:startMonthOffset', start)
  if (props.adjustment.temporalType === 'FIXED_PERIOD' && normalizedEndOffset.value < start) {
    emit('update:endMonthOffset', start)
  }
}

const updateEndMonth = (value: number) => {
  const end = Math.max(normalizedStartOffset.value, Math.trunc(Number(value || 0)))
  emit('update:endMonthOffset', end)
}

const updateAmount = (value: unknown) => {
  const numeric = Number(value || 0)
  emit('update:amount', numeric)
  if (props.adjustment.valueMode === 'PERCENTAGE') {
    emit('update:percentage', numeric)
    return
  }
  if (props.adjustment.temporalType === 'SINGLE') {
    emit('update:oneTimeChange', numeric)
    emit('update:monthlyChange', 0)
    return
  }
  emit('update:monthlyChange', numeric)
  emit('update:oneTimeChange', 0)
}
</script>

<style scoped>
.scenario-change-card {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  background: rgb(var(--v-theme-surface), #181c24);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario-change-card__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.change-label {
  flex: 1 1 auto;
  min-width: 0;
}

.segmented-control {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #a3aed6;
  margin-bottom: 0;
  width: 100%;
  background: rgb(var(--v-theme-surface), #181c24);
}

.segment {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  outline: none;
  border-right: 1.5px solid #a3aed6;
}
.segment:last-child {
  border-right: none;
}
.segment:not(.active) {
  background: transparent;
  color: #cbd5e1;
}
.segment.active {
  background: var(--cb-primary);
  color: #fff;
}

.change-inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.change-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
  color: var(--cb-ink-secondary);
  font-size: .88rem;
  font-weight: 600;
  line-height: 1.35;
  padding: 10px 12px;
}

.change-summary :deep(.v-icon) {
  color: var(--cb-primary);
  flex: 0 0 auto;
}
@media (max-width: 600px) {
  .change-inputs {
    grid-template-columns: 1fr;
  }
}

.remove-btn {
  background: none;
  border: none;
  color: #b91c1c;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s;
  flex: 0 0 auto;
}
.remove-btn:hover {
  background: #fef2f2;
}

@media (max-width: 600px) {
  .scenario-change-card {
    padding: 14px;
    gap: 14px;
  }

  .scenario-change-card__top {
    flex-direction: column;
    align-items: stretch;
  }

  .remove-btn {
    align-self: flex-end;
  }
}
</style>
