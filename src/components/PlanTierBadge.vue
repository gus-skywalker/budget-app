<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ tier: 'STARTER' | 'TEAM'; scope?: 'required' | 'partial' }>(), { scope: 'required' })
const { t } = useI18n()
const description = computed(() => t(props.scope === 'partial'
  ? props.tier === 'TEAM' ? 'planTierBadge.containsTeam' : 'planTierBadge.containsStarter'
  : props.tier === 'TEAM' ? 'planTierBadge.requiresTeam' : 'planTierBadge.requiresStarter'))
</script>

<template>
  <span class="plan-tier-badge" :class="`plan-tier-badge--${tier.toLowerCase()}`" :title="description" :aria-label="description">
    <v-icon size="12" aria-hidden="true">mdi-lock-outline</v-icon>
    <span>{{ tier }}</span>
  </span>
</template>

<style scoped>
.plan-tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: none;
  width: fit-content;
  padding: 2px 6px;
  border: 1px solid currentColor;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.04em;
  white-space: nowrap;
  vertical-align: middle;
}

.plan-tier-badge--starter {
  color: #315e42;
  background: #e8f6e7;
}

.plan-tier-badge--team {
  color: #6d4912;
  background: #fff2c9;
}

.v-theme--dark .plan-tier-badge--starter {
  color: #9ce9bc;
  background: #193b2b;
}

.v-theme--dark .plan-tier-badge--team {
  color: #ffd686;
  background: #43311b;
}
</style>
