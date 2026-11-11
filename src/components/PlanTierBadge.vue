<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ tier: 'STARTER' | 'TEAM'; scope?: 'required' | 'partial'; showLock?: boolean }>(), { scope: 'required', showLock: true })
const { t } = useI18n()
const description = computed(() => t(props.scope === 'partial'
  ? props.tier === 'TEAM' ? 'planTierBadge.containsTeam' : 'planTierBadge.containsStarter'
  : props.tier === 'TEAM' ? 'planTierBadge.requiresTeam' : 'planTierBadge.requiresStarter'))
</script>

<template>
  <span class="plan-tier-badge" :class="`plan-tier-badge--${tier.toLowerCase()}`" :title="description" :aria-label="description">
    <svg v-if="showLock" class="plan-tier-badge__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
    </svg>
    <span>{{ tier === 'STARTER' ? 'Starter' : 'Team' }}</span>
  </span>
</template>

<style scoped>
.plan-tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 0.6875rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
  vertical-align: middle;
}

.plan-tier-badge__lock {
  display: block;
  width: 12px;
  height: 12px;
  flex: none;
  background: transparent;
}

.plan-tier-badge--starter { color: #596b5d; }
.plan-tier-badge--team { color: #80643d; }
.v-theme--dark .plan-tier-badge--starter { color: #b7c4b5; }
.v-theme--dark .plan-tier-badge--team { color: #cfba98; }
</style>
