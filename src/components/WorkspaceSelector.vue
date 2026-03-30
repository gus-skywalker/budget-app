<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">
        {{ $t('workspaceSelector.title') }}
      </v-card-title>
      <v-card-text>
        <p class="mb-4">{{ $t('workspaceSelector.desc') }}</p>
        <v-list>
          <v-list-item
            v-for="workspace in companies"
            :key="workspace.companyId"
            @click="selectWorkspace(workspace)"
            class="workspace-item"
          >
            <template v-slot:prepend>
              <v-icon>mdi-office-building</v-icon>
            </template>
            <v-list-item-title>{{ workspace.companyName || workspace.companyId }}</v-list-item-title>
            <v-list-item-subtitle>{{ getRoleLabel(workspace.role) }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  companies: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'workspace-selected'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectWorkspace = (workspace) => {
  emit('workspace-selected', workspace)
}

const getRoleLabel = (role) => {
  const normalized = (role || '').toUpperCase()
  if (t(`workspaceSelector.roles.${normalized}`) !== `workspaceSelector.roles.${normalized}`) {
    return t(`workspaceSelector.roles.${normalized}`)
  }
  if (t(`workspaceSelector.roles.${role}`) !== `workspaceSelector.roles.${role}`) {
    return t(`workspaceSelector.roles.${role}`)
  }
  return role
}
</script>

<style scoped>
.workspace-item {
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.workspace-item:hover {
  background-color: #f5f5f5;
}

.workspace-item:last-child {
  border-bottom: none;
}
</style>
