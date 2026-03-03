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

const userStore = useUserStore()

const isTenantMode = computed(() => userStore.isTenantMode)
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)
const companies = computed(() => userStore.getCompanies || [])
const tenantRole = computed(() => userStore.getTenantRole || null)

const currentCompanyName = computed(() => {
  const company = companies.value.find((item: any) => item.companyId === currentCompanyId.value)
  return company?.companyName || null
})

const contextLabel = computed(() => {
  if (!isTenantMode.value || !currentCompanyId.value) {
    return 'Contexto: Pessoal'
  }

  const roleSuffix = tenantRole.value ? ` (${tenantRole.value})` : ''
  const companySuffix = currentCompanyName.value ? ` - ${currentCompanyName.value}` : ` - ${currentCompanyId.value}`
  return `Contexto: Empresa${companySuffix}${roleSuffix}`
})

const chipColor = computed(() => (isTenantMode.value ? 'primary' : 'teal'))
const chipIcon = computed(() => (isTenantMode.value ? 'mdi-domain' : 'mdi-account'))
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
