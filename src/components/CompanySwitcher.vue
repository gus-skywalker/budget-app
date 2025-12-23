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
        :class="{ 'active-company': !currentCompanyId }"
        @click="switchToPersonal"
        :disabled="isLoading || !canSwitchToPersonal"
      >
        <template v-slot:prepend>
          <v-icon>{{ !currentCompanyId ? 'mdi-check-circle' : 'mdi-account' }}</v-icon>
        </template>
        <v-list-item-title>Modo Pessoal</v-list-item-title>
        <v-list-item-subtitle>
          {{ canSwitchToPersonal ? 'Usar o app sem empresa' : 'Disponível após login' }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider class="my-2" v-if="companies.length"></v-divider>

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
        <v-list-item-title>Criar Nova Empresa</v-list-item-title>
        <v-list-item-subtitle>Adicionar empresa ao seu perfil</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import CompanyService from '@/services/CompanyService'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(false)

const companies = computed(() => userStore.getCompanies)
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)
const canSwitchToPersonal = computed(() => !!userStore.personalToken)

const currentCompanyName = computed(() => {
  if (!currentCompanyId.value) {
    return 'Modo Pessoal'
  }
  const current = companies.value.find(c => c.companyId === currentCompanyId.value)
  return current?.companyName || current?.companyId || 'Selecione uma empresa'
})

const switchToPersonal = async () => {
  if (!canSwitchToPersonal.value || !userStore.personalToken || !userStore.personalRefreshToken || isLoading.value) {
    return
  }
  try {
    isLoading.value = true
    userStore.setToken(userStore.personalToken)
    userStore.setRefreshToken(userStore.personalRefreshToken)
    userStore.clearCurrentCompany()
    router.go(0)
  } finally {
    isLoading.value = false
  }
}

const switchCompany = async (company) => {
  if (company.companyId !== currentCompanyId.value && !isLoading.value) {
    try {
      isLoading.value = true
      
      // Chama API para selecionar empresa e obter novos tokens
      const res = await CompanyService.selectCompany(company.companyId)
      
      // Atualiza tokens com a resposta da API
      userStore.setToken(res.data.accessToken)
      userStore.setRefreshToken(res.data.refreshToken)
      
      // Decodifica novo JWT para obter companyId e userRole
      const decodedToken = jwtDecode(res.data.accessToken)
      const userRole = decodedToken.userRole || decodedToken.role
      
      // Atualiza empresa atual
      userStore.setCurrentCompany(company.companyId, userRole, company.companyName)
      
      // Recarrega a página atual para atualizar os dados
      router.go(0)
    } catch (err) {
      console.error('Erro ao trocar empresa:', err)
      alert('Erro ao trocar de empresa. Tente novamente.')
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
    ROLE_CLIENT: 'Gestor',
    ROLE_OWNER: 'Proprietário',
    ROLE_USER: 'Usuário',
    OAUTH2_USER: 'Usuário OAuth2'
  }
  if (labels[normalized]) {
    return labels[normalized]
  }
  const legacyLabels = {
    admin: 'Administrador',
    member: 'Usuário',
    viewer: 'Visualizador',
    user: 'Usuário'
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
