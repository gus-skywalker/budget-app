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
        <v-list-item-title>{{ $t('companySwitcher.create_new_workspace') }}</v-list-item-title>
        <v-list-item-subtitle>{{ $t('companySwitcher.add_workspace') }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
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

const companies = computed(() => userStore.getCompanies)
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)

const currentCompanyName = computed(() => {
  const current = companies.value.find(c => c.companyId === currentCompanyId.value)
  return current?.companyName || current?.companyId || t('companySwitcher.select_workspace')
})

const switchCompany = async (company) => {
  if (company.companyId !== currentCompanyId.value && !isLoading.value) {
    try {
      isLoading.value = true
      await userStore.selectCompany(company.companyId)
      await router.push('/dashboard')
    } catch (err) {
      console.error('Erro ao trocar workspace:', err)
      alert(t('companySwitcher.error_switch'))
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
  if (t(`companySwitcher.roles.${normalized}`) !== `companySwitcher.roles.${normalized}`) {
    return t(`companySwitcher.roles.${normalized}`)
  }
  if (t(`companySwitcher.roles.${role}`) !== `companySwitcher.roles.${role}`) {
    return t(`companySwitcher.roles.${role}`)
  }
  return role
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
