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

const isWorkspaceMode = computed(() => userStore.isWorkspaceMode)
const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)
const workspaces = computed(() => userStore.getWorkspaces || [])
const tenantRole = computed(() => userStore.getTenantRole || null)

const currentWorkspaceName = computed(() => {
  const workspace = workspaces.value.find((item: any) => item.companyId === currentWorkspaceId.value)
  return workspace?.companyName || null
})

const contextLabel = computed(() => {
  if (!isWorkspaceMode.value || !currentWorkspaceId.value) {
    return t('context_badge.personal')
  }

  return t('context_badge.company', {
    company: currentWorkspaceName.value || currentWorkspaceId.value,
    role: tenantRole.value ? ` (${tenantRole.value})` : ''
  })
})

const chipColor = computed(() => (isWorkspaceMode.value ? 'primary' : 'teal'))
const chipIcon = computed(() => (isWorkspaceMode.value ? 'mdi-domain' : 'mdi-account'))
</script>

<style scoped>
.context-badge {
  display: flex;
  align-items: center;
}

.context-chip {
  font-weight: 600;
}
</style>
