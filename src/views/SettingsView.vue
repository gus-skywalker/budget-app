<template>
  <v-container>
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

      <!-- Seção de Assinatura -->
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <h2>Gerenciamento de Assinatura</h2>
            <p><strong>Plano atual:</strong> {{ currentPlanText }}</p>
            <p><strong>Status:</strong> {{ subscriptionStatus }}</p>

            <v-radio-group v-model="selectedPlan" :mandatory="false">
              <v-radio label="Plano Mensal - R$29,90" value="monthly"></v-radio>
              <v-radio label="Plano Anual - R$299,00" value="annual"></v-radio>
            </v-radio-group>

            <v-btn color="primary" @click="updatePlan">
              Atualizar Plano
            </v-btn>

            <v-btn color="primary" @click="openBillingPortal">
              Gerenciar Assinatura no Portal
            </v-btn>

            <v-btn color="error" v-if="subscriptionActive" @click="cancelSubscription">
              Cancelar Assinatura
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

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
                @click="openBankDialog('Nubank')" class="bank-card" :class="{ selected: selectedBank === 'Nubank' }">
                <v-img src="banks/nubank-logo.png" aspect-ratio="1"></v-img>
                <v-card-text>Nubank</v-card-text>
              </v-card>
              <v-card @mouseover="highlightCard('Banco do Brasil')" @mouseleave="highlightCard('')"
                @click="openBankDialog('Banco do Brasil')" class="bank-card"
                :class="{ selected: selectedBank === 'Banco do Brasil' }">
                <v-img src="banks/bb-logo.webp" aspect-ratio="1"></v-img>
                <v-card-text>Banco do Brasil</v-card-text>
              </v-card>
              <v-card @mouseover="highlightCard('Itaú')" @mouseleave="highlightCard('')" @click="openBankDialog('Itaú')"
                class="bank-card" :class="{ selected: selectedBank === 'Itaú' }">
                <v-img src="banks/itau-logo.jpg" aspect-ratio="1"></v-img>
                <v-card-text>Itaú</v-card-text>
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
          <p>
            Você precisa gerar um novo certificado para se autenticar. Deseja gerar um novo código
            de verificação?
          </p>
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
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BankService from '@/services/BankService'
import PaymentService from '@/services/PaymentService'
import { useBankStore } from '@/plugins/bankStore'

import axios from 'axios'

const bankStore = useBankStore()
// Informações Básicas do Perfil
const username = ref('')
const email = ref('')
const avatar = ref(null)

// Segurança
const currentPassword = ref('')
const newPassword = ref('')
const twoFactorAuth = ref(false)

// Preferências
const notificationEmail = ref(true)
const notificationPush = ref(true)
const darkTheme = ref(false)

// Estado da assinatura e plano selecionado
const currentPlan = ref('');
const subscriptionStatus = ref('');
const selectedPlan = ref(''); // Para atualizar o plano
const subscriptionActive = computed(() => subscriptionStatus.value === 'Ativo');

// Obter o texto do plano atual
const currentPlanText = computed(() => {
  if (currentPlan.value === 'monthly') return 'Mensal - R$29,90/mês';
  if (currentPlan.value === 'annual') return 'Anual - R$299,00/ano';
  return 'Gratuito';
});

// Estado dos diálogos
const bankDialog = ref(false)
const certDialog = ref(false)
const verificationDialog = ref(false)

const selectedBank = ref('')
const bankLogin = ref('')
const bankPassword = ref('')
const highlightedCard = ref('')

const verificationCode = ref('')
const sessionId = ref('')

// Funções para manipular as ações do usuário
const saveProfile = () => {
  // Lógica para salvar as mudanças do perfil
}

const changePassword = () => {
  // Lógica para alterar a senha do usuário
}

const connectGoogle = () => {
  // Lógica para conectar a conta Google
}

const disconnectGoogle = () => {
  // Lógica para desconectar a conta Google
}

const openBankDialog = (bank: string) => {
  selectedBank.value = bank
  bankDialog.value = true
}

const closeBankDialog = () => {
  bankDialog.value = false
  bankLogin.value = ''
  bankPassword.value = ''
}

