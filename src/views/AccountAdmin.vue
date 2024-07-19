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

                    <!-- Adicionando uma linha de divisão entre Google e Bancos -->
                    <v-divider class="my-4"></v-divider>

                    <!-- Cartões de Bancos -->
                    <div class="bank-cards-wrapper">
                        <div class="bank-cards">
                            <v-card @mouseover="highlightCard('Nubank')" @mouseleave="highlightCard('')"
                                @click="openBankDialog('Nubank')" class="bank-card"
                                :class="{ selected: selectedBank === 'Nubank' }">
                                <v-img src="nubank-logo.png" aspect-ratio="1"></v-img>
                                <v-card-text>Nubank</v-card-text>
                            </v-card>
                            <v-card @mouseover="highlightCard('Banco do Brasil')" @mouseleave="highlightCard('')"
                                @click="openBankDialog('Banco do Brasil')" class="bank-card"
                                :class="{ selected: selectedBank === 'Banco do Brasil' }">
                                <v-img src="banco-do-brasil-logo.png" aspect-ratio="1"></v-img>
                                <v-card-text>Banco do Brasil</v-card-text>
                            </v-card>
                            <v-card @mouseover="highlightCard('Caixa Econômica')" @mouseleave="highlightCard('')"
                                @click="openBankDialog('Caixa Econômica')" class="bank-card"
                                :class="{ selected: selectedBank === 'Caixa Econômica' }">
                                <v-img src="caixa-economica-logo.png" aspect-ratio="1"></v-img>
                                <v-card-text>Caixa Econômica</v-card-text>
                            </v-card>
                        </div>
                        <div class="card-name" v-if="highlightedCard">
                            {{ highlightedCard }}
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-container>

        <!-- Diálogo de Login do Banco -->
        <v-dialog v-model="bankDialog" max-width="500">
            <v-card>
                <v-card-title>
                    <v-icon color="primary" class="mr-2">mdi-lock</v-icon>
                    <span class="headline">Conectar a {{ selectedBank }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form>
                        <v-text-field v-model="bankLogin" label="Login"></v-text-field>
                        <v-text-field v-model="bankPassword" label="Senha" type="password"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="connectBank">Conectar</v-btn>
                    <v-btn @click="closeBankDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BankService from '@/services/BankService';
import { useBankStore } from '@/plugins/bankStore';

const bankStore = useBankStore();
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

// Estado do diálogo de banco
const bankDialog = ref(false);
const selectedBank = ref('');
const bankLogin = ref('');
const bankPassword = ref('');
const highlightedCard = ref('');

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

const openBankDialog = (bank: string) => {
    selectedBank.value = bank;
    bankDialog.value = true;
};

const closeBankDialog = () => {
    bankDialog.value = false;
    bankLogin.value = '';
    bankPassword.value = '';
};

const highlightCard = (cardName: string) => {
    highlightedCard.value = cardName;
};

const connectBank = async () => {
    try {
        // Autenticar no Nubank
        const accessTokenResponse = await authenticateNubank();
        const accessToken = accessTokenResponse;

        // Gerar certificado no Nubank
        // const certDataResponse = await generateNubankCert();
        // const certData = certDataResponse;

        // Exemplo de como lidar com os dados retornados
        console.log('Token de acesso:', accessToken);
        // console.log('Dados do certificado:', certData);

        // Aqui você pode salvar o token de acesso e os dados do certificado localmente,
        // ou atualizar o estado do Vue.js conforme necessário

        // Fechar o diálogo de banco após a conexão bem sucedida
        closeBankDialog();
    } catch (error) {
        console.error('Erro ao conectar ao Nubank:', error);
        // Tratar o erro conforme necessário, exibindo uma mensagem de erro ao usuário, por exemplo
    }
};

// Função para autenticar no Nubank
const authenticateNubank = async () => {
    try {
        const data = {
            cpf: bankLogin.value,
            password: bankPassword.value
        };
        const response = await BankService.authenticateNubank(data);
        // Aqui você pode salvar o token de acesso localmente ou atualizar o estado do Vue.js
        bankStore.setNubankToken(response.data);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Erro ao autenticar no Nubank:', error);
        // Tratar o erro conforme necessário
    }
};

// Função para gerar certificado no Nubank
const generateNubankCert = async () => {
    try {
        const data = {
            cpf: bankLogin.value,
            password: bankPassword.value
        };

        const response = await BankService.generateNubankCert(data);
        const certData = response.data;

        // Exemplo de como lidar com os dados do certificado retornado
        console.log('Dados do certificado:', certData);

        // Aqui você pode salvar os dados do certificado localmente ou atualizar o estado do Vue.js
    } catch (error) {
        console.error('Erro ao gerar certificado no Nubank:', error);
        // Tratar o erro conforme necessário
    }
};

</script>

<style scoped>
/* Estilos para a página de administração da conta */
.bank-cards-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bank-cards {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.bank-card {
    position: absolute;
    width: 100px;
    cursor: pointer;
    transition: transform 0.5s ease, z-index 0.5s ease;
    text-align: center;
}

.bank-card:nth-child(1) {
    left: 0;
    z-index: 3;
}

.bank-card:nth-child(2) {
    left: 20px;
    z-index: 2;
}

.bank-card:nth-child(3) {
    left: 40px;
    z-index: 1;
}

.bank-card:hover {
    transform: translateY(-20px);
}

.bank-card.selected {
    transform: translateY(-40px) scale(1.1);
    z-index: 4 !important;
}

.card-name {
    font-size: 1.2em;
    font-weight: bold;
    margin-left: 20px;
}
</style>