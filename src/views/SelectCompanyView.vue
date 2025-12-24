<template>
  <div class="select-company-view">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="elevation-12 gradient-card">
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <h2 class="title mb-1">Escolha uma empresa</h2>
                <p class="subtitle">Defina o tenant ativo para continuar</p>
              </div>
              <v-chip color="primary" variant="flat" size="small">
                {{ companies.length }} empresas
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-alert
                v-if="!companies.length"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Não encontramos nenhuma empresa no seu perfil. Você pode criar uma agora mesmo.
              </v-alert>

              <v-list v-else density="comfortable" nav>
                <v-list-item
                  v-for="company in companies"
                  :key="company.companyId"
                  class="company-entry"
                  :disabled="loadingCompany === company.companyId"
                  @click="selectCompany(company.companyId)"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-office-building</v-icon>
                    </v-avatar>
                  </template>
                  <div class="d-flex flex-column">
                    <span class="company-name">{{ company.companyName || company.companyId }}</span>
                    <small class="role-label">{{ getRoleLabel(company.role) }}</small>
                  </div>
                  <template #append>
                    <v-progress-circular
                      v-if="loadingCompany === company.companyId"
                      indeterminate
                      size="20"
                      color="primary"
                    />
                    <v-icon v-else>mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="action-area">
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-account"
                :disabled="switchingToPersonal"
                @click="switchToPersonal"
              >
                Usar modo pessoal
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="router.push({ name: 'create-company' })"
              >
                Criar empresa
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const companies = computed(() => userStore.getCompanies)
const redirectTarget = computed(() => (route.query.redirect as string) || '/dashboard')
const loadingCompany = ref<string | null>(null)
const switchingToPersonal = ref(false)

const getRoleLabel = (role?: string | null) => {
  const normalized = (role || '').toUpperCase()
  const labels: Record<string, string> = {
    ROLE_OWNER: 'Proprietário',
    ROLE_ADMIN: 'Administrador',
    ROLE_MEMBER: 'Colaborador',
    ROLE_VIEWER: 'Visualizador'
  }
  return labels[normalized] || 'Sem permissão definida'
}

const selectCompany = async (companyId: string) => {
  if (loadingCompany.value) return
  try {
    loadingCompany.value = companyId
    await userStore.selectCompany(companyId)
    router.push(redirectTarget.value)
  } catch (error) {
    console.error('Erro ao selecionar empresa pela tela dedicada:', error)
  } finally {
    loadingCompany.value = null
  }
}

const switchToPersonal = async () => {
  if (switchingToPersonal.value) return
  if (!userStore.isTenantMode) {
    router.push(redirectTarget.value)
    return
  }
  try {
    switchingToPersonal.value = true
    await userStore.clearCompanySelection()
    router.push(redirectTarget.value)
  } catch (error) {
    console.error('Erro ao voltar para o modo pessoal:', error)
  } finally {
    switchingToPersonal.value = false
  }
}
</script>

<style scoped>
.select-company-view {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1f2a44 25%, #0f172a 70%);
  color: #fff;
}

.gradient-card {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
}

.title {
  font-weight: 600;
  font-size: 1.4rem;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.company-entry {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: background 0.2s ease;
}

.company-entry:hover {
  background: rgba(255, 255, 255, 0.08);
}

.company-name {
  font-weight: 600;
}

.role-label {
  color: rgba(255, 255, 255, 0.7);
}

.action-area {
  background: rgba(255, 255, 255, 0.04);
}
</style>
