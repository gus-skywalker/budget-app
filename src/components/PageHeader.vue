<template>
  <div class="cb-page-header">
    <div class="cb-page-header__left">
      <h1 class="cb-page-header__title">
        {{ title }}<span v-if="period" class="cb-page-header__period">{{ period }}</span>
      </h1>
      <p v-if="meta" class="cb-page-header__meta">{{ meta }}</p>

      <!-- Summary strip inline -->
      <div v-if="summaryItems && summaryItems.length" class="cb-summary-strip cb-page-header__strip">
        <template v-for="(item, i) in summaryItems" :key="i">
          <div v-if="item.divider" class="cb-summary-divider"></div>
          <div v-else class="cb-summary-item">
            <span class="cb-summary-item__label">{{ item.label }}</span>
            <span class="cb-summary-item__value" :class="item.valueClass">{{ item.value }}</span>
          </div>
        </template>
      </div>
    </div>

    <div v-if="$slots.actions" class="cb-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SummaryItem {
  label?: string
  value?: string
  valueClass?: string
  divider?: boolean
}

defineProps<{
  title: string
  period?: string
  meta?: string
  summaryItems?: SummaryItem[]
}>()
</script>

<style scoped>
.cb-page-header__period {
  font-weight: 400;
  color: var(--cb-ink-secondary);
  font-size: 0.85em;
  margin-left: 10px;
  font-family: var(--cb-font-body);
}

.cb-page-header__strip {
  margin-top: 10px;
  margin-bottom: 0;
}
</style>
