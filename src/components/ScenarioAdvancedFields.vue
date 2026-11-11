<template>
  <details class="scenario-advanced">
    <summary>{{ t('decisionJourney.form.moreOptions') }}</summary>
    <div class="scenario-advanced__body">
      <v-text-field :model-value="snapshot.scenarioName" @update:model-value="$emit('update:name', $event)"
        :label="t('decisionJourney.form.name')" variant="outlined" hide-details="auto" />
      <v-text-field :model-value="snapshot.months" @update:model-value="$emit('update:months', Number($event))"
        :label="t('decisionJourney.form.horizon')" type="number" min="1" max="24" variant="outlined" hide-details="auto" />
      <p>{{ t('decisionJourney.form.horizonHelp') }}</p>
      <details v-if="snapshot.scenarioLines.length">
        <summary>{{ t('decisionJourney.form.planLines') }}</summary>
        <p>{{ t('decisionJourney.form.planLinesHelp') }}</p>
        <div v-for="(line, index) in snapshot.scenarioLines" :key="index" class="scenario-advanced__line">
          <p>{{ line.category }}</p>
          <v-text-field :model-value="line.adjustedAmount" @update:model-value="$emit('update:line', index, Number($event))"
            :label="t('decisionJourney.form.plannedValue', { category: line.category })" prefix="R$" type="number" min="0" variant="outlined" hide-details="auto" />
        </div>
      </details>
    </div>
  </details>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ScenarioWizardSnapshot } from '@/utils/scenarioWizard'
defineProps<{ snapshot: ScenarioWizardSnapshot }>()
defineEmits<{ 'update:name': [value: string]; 'update:months': [value: number]; 'update:line': [index: number, value: number] }>()
const { t } = useI18n()
</script>
<style scoped>
.scenario-advanced { border: 1px solid var(--cb-border); border-radius: 12px; padding: 16px; margin: 18px 0; }
summary { cursor: pointer; color: var(--cb-ink); font-weight: 600; padding: 4px; }
summary:focus-visible { outline: 3px solid var(--cb-primary); outline-offset: 3px; }
.scenario-advanced__body { display: grid; gap: 16px; margin-top: 18px; }
.scenario-advanced__line { margin-top: 16px; }
p { color: var(--cb-ink-secondary); margin-bottom: 10px; }
</style>
