<template>
  <v-alert
    v-if="banner.visible"
    type="info"
    variant="tonal"
    border="start"
    class="onboarding-banner"
  >
    <div class="banner-header">
      <strong>{{ banner.title }}</strong>
      <span class="progress-label">{{ banner.progress }}/3</span>
    </div>
    <div class="banner-description">{{ banner.description }}</div>

    <div class="steps">
      <v-chip size="small" :color="banner.steps.auth ? 'success' : 'default'" variant="tonal">
        Autenticacao
      </v-chip>
      <v-chip size="small" :color="banner.steps.workspace ? 'success' : 'default'" variant="tonal">
        Workspace
      </v-chip>
      <v-chip size="small" :color="banner.steps.billing ? 'success' : 'default'" variant="tonal">
        Assinatura
      </v-chip>
    </div>

    <div v-if="banner.ctaRoute" class="cta-row">
      <v-btn color="primary" size="small" @click="goToCta">
        {{ banner.ctaLabel || 'Continuar' }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { useUserStore } from '@/plugins/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

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
    hasCompanies: (userStore.getCompanies?.length || 0) > 0,
    isTenantMode: userStore.isTenantMode,
    currentPath: route.path,
    currentQuery: routeQuery.value,
    requiresWorkspace: requiresWorkspace.value,
    requiresTenant: requiresTenant.value
  })
)

const goToCta = () => {
  if (!banner.value.ctaRoute) return
  void router.push(banner.value.ctaRoute)
}
</script>

<style scoped>
.onboarding-banner {
  margin: 8px 16px 12px 16px;
}

.banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.banner-description {
  margin-top: 6px;
  font-size: 0.93rem;
}

.steps {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.cta-row {
  margin-top: 10px;
}
</style>
