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
                    <v-btn @click="authenticateBank">Conectar</v-btn>
                    <v-btn @click="closeBankDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Modal para gerar certificado -->
        <v-dialog v-model="certDialog" max-width="500">
            <v-card>
                <v-card-title>
                    <v-icon color="primary" class="mr-2">mdi-alert</v-icon>
                    <span class="headline">Gerar Novo Certificado</span>
                </v-card-title>
                <v-card-text>
                    <p>Você precisa gerar um novo certificado para se autenticar. Deseja gerar um novo código de
                        verificação?</p>
                    <v-btn @click="requestCode">Enviar Código</v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="closeCertDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Modal de Código de Verificação -->
        <v-dialog v-model="verificationDialog" max-width="500">
            <v-card>
                <v-card-title>
                    <v-icon color="primary" class="mr-2">mdi-lock</v-icon>
                    <span class="headline">Código de Verificação</span>
                </v-card-title>
                <v-card-text>
                    <p>Insira o código de verificação recebido por e-mail:</p>
                    <v-form>
                        <v-text-field v-model="verificationCode" label="Código de Verificação"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="verifyCode">Verificar Código</v-btn>
                    <v-btn @click="closeVerificationDialog">Cancelar</v-btn>
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

// Estado dos diálogos
const bankDialog = ref(false);
const certDialog = ref(false);
const verificationDialog = ref(false);

const selectedBank = ref('');
const bankLogin = ref('');
const bankPassword = ref('');
const highlightedCard = ref('');

const verificationCode = ref('');
const sessionId = ref('');

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

const openCertDialog = () => {
    certDialog.value = true;
};

const closeCertDialog = () => {
    certDialog.value = false;
};

const openVerificationDialog = () => {
    verificationDialog.value = true;
};

const closeVerificationDialog = () => {
    verificationDialog.value = false;
    verificationCode.value = '';
};

const highlightCard = (cardName: string) => {
    highlightedCard.value = cardName;
};

const authenticateBank = async () => {
    try {
        // Tenta autenticar no banco
        const response = await BankService.authenticateNubank({
            cpf: bankLogin.value,
            password: bankPassword.value
        });
        console.log(response.data);
        bankStore.setNubankToken(response.data.access_token);
        // Fechar o diálogo de banco após a conexão bem-sucedida
        closeBankDialog();
    } catch (error) {
        console.error('Erro ao conectar o banco', error);
        // Se a autenticação falhar, abrir o diálogo de certificado
        openCertDialog();
    }
};

const requestCode = async () => {
    try {
        // Solicita um novo código de verificação
        const response = await BankService.requestCode({
            cpf: bankLogin.value,
            password: bankPassword.value
        });

        sessionId.value = response.data.session_id;
        openVerificationDialog();
    } catch (error) {
        console.error('Erro ao solicitar o código de verificação', error);
    }
};

const verifyCode = async () => {
    try {
        // Verifica o código recebido por e-mail
        await BankService.exchangeCertificate({
            cpf: bankLogin.value,
            session_id: sessionId.value,
            code: verificationCode.value
        });
        closeVerificationDialog();
        // Prosseguir com a autenticação ou outra lógica após a verificação bem-sucedida
    } catch (error) {
        console.error('Erro ao verificar o código', error);
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