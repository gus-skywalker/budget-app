<template>
  <v-container>
    <h1>{{ $t('account_management.title') }}</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <h2>{{ $t('account_management.basic_profile_information') }}</h2>
          <v-form>
            <v-text-field v-model="username" :label="$t('account_management.username_label')"></v-text-field>
            <v-text-field v-model="email" :label="$t('account_management.email_label')" type="email"></v-text-field>
            <v-file-input v-model="avatar" :label="$t('account_management.profile_picture_label')"></v-file-input>
            <v-select v-model="$i18n.locale" :items="availableLanguages" item-title="text" item-value="value"
              :label="$t('language_label')" dense outlined></v-select>
            <v-btn @click="saveProfile">{{ $t('save_changes') }}</v-btn>
          </v-form>
        </v-col>

        <v-col cols="12" md="6">
          <h2>{{ $t('security') }}</h2>
          <v-form>
            <v-text-field v-model="currentPassword" :label="$t('account_management.current_password_label')"
              type="password"></v-text-field>
            <v-text-field v-model="newPassword" :label="$t('account_management.new_password_label')"
              type="password"></v-text-field>
            <v-btn @click="changePassword">{{ $t('account_management.change_password') }}</v-btn>
          </v-form>

          <v-switch v-model="twoFactorAuth" :label="$t('account_management.two_factor_auth_label')"></v-switch>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <!-- Seção de Assinatura -->
      <SubscriptionManagement :user="user" />

      <v-divider></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <h2>{{ $t('account_management.alert_settings') }}</h2>
          <v-form>
            <v-select v-model="alertDays" :items="alertOptions"
              :label="$t('account_management.alert_days_before_label')" dense outlined></v-select>
            <v-btn @click="saveAlertSettings">{{ $t('account_management.save_changes') }}</v-btn>
          </v-form>
        </v-col>
        <v-col cols="12" md="6">
          <h2>{{ $t('preferences') }}</h2>
          <v-switch v-model="notificationEmail" :label="$t('account_management.email_notifications_label')"></v-switch>
          <v-switch v-model="notificationPush" :label="$t('account_management.push_notifications_label')"></v-switch>
          <v-switch v-model="darkTheme" :label="$t('account_management.dark_theme_label')"></v-switch>
        </v-col>

        <v-col cols="12" md="6">
          <h2>{{ $t('account_connections') }}</h2>
          <v-btn @click="connectGoogle">{{ $t('account_management.connect_google') }}</v-btn>
          <v-btn @click="disconnectGoogle">{{ $t('account_management.disconnect_google') }}</v-btn>

          <v-divider class="my-4"></v-divider>

          <!-- Cartões de Bancos -->
          <div class="bank-cards-wrapper">
            <div class="bank-cards">
              <v-card @mouseover="highlightCard('Nubank')" @mouseleave="highlightCard('')"
                @click="openBankDialog('Nubank')" class="bank-card" :class="{ selected: selectedBank === 'Nubank' }">
                <v-img src="banks/nubank-logo.png" aspect-ratio="1"></v-img>
                <v-card-text>{{ $t('nubank') }}</v-card-text>
              </v-card>
              <v-card @mouseover="highlightCard('Banco do Brasil')" @mouseleave="highlightCard('')"
                @click="openBankDialog('Banco do Brasil')" class="bank-card"
                :class="{ selected: selectedBank === 'Banco do Brasil' }">
                <v-img src="banks/bb-logo.webp" aspect-ratio="1"></v-img>
                <v-card-text>{{ $t('banco_do_brasil') }}</v-card-text>
              </v-card>
              <v-card @mouseover="highlightCard('Itaú')" @mouseleave="highlightCard('')" @click="openBankDialog('Itaú')"
                class="bank-card" :class="{ selected: selectedBank === 'Itaú' }">
                <v-img src="banks/itau-logo.jpg" aspect-ratio="1"></v-img>
                <v-card-text>{{ $t('itau') }}</v-card-text>
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
          <span class="headline">{{ $t('account_management.connect_to_bank', { bank: selectedBank }) }}</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="bankLogin" :label="$t('account_management.bank_login_label')"></v-text-field>
            <v-text-field v-model="bankPassword" :label="$t('account_management.bank_password_label')"
              type="password"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="authenticateBank">{{ $t('account_management.connect_to_bank') }}</v-btn>
          <v-btn @click="closeBankDialog">{{ $t('common.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para gerar certificado -->
    <v-dialog v-model="certDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-alert</v-icon>
          <span class="headline">{{ $t('account_management.generate_certificate') }}</span>
        </v-card-title>
        <v-card-text>
          <p>{{ $t('account_management.generate_certificate_description') }}</p>
          <v-btn @click="requestCode">{{ $t('account_management.send_code') }}</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeCertDialog">{{ $t('common.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Código de Verificação -->
    <v-dialog v-model="verificationDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-lock</v-icon>
          <span class="headline">{{ $t('account_management.verification_code') }}</span>
        </v-card-title>
        <v-card-text>
          <p>{{ $t('account_management.verification_code_description') }}</p>
          <v-form>
            <v-text-field v-model="verificationCode" :label="$t('verification_code_label')"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="verifyCode">{{ $t('account_management.verify_code') }}</v-btn>
          <v-btn @click="closeVerificationDialog">{{ $t('common.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBankStore } from '@/plugins/bankStore';
import { useUserStore } from '@/plugins/userStore';
import SubscriptionManagement from '@/components/SubscriptionManagement.vue';
import BankService from '@/services/BankService';
import NotificationService, { type UserSettings } from '@/services/NotificationService';

const bankStore = useBankStore();
const userStore = useUserStore();

onMounted(async () => {
  try {
    const response = await NotificationService.getAlertSettings();

    const settings = response.data || {};

    alertDays.value = settings.alertDaysBefore ?? 1;
    notificationEmail.value = settings.notificationEmail ?? true;
    notificationPush.value = settings.notificationPush ?? true;
    darkTheme.value = settings.darkTheme ?? false;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
});

// Cria uma propriedade computada para o objeto `user`
const user = computed(() => userStore.getUser);

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
const alertDays = ref(1);
const alertOptions = [1, 2, 3, 5, 7, 10];

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

const availableLanguages = [
  { text: 'English', value: 'en' },
  { text: 'Português', value: 'pt' },
];

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

const saveAlertSettings = async () => {
  try {
    const settings: UserSettings = {
      alertDaysBefore: alertDays.value,
      notificationEmail: notificationEmail.value,
      notificationPush: notificationPush.value,
      darkTheme: darkTheme.value,
    };
    await NotificationService.updateAlertSettings(settings);
    console.log('Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};

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
