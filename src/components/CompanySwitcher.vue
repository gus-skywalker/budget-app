<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="company-switcher-btn"
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
      >
        <template v-slot:prepend>
          <v-icon>{{ company.companyId === currentCompanyId ? 'mdi-check-circle' : 'mdi-office-building-outline' }}</v-icon>
        </template>
        <v-list-item-title>{{ company.companyName || company.companyId }}</v-list-item-title>
        <v-list-item-subtitle>{{ getRoleLabel(company.role) }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const companies = computed(() => userStore.getCompanies)
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)

const currentCompanyName = computed(() => {
  const current = companies.value.find(c => c.companyId === currentCompanyId.value)
  return current?.companyName || current?.companyId || 'Selecione uma empresa'
})

const switchCompany = (company) => {
  if (company.companyId !== currentCompanyId.value) {
    userStore.setCurrentCompany(company.companyId, company.role)
    // Recarrega a página atual para atualizar os dados
    router.go(0)
  }
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    member: 'Membro',
    viewer: 'Visualizador'
  }
  return labels[role] || role
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
