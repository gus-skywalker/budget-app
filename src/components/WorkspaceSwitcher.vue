<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="text" class="workspace-switcher-btn" :loading="isLoading">
        <v-icon left>mdi-office-building</v-icon>
        <span class="ml-2">{{ currentWorkspaceName }}</span>
        <v-icon right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="workspace in workspaces"
        :key="workspace.workspaceId"
        @click="switchWorkspace(workspace)"
        :class="{ 'active-workspace': workspace.workspaceId === currentWorkspaceId }"
        :disabled="isLoading"
      >
        <template v-slot:prepend>
          <v-icon>{{
            workspace.workspaceId === currentWorkspaceId
              ? 'mdi-check-circle'
              : 'mdi-office-building-outline'
          }}</v-icon>
        </template>
        <v-list-item-title>{{
          workspace.workspaceName || workspace.workspaceId
        }}</v-list-item-title>
        <v-list-item-subtitle>{{ getRoleLabel(workspace.role) }}</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="my-2"></v-divider>
      <v-list-item @click="createWorkspace" :disabled="isLoading">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>{{ $t('workspaceSwitcher.create_new_workspace') }}</v-list-item-title>
        <v-list-item-subtitle>{{ $t('workspaceSwitcher.add_workspace') }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'error',
})

const workspaces = computed(() => userStore.getWorkspaces)
const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)

const currentWorkspaceName = computed(() => {
  const current = workspaces.value.find(
    (workspace) => workspace.workspaceId === currentWorkspaceId.value
  )
  return current?.workspaceName || t('workspaceSwitcher.select_workspace')
})

const showMessage = (message, color = 'error') => {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}

const switchWorkspace = async (workspace) => {
  const workspaceId = workspace.workspaceId
  if (workspaceId !== currentWorkspaceId.value && !isLoading.value) {
    try {
      isLoading.value = true
      await userStore.selectWorkspace(workspaceId)
      await router.push('/dashboard')
    } catch (err) {
      console.error('Erro ao trocar workspace:', err)
      showMessage(t('workspaceSwitcher.error_switch'))
    } finally {
      isLoading.value = false
    }
  }
}

const createWorkspace = () => {
  router.push('/create-workspace')
}

const getRoleLabel = (role) => {
  const normalized = (role || '').toUpperCase()
  if (t(`workspaceSwitcher.roles.${normalized}`) !== `workspaceSwitcher.roles.${normalized}`) {
    return t(`workspaceSwitcher.roles.${normalized}`)
  }
  if (t(`workspaceSwitcher.roles.${role}`) !== `workspaceSwitcher.roles.${role}`) {
    return t(`workspaceSwitcher.roles.${role}`)
  }
  return ''
}
</script>

<style scoped>
.workspace-switcher-btn {
  text-transform: none;
  max-width: 100%;
}

.workspace-switcher-btn :deep(.v-btn__content) {
  min-width: 0;
}

.workspace-switcher-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-workspace {
  background-color: rgba(15, 23, 42, 0.06);
  font-weight: bold;
}
</style>
