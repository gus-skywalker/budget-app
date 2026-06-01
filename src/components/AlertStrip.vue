<template>
  <div class="cb-alert-strip" :class="`cb-alert-strip--${variant}`" role="alert">
    <div class="cb-alert-strip__icon">
      <v-icon :color="iconColor" size="18">{{ iconName }}</v-icon>
    </div>
    <div class="cb-alert-strip__body">
      <p v-if="title" class="cb-alert-strip__title">{{ title }}</p>
      <p v-if="description || $slots.default" class="cb-alert-strip__desc">
        <slot>{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="cb-alert-strip__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'warning' | 'risk' | 'info' | 'positive'
  title?: string
  description?: string
}>(), {
  variant: 'warning'
})

const iconName = computed(() => {
  const map: Record<string, string> = {
    warning:  'mdi-alert-circle-outline',
    risk:     'mdi-alert-outline',
    info:     'mdi-information-outline',
    positive: 'mdi-check-circle-outline',
  }
  return map[props.variant]
})

const iconColor = computed(() => {
  const map: Record<string, string> = {
    warning:  'var(--cb-warning)',
    risk:     'var(--cb-risk)',
    info:     'var(--cb-accent)',
    positive: 'var(--cb-positive)',
  }
  return map[props.variant]
})
</script>
