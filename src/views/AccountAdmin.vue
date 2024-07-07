<!-- views/AccountAdmin.vue -->
<template>
    <div>
        <h1>Administração de Conta</h1>

        <v-container>
            <v-row>
                <v-col cols="12" md="6">
                    <h2>Informações Básicas do Perfil</h2>
                    <v-form>
                        <v-text-field v-model="username" label="Nome de Usuário"></v-text-field>
                        <v-text-field v-model="email" label="Email" type="email"></v-text-field>
                        <v-file-input v-model="avatar" label="Foto de Perfil"></v-file-input>
                        <v-btn @click="saveProfile">Salvar Mudanças</v-btn>
                    </v-form>
                </v-col>

                <v-col cols="12" md="6">
                    <h2>Segurança</h2>
                    <v-form>
                        <v-text-field v-model="currentPassword" label="Senha Atual" type="password"></v-text-field>
                        <v-text-field v-model="newPassword" label="Nova Senha" type="password"></v-text-field>
                        <v-btn @click="changePassword">Alterar Senha</v-btn>
                    </v-form>

                    <v-switch v-model="twoFactorAuth" label="Autenticação de Dois Fatores"></v-switch>
                </v-col>
            </v-row>

            <v-divider></v-divider>

            <v-row>
                <v-col cols="12" md="6">
                    <h2>Preferências</h2>
                    <v-switch v-model="notificationEmail" label="Notificações por Email"></v-switch>
                    <v-switch v-model="notificationPush" label="Notificações Push"></v-switch>
                    <v-switch v-model="darkTheme" label="Tema Escuro"></v-switch>
                </v-col>

                <v-col cols="12" md="6">
                    <h2>Conexões de Conta</h2>
                    <v-btn @click="connectGoogle">Conectar Conta Google</v-btn>
                    <v-btn @click="disconnectGoogle">Desconectar Conta Google</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Informações Básicas do Perfil
const username = ref('');
const email = ref('');
const avatar = ref(null);

// Segurança
const currentPassword = ref('');
const newPassword = ref('');
const twoFactorAuth = ref(false);

// Preferências
const notificationEmail = ref(true);
const notificationPush = ref(true);
const darkTheme = ref(false);

// Funções para manipular as ações do usuário
const saveProfile = () => {
    // Lógica para salvar as mudanças do perfil
};

const changePassword = () => {
    // Lógica para alterar a senha do usuário
};

const connectGoogle = () => {
    // Lógica para conectar a conta Google
};

const disconnectGoogle = () => {
    // Lógica para desconectar a conta Google
};
</script>

<style scoped>
/* Estilos para a página de administração da conta */
</style>
