<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="company-switcher-btn"
        :loading="isLoading"
      >
        <v-icon left>mdi-office-building</v-icon>
        <span class="ml-2">{{ currentCompanyName }}</span>
        <v-icon right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="company in companies"
        :key="company.companyId"
        @click="switchCompany(company)"
        :class="{ 'active-company': company.companyId === currentCompanyId }"
        :disabled="isLoading"
      >
        <template v-slot:prepend>
          <v-icon>{{ company.companyId === currentCompanyId ? 'mdi-check-circle' : 'mdi-office-building-outline' }}</v-icon>
        </template>
        <v-list-item-title>{{ company.companyName || company.companyId }}</v-list-item-title>
        <v-list-item-subtitle>{{ getRoleLabel(company.role) }}</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="my-2"></v-divider>
      <v-list-item @click="createCompany" :disabled="isLoading">
        <template v-slot:prepend>
          <v-icon>mdi-plus</v-icon>
        </template>
        <v-list-item-title>Criar Novo Workspace</v-list-item-title>
        <v-list-item-subtitle>Adicionar workspace ao seu perfil</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(false)

const companies = computed(() => userStore.getCompanies)
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)

const currentCompanyName = computed(() => {
  const current = companies.value.find(c => c.companyId === currentCompanyId.value)
  return current?.companyName || current?.companyId || 'Selecione um workspace'
})

const switchCompany = async (company) => {
  if (company.companyId !== currentCompanyId.value && !isLoading.value) {
    try {
      isLoading.value = true
      await userStore.selectCompany(company.companyId)
      await router.push('/dashboard')
    } catch (err) {
      console.error('Erro ao trocar workspace:', err)
      alert('Erro ao trocar de workspace. Tente novamente.')
    } finally {
      isLoading.value = false
    }
  }
}

const createCompany = () => {
  router.push('/create-company')
}

const getRoleLabel = (role) => {
  const normalized = (role || '').toUpperCase()
  const labels = {
    ROLE_ADMIN: 'Administrador',
    ROLE_OWNER: 'Proprietario',
    ROLE_MEMBER: 'Colaborador',
    ROLE_VIEWER: 'Visualizador',
    ROLE_CLIENT: 'Gestor',
    ROLE_USER: 'Usuario',
    OAUTH2_USER: 'Usuario OAuth2'
  }
  if (labels[normalized]) {
    return labels[normalized]
  }
  const legacyLabels = {
    admin: 'Administrador',
    member: 'Usuario',
    viewer: 'Visualizador',
    user: 'Usuario'
  }
  return legacyLabels[role] || role
}
</script>

<style scoped>
.company-switcher-btn {
  text-transform: none;
}

.active-company {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
