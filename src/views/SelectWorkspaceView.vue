<template>
  <div class="select-workspace-view experience-page experience-page--workspace-select">
    <v-container class="workspace-selector-shell py-12">
      <v-row justify="center">
        <v-col cols="12" md="9" lg="7">
          <v-card class="elevation-12 gradient-card">
            <v-card-title class="workspace-card-heading d-flex align-center justify-space-between">
              <div>
                <h2 class="title mb-1">{{ t('workspaceSelector.title') }}</h2>
                <p class="subtitle">{{ t('workspaceSelector.desc') }}</p>
              </div>
              <v-chip color="primary" variant="flat" size="small">
                {{ workspaces.length }} {{ t('workspaceSelector.count_label') }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-alert
                v-if="!workspaces.length"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                {{ t('workspaceSelector.empty') }}
              </v-alert>

              <v-list v-else density="comfortable" nav>
                <v-list-item
                  v-for="workspace in workspaces"
                  :key="workspaceKey(workspace)"
                  class="workspace-entry"
                  :disabled="loadingWorkspace === workspaceKey(workspace)"
                  @click="selectWorkspace(workspaceKey(workspace))"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-office-building</v-icon>
                    </v-avatar>
                  </template>
                  <div class="d-flex flex-column">
                    <span class="workspace-name">{{ workspace.workspaceName || workspaceKey(workspace) }}</span>
                    <small class="role-label">{{ getRoleLabel(workspace.role) }}</small>
                  </div>
                  <template #append>
                    <v-progress-circular
                      v-if="loadingWorkspace === workspaceKey(workspace)"
                      indeterminate
                      size="20"
                      color="primary"
                    />
                    <v-icon v-else>mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="action-area">
              <v-spacer />
              <v-btn
                class="cb-create-action"
                color="primary"
                variant="elevated"
                @click="router.push({ name: 'create-workspace', query: { redirect: redirectTarget } })"
              >
                <span>{{ t('workspaceSwitcher.create_new_workspace') }}</span>
                <span class="cb-create-action__mark" aria-hidden="true">↗</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'

type WorkspaceEntry = {
  workspaceId: string
  workspaceName?: string
  role?: string | null
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const workspaces = computed(() => userStore.getWorkspaces as WorkspaceEntry[] ?? [])
const redirectTarget = computed(() =>
  OnboardingOrchestrator.resolveOnboardingTargetPath({
    redirect: route.query.redirect,
    plan: route.query.plan,
    defaultRedirect: '/dashboard'
  })
)
const loadingWorkspace = ref<string | null>(null)

const getRoleLabel = (role?: string | null) => {
  const normalized = (role || '').toUpperCase()
  const key = `workspaceSelector.roles.${normalized}`
  const translated = t(key)
  return translated !== key ? translated : t('workspaceSelector.undefined_role')
}

const workspaceKey = (workspace: WorkspaceEntry) => workspace.workspaceId

const selectWorkspace = async (workspaceId: string) => {
  if (!workspaceId || loadingWorkspace.value) return
  try {
    loadingWorkspace.value = workspaceId
    await userStore.selectWorkspace(workspaceId)
    router.push(redirectTarget.value)
  } catch (error) {
    console.error('Erro ao selecionar workspace pela tela dedicada:', error)
  } finally {
    loadingWorkspace.value = null
  }
}
</script>

<style scoped>
.select-workspace-view {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1f2a44 25%, #0f172a 70%);
  color: #fff;
}

.gradient-card {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
}

.title {
  font-weight: 600;
  font-size: 1.4rem;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.workspace-card-heading {
  gap: 12px;
  flex-wrap: wrap;
  white-space: normal;
}

.workspace-card-heading > div {
  flex: 1 1 16rem;
  min-width: 0;
}

.workspace-card-heading .subtitle {
  overflow-wrap: anywhere;
}

.workspace-entry {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: background 0.2s ease;
}

.workspace-entry:hover {
  background: rgba(255, 255, 255, 0.08);
}

.workspace-name {
  font-weight: 600;
}

.role-label {
  color: rgba(255, 255, 255, 0.7);
}

.action-area {
  background: rgba(255, 255, 255, 0.04);
}

.workspace-selector-shell { max-width: 1120px; }

:global(.v-theme--light .select-workspace-view) {
  background:
    radial-gradient(circle at 86% 8%, rgba(237, 250, 88, .3), transparent 26%),
    radial-gradient(circle at 5% 88%, rgba(16, 204, 131, .11), transparent 34%),
    #fafbf7;
  color: #18372b;
}

:global(.v-theme--light .select-workspace-view .gradient-card) {
  border: 1px solid #ccd7ce;
  border-radius: 24px;
  background: #fff;
  color: #18372b;
  box-shadow: 0 22px 55px rgba(24, 55, 43, .1) !important;
}

:global(.v-theme--light .select-workspace-view .workspace-card-heading) {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: clamp(24px, 4vw, 38px);
  white-space: normal;
}

:global(.v-theme--light .select-workspace-view .workspace-card-heading > div::before) {
  content: '';
  display: block;
  width: 70px;
  height: 8px;
  margin-bottom: 22px;
  border-radius: 8px;
  background: #edfa58;
}

:global(.v-theme--light .select-workspace-view .title) {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -.04em;
  line-height: 1.1;
}

:global(.v-theme--light .select-workspace-view .subtitle),
:global(.v-theme--light .select-workspace-view .role-label) { color: #50645b; }

:global(.v-theme--light .select-workspace-view .workspace-card-heading .v-chip) {
  background: #e7f8ed !important;
  color: #18372b !important;
  font-weight: 750;
}

:global(.v-theme--light .select-workspace-view .workspace-entry) {
  min-height: 74px;
  margin-bottom: 10px;
  border: 1px solid #d8e2da;
  border-radius: 14px;
  background: #fff;
}

:global(.v-theme--light .select-workspace-view .workspace-entry:hover),
:global(.v-theme--light .select-workspace-view .workspace-entry:focus-visible) {
  border-color: #10cc83;
  background: #f3f7f2;
}

:global(.v-theme--light .select-workspace-view .workspace-entry:focus-visible) {
  outline: 3px solid #18372b;
  outline-offset: 2px;
}

:global(.v-theme--light .select-workspace-view .workspace-entry .v-avatar) {
  background: #e7f8ed !important;
  color: #246c51 !important;
}

:global(.v-theme--light .select-workspace-view .action-area) {
  padding: 18px 24px;
  background: #f3f7f2;
}

@media (max-width: 600px) {
  :global(.v-theme--light .select-workspace-view .workspace-card-heading) { padding: 24px 20px; }
  :global(.v-theme--light .select-workspace-view .action-area .v-btn) { width: 100%; }
}
</style>
