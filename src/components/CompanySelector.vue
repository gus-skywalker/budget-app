<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title class="headline">
        Selecione a Empresa
      </v-card-title>
      <v-card-text>
        <p class="mb-4">Você tem acesso a múltiplas empresas. Selecione a empresa com a qual deseja trabalhar:</p>
        <v-list>
          <v-list-item
            v-for="company in companies"
            :key="company.companyId"
            @click="selectCompany(company)"
            class="company-item"
          >
            <template v-slot:prepend>
              <v-icon>mdi-office-building</v-icon>
            </template>
            <v-list-item-title>{{ company.companyName || company.companyId }}</v-list-item-title>
            <v-list-item-subtitle>{{ getRoleLabel(company.role) }}</v-list-item-subtitle>
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
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  companies: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'company-selected'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectCompany = (company) => {
  emit('company-selected', company)
}

const getRoleLabel = (role) => {
  const normalized = (role || '').toUpperCase()
  const labels = {
    ROLE_ADMIN: 'Administrador',
    ROLE_OWNER: 'Proprietário',
    ROLE_MEMBER: 'Colaborador',
    ROLE_VIEWER: 'Visualizador',
    ROLE_CLIENT: 'Gestor',
    ROLE_USER: 'Usuário',
    OAUTH2_USER: 'Usuário OAuth2'
  }
  if (labels[normalized]) {
    return labels[normalized]
  }
  const legacyLabels = {
    admin: 'Administrador',
    member: 'Usuário',
    viewer: 'Visualizador'
  }
  return legacyLabels[role] || role
}
</script>

<style scoped>
.company-item {
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.company-item:hover {
  background-color: #f5f5f5;
}

.company-item:last-child {
  border-bottom: none;
}
</style>
