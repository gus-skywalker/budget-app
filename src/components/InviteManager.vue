<template>
  <v-card class="invite-manager">
    <v-card-title>
      <v-icon left>mdi-account-plus</v-icon>
      {{ $t('workspaceInviteManager.title') }}
    </v-card-title>
    
    <v-card-text>
      <!-- Formulário de convite -->
      <v-form ref="inviteForm" v-model="valid" @submit.prevent="sendInvite">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="inviteEmail"
              :rules="emailRules"
              :label="$t('workspaceInviteManager.email_label')"
              :placeholder="$t('workspaceInviteManager.email_placeholder')"
              type="email"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="inviteRole"
              :items="roleOptionsI18n"
              :label="$t('workspaceInviteManager.role_label')"
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
          {{ $t('workspaceInviteManager.send_invite') }}
        </v-btn>
      </v-form>

      <v-divider class="my-4"></v-divider>

      <!-- Lista de convites pendentes -->
      <div class="invites-list">
        <h3 class="mb-3">{{ $t('workspaceInviteManager.pending_title') }}</h3>
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
              {{ getRoleLabel(invite.role) }} • {{ formatDate(invite.createdAt) }}
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
          {{ $t('workspaceInviteManager.no_pending') }}
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
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import WorkspaceInviteService from '@/services/WorkspaceInviteService'

const { t } = useI18n()

const userStore = useUserStore()
const currentWorkspaceId = computed(() => userStore.getCurrentWorkspaceId)

const inviteForm = ref(null)
const valid = ref(false)
const loading = ref(false)
const loadingInvites = ref(false)
const cancellingInvite = ref(null)

const inviteEmail = ref('')
const inviteRole = ref('ROLE_MEMBER')
const pendingInvites = ref([])

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const roleOptionsI18n = [
  { title: t('workspaceInviteManager.admin'), value: 'ROLE_ADMIN' },
  { title: t('workspaceInviteManager.member'), value: 'ROLE_MEMBER' },
  { title: t('workspaceInviteManager.viewer'), value: 'ROLE_VIEWER' },
  { title: t('workspaceInviteManager.owner'), value: 'ROLE_OWNER' },
  { title: t('workspaceInviteManager.user'), value: 'ROLE_USER' },
  { title: t('workspaceInviteManager.client'), value: 'ROLE_CLIENT' },
  { title: t('workspaceInviteManager.oauth2_user'), value: 'OAUTH2_USER' }
]

const emailRules = [
  v => !!v || t('workspaceInviteManager.email_label') + ' ' + t('validation.required'),
  v => /.+@.+\..+/.test(v) || t('authentication.login.invalid_email')
]

onMounted(() => {
  loadInvites()
})

const sendInvite = async () => {
  if (!inviteForm.value.validate()) return
  if (!currentWorkspaceId.value) {
    showSnackbar(t('workspaceInviteManager.select_company'), 'error')
    return
  }
  
  try {
    loading.value = true
    await WorkspaceInviteService.inviteWorkspaceUser(
      currentWorkspaceId.value,
      inviteEmail.value,
      inviteRole.value
    )
    
    showSnackbar(t('workspaceInviteManager.invite_success'), 'success')
    inviteEmail.value = ''
    inviteRole.value = 'ROLE_MEMBER'
    inviteForm.value.reset()
    loadInvites()
  } catch (error) {
    const message = error.response?.data?.message || t('workspaceInviteManager.invite_error')
    showSnackbar(message, 'error')
  } finally {
    loading.value = false
  }
}

const loadInvites = async () => {
  if (!currentWorkspaceId.value) return
  try {
    loadingInvites.value = true
    pendingInvites.value = await WorkspaceInviteService.listWorkspaceInvites(currentWorkspaceId.value)
  } catch (error) {
    console.error('Erro ao carregar convites:', error)
  } finally {
    loadingInvites.value = false
  }
}

const cancelInvite = async (inviteId) => {
  if (!currentWorkspaceId.value) return
  try {
    cancellingInvite.value = inviteId
    await WorkspaceInviteService.cancelWorkspaceInvite(currentWorkspaceId.value, inviteId)
    showSnackbar(t('workspaceInviteManager.cancel_success'), 'info')
    loadInvites()
  } catch (error) {
    const message = error.response?.data?.message || t('workspaceInviteManager.cancel_error')
    showSnackbar(message, 'error')
  } finally {
    cancellingInvite.value = null
  }
}

const getRoleLabel = (role) => {
  const normalized = (role || '').toUpperCase()
  switch (normalized) {
    case 'ROLE_ADMIN': return t('workspaceInviteManager.admin')
    case 'ROLE_OWNER': return t('workspaceInviteManager.owner')
    case 'ROLE_MEMBER': return t('workspaceInviteManager.member')
    case 'ROLE_VIEWER': return t('workspaceInviteManager.viewer')
    case 'ROLE_USER': return t('workspaceInviteManager.user')
    case 'ROLE_CLIENT': return t('workspaceInviteManager.client')
    case 'OAUTH2_USER': return t('workspaceInviteManager.oauth2_user')
    default: return role
  }
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
