<template>
  <v-card class="invite-manager">
    <v-card-title>
      <v-icon left>mdi-account-plus</v-icon>
      Gerenciar Convites
    </v-card-title>
    
    <v-card-text>
      <!-- Formulário de convite -->
      <v-form ref="inviteForm" v-model="valid" @submit.prevent="sendInvite">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="inviteEmail"
              :rules="emailRules"
              label="E-mail do usuário"
              placeholder="usuario@exemplo.com"
              type="email"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="inviteRole"
              :items="roleOptions"
              label="Papel"
              required
            ></v-select>
          </v-col>
        </v-row>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="loading"
          @click="sendInvite"
        >
          <v-icon left>mdi-email-send</v-icon>
          Enviar Convite
        </v-btn>
      </v-form>

      <v-divider class="my-4"></v-divider>

      <!-- Lista de convites pendentes -->
      <div class="invites-list">
        <h3 class="mb-3">Convites Pendentes</h3>
        <v-progress-linear v-if="loadingInvites" indeterminate></v-progress-linear>
        
        <v-list v-else-if="pendingInvites.length > 0">
          <v-list-item
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="invite-item"
          >
            <template v-slot:prepend>
              <v-avatar color="primary">
                <v-icon>mdi-email-outline</v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-title>{{ invite.email }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ getRoleLabel(invite.role) }} • Enviado em {{ formatDate(invite.createdAt) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon
                size="small"
                color="error"
                @click="cancelInvite(invite.id)"
                :loading="cancellingInvite === invite.id"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal">
          Nenhum convite pendente no momento.
        </v-alert>
      </div>
    </v-card-text>

    <!-- Snackbar de feedback -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import InviteService from '@/services/InviteService'

const userStore = useUserStore()
const currentCompanyId = computed(() => userStore.getCurrentCompanyId)

const inviteForm = ref(null)
const valid = ref(false)
const loading = ref(false)
const loadingInvites = ref(false)
const cancellingInvite = ref(null)

const inviteEmail = ref('')
const inviteRole = ref('ROLE_USER')
const pendingInvites = ref([])

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const roleOptions = [
  { title: 'Administrador', value: 'ROLE_ADMIN' },
  { title: 'Gestor', value: 'ROLE_CLIENT' },
  { title: 'Usuário', value: 'ROLE_USER' }
]

const emailRules = [
  v => !!v || 'E-mail é obrigatório',
  v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
]

onMounted(() => {
  loadInvites()
})

const sendInvite = async () => {
  if (!inviteForm.value.validate()) return
  
  try {
    loading.value = true
    await InviteService.inviteUser(
      currentCompanyId.value,
      inviteEmail.value,
      inviteRole.value
    )
    
    showSnackbar('Convite enviado com sucesso!', 'success')
    inviteEmail.value = ''
    inviteRole.value = 'ROLE_USER'
    inviteForm.value.reset()
    loadInvites()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao enviar convite'
    showSnackbar(message, 'error')
  } finally {
    loading.value = false
  }
}

const loadInvites = async () => {
  try {
    loadingInvites.value = true
    pendingInvites.value = await InviteService.listInvites(currentCompanyId.value)
  } catch (error) {
    console.error('Erro ao carregar convites:', error)
  } finally {
    loadingInvites.value = false
  }
}

const cancelInvite = async (inviteId) => {
  try {
    cancellingInvite.value = inviteId
    await InviteService.cancelInvite(currentCompanyId.value, inviteId)
    showSnackbar('Convite cancelado', 'info')
    loadInvites()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao cancelar convite'
    showSnackbar(message, 'error')
  } finally {
    cancellingInvite.value = null
  }
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
    viewer: 'Visualizador'
  }
  return legacyLabels[role] || role
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const showSnackbar = (message, color) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}
</script>

<style scoped>
.invite-manager {
  max-width: 800px;
  margin: 0 auto;
}

.invites-list {
  margin-top: 16px;
}

.invite-item {
  border-bottom: 1px solid #e0e0e0;
}

.invite-item:last-child {
  border-bottom: none;
}
</style>
