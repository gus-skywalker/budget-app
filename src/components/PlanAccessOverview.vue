<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import PlanTierBadge from '@/components/PlanTierBadge.vue'
import { PLAN_FEATURES, featureAvailability } from '@/utils/planAccess'

const props = defineProps<{
  summary: BillingSummaryResponse | null
  loading?: boolean
}>()
const { t } = useI18n()
const features = computed(() => PLAN_FEATURES.map(feature => ({
  ...feature,
  availability: featureAvailability(props.summary, feature),
})))
const hasLockedFeatures = computed(() => features.value.some(feature => feature.availability === 'locked'))
const limits = computed(() => {
  const values = props.summary?.planLimits
  if (!values) return []
  return ([
    ['workspaces', values.maxWorkspaces],
    ['members', values.maxMembersPerWorkspace],
    ['scenarios', values.maxSavedScenarios],
    ['decisions', values.maxSavedDecisions],
  ] as const).filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
})
</script>

<template>
  <section class="cb-card plan-access" aria-labelledby="plan-access-title">
    <div class="cb-card__header">
      <h2 id="plan-access-title" class="cb-card__title">{{ t('planAccess.title') }}</h2>
      <p class="plan-access__intro">{{ t('planAccess.intro') }}</p>
    </div>
    <div class="cb-card__body">
      <p v-if="loading || !summary" class="plan-access__notice" role="status">
        {{ t(loading ? 'planAccess.loading' : 'planAccess.unavailable') }}
      </p>
      <template v-else>
        <p class="plan-access__base"><v-icon size="18" aria-hidden="true">mdi-check-circle-outline</v-icon>{{ t('planAccess.freeBase') }}</p>
        <ul class="plan-access__features">
          <li v-for="feature in features" :key="feature.key" class="plan-access__feature">
            <span class="plan-access__feature-name">{{ t(`planAccess.features.${feature.key}`) }}</span>
            <span class="plan-access__feature-state">
              <span v-if="feature.availability === 'available'" class="plan-access__included">
                <v-icon size="16" aria-hidden="true">mdi-check-circle-outline</v-icon>{{ t('planAccess.included') }}
                <small>{{ t(feature.tier === 'TEAM' ? 'planAccess.teamTier' : 'planAccess.starterTier') }}</small>
              </span>
              <PlanTierBadge v-else-if="feature.availability === 'locked'" :tier="feature.tier" />
              <span v-else class="plan-access__unknown">{{ t('planAccess.unknown') }}</span>
            </span>
          </li>
        </ul>
        <div v-if="limits.length" class="plan-access__limits">
          <h3>{{ t('planAccess.limitsTitle') }}</h3>
          <ul>
            <li v-for="[key, value] in limits" :key="key">
              <span>{{ t(`planAccess.limits.${key}`) }}</span><strong>{{ value }}</strong>
            </li>
          </ul>
        </div>
        <p class="plan-access__footnote">{{ t('planAccess.permissionsNote') }}</p>
        <router-link v-if="hasLockedFeatures" class="plan-access__link" to="/choose-plan">
          {{ t('planAccess.viewPlans') }} <v-icon size="18" aria-hidden="true">mdi-arrow-right</v-icon>
        </router-link>
      </template>
    </div>
  </section>
</template>

<style scoped>
.plan-access { margin-bottom: 24px; }
.plan-access .cb-card__header { display: block; }
.plan-access__intro { margin: 6px 0 0; color: var(--cb-ink-secondary); }
.plan-access__notice, .plan-access__footnote { color: var(--cb-ink-secondary); font-size: .9rem; }
.plan-access__base { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 18px; color: var(--cb-ink); font-weight: 650; }
.plan-access__base .v-icon, .plan-access__included { color: var(--cb-positive, #33875e); }
.plan-access__features, .plan-access__limits ul { list-style: none; margin: 0; padding: 0; }
.plan-access__features { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.plan-access__feature { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; padding: 12px 14px; border: 1px solid var(--cb-border); border-radius: 12px; background: var(--cb-surface); }
.plan-access__feature-name { min-width: 0; font-weight: 600; }
.plan-access__feature-state { flex: none; }
.plan-access__included { display: inline-flex; align-items: center; gap: 4px; font-size: .78rem; font-weight: 750; }
.plan-access__included small { margin-left: 3px; color: var(--cb-ink-secondary); font-size: .72rem; font-weight: 500; }
.plan-access__unknown { color: var(--cb-ink-secondary); font-size: .78rem; }
.plan-access__limits { margin-top: 22px; }
.plan-access__limits h3 { margin: 0 0 8px; font-size: 1rem; }
.plan-access__limits ul { display: flex; flex-wrap: wrap; gap: 8px; }
.plan-access__limits li { display: flex; gap: 8px; padding: 7px 10px; border: 1px solid var(--cb-border); border-radius: 999px; font-size: .82rem; }
.plan-access__limits strong { color: var(--cb-ink); }
.plan-access__footnote { margin: 18px 0 0; }
.plan-access__link { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; color: var(--cb-primary); font-weight: 750; }
@media (max-width: 760px) { .plan-access__features { grid-template-columns: 1fr; } .plan-access__feature { align-items: flex-start; } }
</style>
