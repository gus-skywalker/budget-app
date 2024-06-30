<template>
    <v-container>
        <h1>Administração de Grupos</h1>
        <v-row>
            <!-- Coluna para criar grupo -->
            <v-col cols="12" md="6">
                <v-card class="section">
                    <v-card-title>
                        <h2>Criar Grupo</h2>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field label="Nome do Grupo" v-model="newGroup.name"></v-text-field>
                        <v-text-field label="Descrição" v-model="newGroup.description"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="createGroup">Criar Grupo</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <!-- Coluna para gerenciar membros -->
            <v-col cols="12" md="6">
                <v-card class="section">
                    <v-card-title>
                        <h2>Gerenciar Membros</h2>
                    </v-card-title>
                    <v-card-text>
                        <v-select label="Selecione o Grupo" v-model="selectedGroup" :items="groups" item-title="name"
                            item-value="id" @change="fetchGroupMembers"></v-select>
                        <v-text-field label="Email do Usuário" v-model="inviteEmail"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="inviteMember">Convidar Membro</v-btn>
                    </v-card-actions>
                    <v-card-title>
                        <h2>Membros do Grupo</h2>
                    </v-card-title>
                    <v-card-text>
                        <v-list v-if="groupMembers.length">
                            <v-list-item v-for="member in groupMembers" :key="member.id">
                                <v-list-item-title>{{ member.email }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info">
                            Nenhum membro no grupo selecionado.
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
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
            groupMembers: []
        };
    },
    mounted() {
        this.fetchGroups();
    },
    methods: {
        fetchGroups() {
            GroupService.fetchGroups()
                .then(response => {
                    console.log(response.data)
                    this.groups = response.data.map(group => ({
                        id: group.id,
                        name: group.name,
                        description: group.description,
                        adminId: group.adminId,
                        createdDate: group.createdDate
                    }));
                })
                .catch(error => {
                    console.error('Erro ao buscar grupos:', error);
                });
        },
        fetchGroupMembers() {
            GroupService.fetchGroupMembers(this.selectedGroup)
                .then(response => {
                    this.groupMembers = response.data;
                })
                .catch(error => {
                    console.error('Erro ao buscar membros do grupo:', error);
                });
        },
        createGroup() {
            GroupService.createGroup(this.newGroup)
                .then(response => {
                    this.groups.push(response.data);
                    this.newGroup = { name: '', description: '' };
                    alert('Grupo criado com sucesso!');
                })
                .catch(error => {
                    console.error('Erro ao criar grupo:', error);
                });
        },
        inviteMember() {
            if (this.inviteEmail === '') {
                alert('Por favor, insira um email válido.');
                return;
            }

            GroupService.inviteMember(this.selectedGroup, this.inviteEmail)
                .then(() => {
                    alert(`Convite enviado para ${this.inviteEmail}`);
                    this.inviteEmail = '';
                })
                .catch(error => {
                    console.error(`Erro ao convidar usuário ${this.inviteEmail}:`, error);
                });
        }
    }
}
</script>
