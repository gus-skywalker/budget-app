<template>
  <div class="context-badge">
    <v-chip :color="chipColor" variant="tonal" size="small" class="context-chip">
      <v-icon start size="16">{{ chipIcon }}</v-icon>
      {{ contextLabel }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const { t } = useI18n()

const isTenantMode = computed(() => userStore.isTenantMode)
const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)
const workspaces = computed(() => userStore.getWorkspaces || [])
const tenantRole = computed(() => userStore.getTenantRole || null)

const currentWorkspaceName = computed(() => {
  const workspace = workspaces.value.find(
    (item: any) => item.workspaceId === currentWorkspaceId.value
  )
  return workspace?.workspaceName || null
})

const tenantRoleLabel = computed(() => {
  const role = String(tenantRole.value || '').trim()
  if (!role) return ''
  const key = `workspaceSwitcher.roles.${role.toUpperCase()}`
  const translated = t(key)
  return translated !== key ? translated : ''
})

const contextLabel = computed(() => {
  if (!isTenantMode.value || !currentWorkspaceId.value) {
    return t('context_badge.personal')
  }

  return t('context_badge.workspace', {
    workspace: currentWorkspaceName.value || t('context_badge.unnamed_workspace'),
    role: tenantRoleLabel.value ? ` · ${tenantRoleLabel.value}` : ''
  })
})

const chipColor = computed(() => (isTenantMode.value ? 'primary' : 'teal'))
const chipIcon = computed(() => (isTenantMode.value ? 'mdi-domain' : 'mdi-account'))
</script>

<style scoped>
.context-badge {
  display: flex;
  align-items: center;
  min-width: 0;
}

.context-chip {
  font-weight: 600;
  max-width: min(100%, 28rem);
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .context-badge {
    display: none;
  }
}
</style>
