<template>
  <li class="delta-summary">
    <strong>{{ label }}</strong>
    <span>{{ t(`decisionJourney.form.${isLine ? (delta.type === 'MONTHLY_INCOME' ? 'lineIncrease' : 'lineDecrease') : kind}`) }} · {{ value }}</span>
    <span>{{ t(`decisionJourney.form.${timing}`) }} · {{ t('decisionJourney.form.from', { month: month(delta.startMonthOffset || 0) }) }}<template v-if="timing === 'FIXED_PERIOD'"> · {{ t('decisionJourney.form.until', { month: month(delta.endMonthOffset ?? delta.startMonthOffset ?? 0) }) }}</template></span>
  </li>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ScenarioDeltaInput } from '@/services/ScenarioService'
import { changeKind, scenarioMonthLabel } from '@/utils/scenarioChangePresentation'
const props = defineProps<{ delta: ScenarioDeltaInput }>()
const { t, locale } = useI18n()
const isLine = computed(() => props.delta.label?.startsWith('Baseline adjustment: '))
const label = computed(() => isLine.value
  ? t('decisionJourney.form.lineChange', { category: props.delta.label!.slice('Baseline adjustment: '.length) })
  : /^Change \d+$/.test(props.delta.label || '')
    ? t('decisionJourney.form.numberedChange', { number: props.delta.label!.slice(7) })
    : props.delta.label)
const kind = computed(() => changeKind(props.delta.type, props.delta.type.includes('INCOME') ? 'INCOME' : 'EXPENSE'))
const timing = computed(() => props.delta.temporalType || (props.delta.type.startsWith('ONE_TIME') ? 'SINGLE' : 'ONGOING'))
const month = (offset: number) => scenarioMonthLabel(offset, locale.value)
const value = computed(() => props.delta.type.startsWith('PERCENT_')
  ? `${Number(props.delta.percentage ?? props.delta.amount).toLocaleString(locale.value)}%`
  : Number(props.delta.amount).toLocaleString(locale.value, { style: 'currency', currency: 'BRL' }))
</script>
<style scoped>
.delta-summary { display: grid; gap: 6px; padding: 16px 0; border-bottom: 1px solid var(--cb-border); overflow-wrap: anywhere; }
.delta-summary span { color: var(--cb-ink-secondary); }
</style>