const openCertDialog = () => {
  certDialog.value = true
}

const closeCertDialog = () => {
  certDialog.value = false
}

const openVerificationDialog = () => {
  verificationDialog.value = true
}

const closeVerificationDialog = () => {
  verificationDialog.value = false
  verificationCode.value = ''
}

let timeoutId: ReturnType<typeof setTimeout> | null = null

const highlightCard = (cardName: string) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    highlightedCard.value = cardName
  }, 200) // adjust the delay as needed
}

const authenticateBank = async () => {
  try {
    // Tenta autenticar no banco
    const response = await BankService.authenticateNubank({
      cpf: bankLogin.value,
      password: bankPassword.value
    })
    console.log(response.data)
    bankStore.setNubankToken(response.data.access_token)
    // Fechar o diálogo de banco após a conexão bem-sucedida
    closeBankDialog()
  } catch (error) {
    console.error('Erro ao conectar o banco', error)
    // Se a autenticação falhar, abrir o diálogo de certificado
    openCertDialog()
  }
}

const requestCode = async () => {
  try {
    // Solicita um novo código de verificação
    const response = await BankService.requestCode({
      cpf: bankLogin.value,
      password: bankPassword.value
    })

    sessionId.value = response.data.session_id
    openVerificationDialog()
  } catch (error) {
    console.error('Erro ao solicitar o código de verificação', error)
  }
}

const verifyCode = async () => {
  try {
    // Verifica o código recebido por e-mail
    await BankService.exchangeCertificate({
      cpf: bankLogin.value,
      session_id: sessionId.value,
      code: verificationCode.value
    })
    closeVerificationDialog()
    // Prosseguir com a autenticação ou outra lógica após a verificação bem-sucedida
  } catch (error) {
    console.error('Erro ao verificar o código', error)
  }
}

// Função para carregar o plano e status da assinatura do usuário
const loadSubscriptionDetails = async () => {
  try {
    const response = await PaymentService.loadSubscriptionDetails();
    currentPlan.value = response.data.plan;
    subscriptionStatus.value = response.data.status;
  } catch (error) {
    console.error("Erro ao carregar detalhes da assinatura:", error);
  }
};

// Função para abrir o portal de faturamento do Stripe
const openBillingPortal = async () => {
  try {
    const response = await PaymentService.openBillingPortal();
    window.location.href = response.data; // Redireciona para o portal de faturamento
  } catch (error) {
    console.error("Erro ao abrir o portal de faturamento:", error);
    alert("Não foi possível acessar o portal de faturamento. Tente novamente mais tarde.");
  }
};

// Função para atualizar o plano diretamente
const updatePlan = async () => {
  if (!selectedPlan.value) {
    alert("Por favor, selecione um plano.");
    return;
  }

  try {
    const response = await PaymentService.updatePlan(selectedPlan);
    window.location.href = response.data.checkoutUrl; // Redireciona para o checkout do plano
  } catch (error) {
    console.error("Erro ao atualizar o plano:", error);
    alert("Ocorreu um erro ao tentar atualizar o plano.");
  }
};

// Função para cancelar a assinatura
const cancelSubscription = async () => {
  try {
    await PaymentService.cancelSubscription();
    alert("Assinatura cancelada com sucesso. Você continuará a ter acesso até o fim do período já pago.");
    loadSubscriptionDetails(); // Atualiza o status da assinatura após o cancelamento
  } catch (error) {
    console.error("Erro ao cancelar a assinatura:", error);
    alert("Não foi possível cancelar a assinatura. Tente novamente mais tarde.");
  }
};

// Carregar detalhes da assinatura ao montar o componente
onMounted(() => {
  loadSubscriptionDetails();
});
</script>

<style scoped>
/* Estilos para a página de administração da conta */

.bank-cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.bank-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px;
}

.bank-card {
  width: 100px;
  margin: 10px;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  /* transition-delay: 0.7s;  Add this line */
  text-align: center;
}

.bank-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.bank-card.selected {
  transform: translateY(-20px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  border: 2px solid #333;
}

.card-name {
  font-size: 1.2em;
  font-weight: bold;
  margin-left: 20px;
}
</style>
