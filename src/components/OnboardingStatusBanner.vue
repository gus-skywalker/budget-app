<template>
  <section v-if="showBanner" class="onboarding-shell">
    <div class="onboarding-card">
      <div class="copy-column">
        <span class="eyebrow">{{ t('onboarding.eyebrow') }}</span>

        <div class="headline-row">
          <div>
            <h2>{{ content.title }}</h2>
            <p class="description">{{ content.description }}</p>
          </div>
          <span class="progress-badge">{{ t('onboarding.step_badge', { current: currentStep }) }}</span>
        </div>

        <div class="milestones" aria-label="Onboarding progress">
          <div
            v-for="item in stepItems"
            :key="item.key"
            class="milestone"
            :class="{ 'milestone-done': item.done }"
          >
            <span class="milestone-icon">
              <v-icon size="14">{{ item.done ? 'mdi-check' : 'mdi-circle-outline' }}</v-icon>
            </span>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="banner.ctaRoute" class="action-column">
        <v-btn color="primary" class="cta-button" @click="goToCta">
          {{ content.ctaLabel }}
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { useUserStore } from '@/plugins/userStore'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const focusedOnboardingRoutes = new Set(['create-workspace', 'select-workspace', 'choose-plan', 'checkout'])

const requiresWorkspace = computed(() =>
  route.matched.some((record) => Boolean(record.meta?.requiresWorkspace))
)

const requiresTenant = computed(() =>
  route.matched.some((record) => Boolean(record.meta?.requiresTenant))
)

const routeQuery = computed<Record<string, unknown>>(() => ({ ...route.query }))

const banner = computed(() =>
  OnboardingOrchestrator.resolveOnboardingBannerState({
    isAuthenticated: userStore.isAuthenticated,
    hasWorkspaces: (userStore.getWorkspaces?.length || 0) > 0,
    isTenantMode: userStore.isTenantMode,
    currentPath: route.path,
    currentQuery: routeQuery.value,
    requiresWorkspace: requiresWorkspace.value,
    requiresTenant: requiresTenant.value
  })
)

const showBanner = computed(() =>
  banner.value.visible && !focusedOnboardingRoutes.has(String(route.name || ''))
)

const currentStep = computed(() => {
  switch (banner.value.phase) {
    case 'WORKSPACE_REQUIRED':
      return 1
    case 'WORKSPACE_SELECTION_REQUIRED':
      return 2
    case 'BILLING_PLAN_REQUIRED':
      return 3
    default:
      return 1
  }
})

const content = computed(() => {
  switch (banner.value.phase) {
    case 'AUTH_REQUIRED':
      return {
        title: t('onboarding.auth_required_title'),
        description: t('onboarding.auth_required_description'),
        ctaLabel: t('onboarding.login_cta')
      }
    case 'WORKSPACE_REQUIRED':
      return {
        title: t('onboarding.workspace_required_title'),
        description: t('onboarding.workspace_required_description'),
        ctaLabel: t('onboarding.create_workspace_cta')
      }
    case 'WORKSPACE_SELECTION_REQUIRED':
      return {
        title: t('onboarding.workspace_selection_title'),
        description: t('onboarding.workspace_selection_description'),
        ctaLabel: t('onboarding.select_workspace_cta')
      }
    case 'BILLING_PLAN_REQUIRED':
      return {
        title: t('onboarding.billing_required_title'),
        description: t('onboarding.billing_required_description'),
        ctaLabel: t('onboarding.choose_plan_cta')
      }
    default:
      return {
        title: t('onboarding.ready_title'),
        description: t('onboarding.ready_description'),
        ctaLabel: t('onboarding.continue')
      }
  }
})

const stepItems = computed(() => [
  { key: 'auth', label: t('onboarding.auth'), done: banner.value.steps.auth },
  { key: 'workspace', label: t('onboarding.workspace'), done: banner.value.steps.workspace },
  { key: 'billing', label: t('onboarding.billing'), done: banner.value.steps.billing }
])

const goToCta = () => {
  if (!banner.value.ctaRoute) return
  void router.push(banner.value.ctaRoute)
}
</script>

<style scoped>
.onboarding-shell {
  padding: 12px 16px 0;
}

.onboarding-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  border: 1px solid rgba(23, 32, 51, 0.12);
  border-radius: 24px;
  padding: 20px 22px;
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(251, 248, 242, 0.96) 0%, rgba(248, 244, 237, 0.98) 100%);
  box-shadow: 0 14px 30px rgba(23, 32, 51, 0.06);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 7px 12px;
  background: rgba(32, 95, 99, 0.1);
  color: #173f4b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.headline-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
}

h2 {
  margin: 0;
  color: #172033;
  font-family: 'Manrope', sans-serif;
  font-size: 1.45rem;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.description {
  margin: 8px 0 0;
  color: #536177;
  font-size: 1rem;
  line-height: 1.6;
}

.progress-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(182, 85, 31, 0.12);
  color: #8e4318;
  font-family: 'Manrope', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
}

.milestones {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.milestone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(23, 32, 51, 0.05);
  color: #536177;
  font-size: 0.9rem;
}

.milestone-done {
  background: rgba(32, 95, 99, 0.11);
  color: #173f4b;
}

.milestone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.action-column {
  display: flex;
  align-items: center;
}

.cta-button {
  min-width: 190px;
  border-radius: 999px;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
}

@media (max-width: 960px) {
  .onboarding-card {
    grid-template-columns: 1fr;
  }

  .action-column {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .onboarding-shell {
    padding: 10px 12px 0;
  }

  .onboarding-card {
    padding: 16px;
    border-radius: 20px;
  }

  .headline-row {
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
  }
}
</style>
