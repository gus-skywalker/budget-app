<template>
  <div class="select-workspace-view">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="elevation-12 gradient-card">
            <v-card-title class="d-flex align-center justify-space-between">
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
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="router.push({ name: 'create-workspace', query: { redirect: redirectTarget } })"
              >
                {{ t('workspaceSwitcher.create_new_workspace') }}
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
</style>
