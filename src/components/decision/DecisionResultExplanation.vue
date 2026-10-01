<template>
  <section class="result-explanation" :data-origin="model.origin">
    <p class="result-origin" role="status">{{ copy.origin }}</p>
    <div class="result-hero" :data-tone="model.tone">
      <p v-if="model.name">{{ model.name }}</p>
      <h2>{{ copy.headline }}</h2>
      <p>{{ copy.summary }}</p>
      <p v-if="model.isDebt">{{ copy.impactHelp }}</p>
      <template v-if="!model.isDebt">
        <p>{{ copy.horizon }}</p>
        <p class="result-status">{{ copy.status }}</p>
        <p>{{ copy.risk }}</p>
      </template>
      <p>{{ copy.caution }}</p>
      <slot name="voice" />
    </div>
    <template v-if="!model.isDebt">
      <div class="result-final"><h3>{{ t('decisionJourney.result.finalTitle') }}</h3><p>{{ copy.final }}</p></div>
      <details class="result-details" data-testid="result-evidence">
        <summary>{{ t('decisionJourney.result.how') }}</summary>
        <p>{{ t('decisionJourney.result.evidenceHelp') }}</p>
        <dl>
          <div v-for="entry in facts" :key="entry.key">
            <dt>{{ t(`decisionJourney.result.${entry.key}`) }}</dt>
            <dd>{{ entry.field.value === null ? t('decisionJourney.result.unavailable') : money(entry.field.value) }}</dd>
            <dd v-if="entry.field.source">{{ copy.origin }}</dd>
          </div>
        </dl>
        <p v-if="facts.some(entry => entry.field.value === null)">{{ t('decisionJourney.result.missingSource') }}</p>
        <p>{{ t('decisionJourney.result.initialHelp') }}</p>
        <p>{{ t('decisionJourney.result.sourcesHelp') }}</p>
      </details>
      <details class="result-details" data-testid="result-months">
        <summary>{{ t('decisionJourney.result.monthlyDetails') }}</summary>
        <p>{{ t('decisionJourney.result.monthlyHelp') }}</p>
        <p v-if="!model.rows.length">{{ t('decisionJourney.result.noRows') }}</p>
        <ol v-else class="result-months">
          <li v-for="(row, index) in model.rows" :key="index">
            <h3>{{ row.period || t('decisionJourney.result.periodUnknown') }}</h3>
            <p v-if="row.legacy">{{ t('decisionJourney.result.legacyRows') }}</p>
            <dl>
              <div><dt>{{ t('decisionJourney.result.monthImpact') }}</dt><dd>{{ amount(row.changeImpact) }}<span v-if="row.changeImpact !== null"> · {{ t(`decisionJourney.result.${row.changeImpact < 0 ? 'decrease' : row.changeImpact > 0 ? 'increase' : 'same'}`) }}</span></dd></div>
              <div><dt>{{ t('decisionJourney.result.withoutChange') }}</dt><dd>{{ amount(row.baselineBalance) }}</dd></div>
              <div><dt>{{ t('decisionJourney.result.withChange') }}</dt><dd>{{ amount(row.scenarioBalance) }}<span v-if="row.scenarioBalance !== null && row.scenarioBalance < 0"> · {{ t('decisionJourney.result.belowZero') }}</span></dd></div>
              <div v-if="!row.legacy"><dt>{{ t('decisionJourney.result.baseFlow') }}</dt><dd>{{ amount(row.baselineIncome) }} / {{ amount(row.baselineExpense) }}</dd></div>
              <div v-if="!row.legacy"><dt>{{ t('decisionJourney.result.changedFlow') }}</dt><dd>{{ amount(row.scenarioIncome) }} / {{ amount(row.scenarioExpense) }}</dd></div>
            </dl>
            <p>{{ t('decisionJourney.result.sources') }}: {{ row.sources.length ? row.sources.map(sourceLabel).join(', ') : t('decisionJourney.result.unavailable') }}</p>
          </li>
        </ol>
      </details>
      <details class="result-details">
        <summary>{{ t('decisionJourney.result.goals') }}</summary>
        <p>{{ t('decisionJourney.result.goalsCount') }}: {{ model.goalsCount.value ?? t('decisionJourney.result.unavailable') }}</p>
        <ul v-if="model.goalNames.length"><li v-for="name in model.goalNames" :key="name">{{ name }}</li></ul>
        <p v-else>{{ t('decisionJourney.result.goalNamesUnknown') }}</p>
      </details>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DecisionResultPresentation, decisionResultNarrative } from '@/utils/decisionResultPresentation'
const props = defineProps<{ model: DecisionResultPresentation; copy: ReturnType<typeof decisionResultNarrative> }>()
const { t, locale } = useI18n()
const money = (value: number) => value.toLocaleString(locale.value, { style: 'currency', currency: 'BRL' })
const amount = (value: number | null) => value === null ? t('decisionJourney.result.unavailable') : money(value)
const facts = computed(() => [
  { key: 'initial', field: props.model.initialBalance }, { key: 'baseline', field: props.model.baseline },
  { key: 'average', field: props.model.impact }, { key: 'finalTitle', field: props.model.finalBalance },
  { key: 'goalsAvailable', field: props.model.availableForGoals },
])
const sourceLabel = (source: string) => {
  const keys: Record<string, string> = { CONFIRMED: 'sourceBudget', PROJECTED: 'sourceHistory', SCENARIO_CHANGE: 'sourceChange' }
  return keys[source] ? t(`decisionJourney.result.${keys[source]}`) : t('decisionJourney.result.sourceUnknown')
}
</script>
<style scoped>
.result-explanation { display: grid; gap: 16px; min-width: 0; overflow-wrap: anywhere; }
.result-origin { color: var(--cb-ink-secondary); font-size: .9rem; }
.result-hero { display: grid; gap: 12px; padding: 20px; border-radius: 14px; background: color-mix(in srgb, var(--cb-primary) 8%, transparent); border: 1px solid var(--cb-border); }
.result-hero h2 { line-height: 1.3; font-size: 1.7rem; }
.result-status { font-weight: 700; }
.result-final, .result-details { border: 1px solid var(--cb-border); padding: 16px; border-radius: 12px; }
summary { cursor: pointer; font-weight: 700; padding: 4px 0; }
summary:focus-visible { outline: 3px solid var(--cb-primary); outline-offset: 4px; }
.result-details[open] summary { margin-bottom: 16px; }
dl { display: grid; gap: 14px; margin: 16px 0; }
dt { font-weight: 600; }
dd { margin: 4px 0 0; color: var(--cb-ink-secondary); }
.result-months { display: grid; gap: 16px; list-style: none; padding: 0; margin-top: 16px; }
.result-months > li { padding: 16px; border: 1px solid var(--cb-border); border-radius: 12px; }
@media(min-width: 700px) { dl { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
