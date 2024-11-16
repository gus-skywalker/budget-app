<template>
  <v-container>
    <h1>{{ $t('group_management.title') }}</h1>
    <v-row>
      <!-- Coluna para criar grupo -->
      <v-col cols="12" md="6">
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('group_management.create_group') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-text-field :label="$t('group_management.group_name')" v-model="newGroup.name"></v-text-field>
            <v-text-field :label="$t('group_management.group_description')"
              v-model="newGroup.description"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="createGroup">{{ $t('group_management.create_group_button') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Coluna para gerenciar membros -->
      <v-col cols="12" md="6">
        <v-card class="section">
          <v-card-title>
            <h2>{{ $t('group_management.manage_members') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-select :label="$t('group_management.select_group')" v-model="selectedGroup" :items="groups"
              item-title="name" item-value="id" @update:model-value="fetchGroupMembers"></v-select>
            <v-text-field :label="$t('group_management.user_email')" v-model="inviteEmail"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="inviteMember">{{ $t('group_management.invite_member') }}</v-btn>
          </v-card-actions>
          <v-card-title>
            <h2>{{ $t('group_management.group_members') }}</h2>
          </v-card-title>
          <v-card-text>
            <v-list v-if="groupMembers.length">
              <v-list-item v-for="(member, index) in groupMembers" :key="index">
                <v-list-item-title>
                  {{ member.name }} - {{ member.email }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-alert v-else color="primary" type="info">
              {{ $t('group_management.no_members') }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar para mensagens de sucesso -->
    <v-snackbar v-model="successSnackbar" color="success">
      {{ $t('group_management.success_message') }}
      <v-btn color="white" text @click="successSnackbar = false">{{ $t('common.close') }}</v-btn>
    </v-snackbar>

    <!-- Snackbar para mensagens de erro -->
    <v-snackbar v-model="errorSnackbar" color="error">
      {{ $t('group_management.error_message') }}
      <v-btn color="white" text @click="errorSnackbar = false">{{ $t('common.close') }}</v-btn>
    </v-snackbar>
  </v-container>
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
