<template>
  <div class="select-workspace-view">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="elevation-12 gradient-card">
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <h2 class="title mb-1">Escolha um workspace</h2>
                <p class="subtitle">Defina o workspace ativo para continuar</p>
              </div>
              <v-chip color="primary" variant="flat" size="small">
                {{ workspaces.length }} workspaces
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-alert
                v-if="!workspaces.length"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Nao encontramos nenhum workspace no seu perfil. Voce pode criar um agora mesmo.
              </v-alert>

              <v-list v-else density="comfortable" nav>
                <v-list-item
                  v-for="workspace in workspaces"
                  :key="workspace.companyId"
                  class="workspace-entry"
                  :disabled="loadingWorkspace === workspace.companyId"
                  @click="selectWorkspace(workspace.companyId)"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-office-building</v-icon>
                    </v-avatar>
                  </template>
                  <div class="d-flex flex-column">
                    <span class="workspace-name">{{ workspace.companyName || workspace.companyId }}</span>
                    <small class="role-label">{{ getRoleLabel(workspace.role) }}</small>
                  </div>
                  <template #append>
                    <v-progress-circular
                      v-if="loadingWorkspace === workspace.companyId"
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
                Criar workspace
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
import { useUserStore } from '@/plugins/userStore'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const workspaces = computed(() => userStore.getWorkspaces)
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
  const labels: Record<string, string> = {
    ROLE_OWNER: 'Proprietario',
    ROLE_ADMIN: 'Administrador',
    ROLE_MEMBER: 'Colaborador',
    ROLE_VIEWER: 'Visualizador'
  }
  return labels[normalized] || 'Sem permissao definida'
}

const selectWorkspace = async (workspaceId: string) => {
  if (loadingWorkspace.value) return
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
