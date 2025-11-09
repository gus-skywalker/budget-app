<template>
  <div class="group-management-container">
    <v-container class="modern-container">
      <!-- Header -->
      <div class="group-header">
        <h1 class="page-title">{{ $t('group_management.title') }}</h1>
        <p class="page-subtitle">Crie e gerencie grupos financeiros</p>
      </div>

      <v-row>
        <!-- Coluna para criar grupo -->
        <v-col cols="12" md="6">
          <div class="modern-card create-group-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-account-multiple-plus</v-icon>
                {{ $t('group_management.create_group') }}
              </h2>
            </div>
            <div class="card-content">
              <v-text-field 
                :label="$t('group_management.group_name')" 
                v-model="newGroup.name"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input mb-4"
              ></v-text-field>
              <v-text-field 
                :label="$t('group_management.group_description')"
                v-model="newGroup.description"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input mb-4"
              ></v-text-field>
              <v-btn 
                color="primary" 
                @click="createGroup"
                class="modern-btn gradient-btn"
                size="large"
                block
              >
                <v-icon left>mdi-plus-circle</v-icon>
                {{ $t('group_management.create_group_button') }}
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Coluna para gerenciar membros -->
        <v-col cols="12" md="6">
          <div class="modern-card manage-members-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-account-group</v-icon>
                {{ $t('group_management.manage_members') }}
              </h2>
            </div>
            <div class="card-content">
              <v-select 
                :label="$t('group_management.select_group')" 
                v-model="selectedGroup" 
                :items="groups"
                item-title="name" 
                item-value="id" 
                @update:model-value="fetchGroupMembers"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input mb-4"
              ></v-select>
              <v-text-field 
                :label="$t('group_management.user_email')" 
                v-model="inviteEmail"
                variant="outlined"
                density="comfortable"
                color="#667eea"
                class="modern-input mb-4"
                type="email"
              ></v-text-field>
              <v-btn 
                color="primary" 
                @click="inviteMember"
                class="modern-btn gradient-btn"
                size="large"
                block
                :disabled="!selectedGroup"
              >
                <v-icon left>mdi-email-send</v-icon>
                {{ $t('group_management.invite_member') }}
              </v-btn>
            </div>
          </div>

          <!-- Lista de Membros -->
          <div class="modern-card members-list-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-account-multiple</v-icon>
                {{ $t('group_management.group_members') }}
              </h2>
            </div>
            <div class="card-content">
              <div v-if="groupMembers.length" class="members-list">
                <div 
                  v-for="(member, index) in groupMembers" 
                  :key="index"
                  class="member-item"
                >
                  <div class="member-avatar">
                    <v-icon color="#667eea">mdi-account-circle</v-icon>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-email">{{ member.email }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <v-icon size="48" color="#667eea" class="mb-3">mdi-account-group-outline</v-icon>
                <p class="empty-message">{{ $t('group_management.no_members') }}</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Snackbar para mensagens de sucesso -->
      <v-snackbar v-model="successSnackbar" color="success" class="modern-snackbar">
        {{ $t('group_management.success_message') }}
        <template #actions>
          <v-btn color="white" variant="text" @click="successSnackbar = false">
            {{ $t('common.close') }}
          </v-btn>
        </template>
      </v-snackbar>

      <!-- Snackbar para mensagens de erro -->
      <v-snackbar v-model="errorSnackbar" color="error" class="modern-snackbar">
        {{ $t('group_management.error_message') }}
        <template #actions>
          <v-btn color="white" variant="text" @click="errorSnackbar = false">
            {{ $t('common.close') }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>


<script>
import GroupService from '@/services/GroupService'

export default {
  data() {
    return {
      newGroup: {
        name: '',
        description: ''
      },
      groups: [],
      selectedGroup: null,
      inviteEmail: '',
      groupMembers: [],
      successSnackbar: false,
      successMessage: '',
      errorSnackbar: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.fetchGroups()
  },
  methods: {
    fetchGroups() {
      GroupService.fetchGroups()
        .then((response) => {
          this.groups = response.data.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            ownerId: group.ownerId,
            createdDate: group.createdDate
          }))
        })
        .catch((error) => {
          const errorMsg = error.response?.data?.message || 'Erro ao buscar grupos.'
          console.error('Erro ao buscar grupos:', error)
          this.errorMessage = errorMsg
          this.errorSnackbar = true
        })
    },
    fetchGroupMembers() {
      GroupService.fetchGroupMembers(this.selectedGroup)
        .then((response) => {
          this.groupMembers = response.data.map((member) => ({
            id: member.userId,
            name: member.name,
            email: member.email
          }))
        })
        .catch((error) => {
          const errorMsg = error.response?.data?.message || 'Erro ao buscar membros do grupo.'
          console.error('Erro ao buscar membros do grupo:', error)
          this.errorMessage = errorMsg
          this.errorSnackbar = true
        })
    },
    createGroup() {
      GroupService.createGroup(this.newGroup)
        .then((response) => {
          this.groups.push(response.data)
          this.newGroup = { name: '', description: '' }
          this.successMessage = 'Grupo criado com sucesso!'
          this.successSnackbar = true
        })
        .catch((error) => {
          const errorMsg = error.response?.data?.message || 'Erro ao criar grupo.'
          console.error('Erro ao criar grupo:', error)
          this.errorMessage = errorMsg
          this.errorSnackbar = true
        })
    },
    inviteMember() {
      if (this.inviteEmail === '') {
        this.errorMessage = 'Por favor, insira um email válido.'
        this.errorSnackbar = true
        return
      }

      GroupService.inviteMember(this.selectedGroup, this.inviteEmail)
        .then(() => {
          this.successMessage = `Convite enviado para ${this.inviteEmail}`
          this.successSnackbar = true
          this.inviteEmail = ''
        })
        .catch((error) => {
          const errorMsg =
            error.response?.data?.message || `Erro ao convidar usuário ${this.inviteEmail}.`
          console.error(`Erro ao convidar usuário ${this.inviteEmail}:`, error)
          this.errorMessage = errorMsg
          this.errorSnackbar = true
        })
    }
  }
}
</script>

<style scoped>
.group-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  padding: 32px 0;
}

.v-theme--dark .group-management-container {
  background: linear-gradient(135deg, #1e1e1e 0%, #141414 100%);
}

.modern-container {
  max-width: 1400px;
}

/* Header */
.group-header {
  margin-bottom: 32px;
  padding: 0 8px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.08);
}

.card-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  margin: 0;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

/* Inputs Modernos */
.modern-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Botões Modernos */
.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.gradient-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.gradient-btn:disabled {
  opacity: 0.6;
}

/* Members List */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.member-item:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

.member-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.v-theme--dark .member-avatar {
  background: #1e1e1e;
}

.member-avatar .v-icon {
  font-size: 32px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.v-theme--dark .member-name {
  color: #ffffff;
}

.member-email {
  font-size: 0.9rem;
  color: #666;
}

.v-theme--dark .member-email {
  color: #b0b0b0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}

/* Snackbar */
.modern-snackbar {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .group-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 2rem;
  }

  .card-content {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .group-management-container {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-content {
    padding: 16px;
  }

  .member-item {
    padding: 12px;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
  }

  .member-avatar .v-icon {
    font-size: 28px;
  }
}
</style>