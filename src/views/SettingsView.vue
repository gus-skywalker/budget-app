<template>
  <div class="settings-container">
    <v-container class="modern-container">
      <!-- Header -->
      <div class="settings-header">
        <h1 class="page-title">{{ $t('account_management.title') }}</h1>
        <p class="page-subtitle">Gerencie suas configurações e preferências</p>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <div class="modern-card profile-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-account-circle</v-icon>
                {{ $t('account_management.basic_profile_information') }}
              </h2>
            </div>
            <div class="card-content">
              <v-form>
                <v-text-field 
                  v-model="username" 
                  :label="$t('account_management.username_label')"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>
                <v-text-field 
                  v-model="email" 
                  :label="$t('account_management.email_label')" 
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>
                <v-file-input 
                  v-model="avatar" 
                  :label="$t('account_management.profile_picture_label')"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-file-input>
                <v-select 
                  v-model="$i18n.locale" 
                  :items="availableLanguages" 
                  item-title="text" 
                  item-value="value"
                  :label="$t('language_label')" 
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-select>
                <v-btn 
                  @click="saveProfile"
                  class="modern-btn gradient-btn"
                  size="large"
                  block
                >
                  <v-icon left>mdi-content-save</v-icon>
                  {{ $t('save_changes') }}
                </v-btn>
              </v-form>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="modern-card security-card">
            <div class="card-header">
              <h2 class="card-title">
                <v-icon color="#667eea" class="mr-2">mdi-shield-lock</v-icon>
                {{ $t('security') }}
              </h2>
            </div>
            <div class="card-content">
              <v-form>
                <v-text-field 
                  v-model="currentPassword" 
                  :label="$t('account_management.current_password_label')"
                  type="password"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>
                <v-text-field 
                  v-model="newPassword" 
                  :label="$t('account_management.new_password_label')"
                  type="password"
                  variant="outlined"
                  density="comfortable"
                  color="#667eea"
                  class="modern-input mb-4"
                ></v-text-field>
                <v-btn 
                  @click="changePassword"
                  class="modern-btn gradient-btn mb-4"
                  size="large"
                  block
                >
                  <v-icon left>mdi-key</v-icon>
                  {{ $t('account_management.change_password') }}
                </v-btn>
              </v-form>

              <v-switch 
                v-model="twoFactorAuth" 
                :label="$t('account_management.two_factor_auth_label')"
                color="#667eea"
                class="modern-switch"
              ></v-switch>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <!-- Seção de Assinatura -->
      <SubscriptionManagement :user="user" />

      <v-divider class="my-6"></v-divider>

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
          <v-switch v-model="darkTheme" :label="$t('account_management.dark_theme_label')">
            <template v-slot:prepend>
              <v-icon>{{ darkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
            </template>
          </v-switch>
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
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">mdi-lock</v-icon>
          <span class="headline">{{ $t('account_management.connect_to_bank', { bank: selectedBank }) }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-form>
            <v-text-field 
              v-model="bankLogin" 
              :label="$t('account_management.bank_login_label')"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input mb-3"
            ></v-text-field>
            <v-text-field 
              v-model="bankPassword" 
              :label="$t('account_management.bank_password_label')"
              type="password"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeBankDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
          <v-btn @click="authenticateBank" class="modern-btn gradient-btn">
            {{ $t('account_management.connect_to_bank') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para gerar certificado -->
    <v-dialog v-model="certDialog" max-width="500">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">mdi-alert</v-icon>
          <span class="headline">{{ $t('account_management.generate_certificate') }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p>{{ $t('account_management.generate_certificate_description') }}</p>
          <v-btn @click="requestCode" class="modern-btn gradient-btn mt-3">
            {{ $t('account_management.send_code') }}
          </v-btn>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeCertDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Código de Verificação -->
    <v-dialog v-model="verificationDialog" max-width="500">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">mdi-lock</v-icon>
          <span class="headline">{{ $t('account_management.verification_code') }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p>{{ $t('account_management.verification_code_description') }}</p>
          <v-form>
            <v-text-field 
              v-model="verificationCode" 
              :label="$t('verification_code_label')"
              type="text"
              maxlength="6"
              :rules="[v => v.length === 6 || $t('account_management.verification_code_length')]"
              pattern="[0-9]*"
              inputmode="numeric"
              variant="outlined"
              density="comfortable"
              color="#667eea"
              class="modern-input"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeVerificationDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
          <v-btn @click="verifyCode" class="modern-btn gradient-btn">
            {{ $t('account_management.verify_code') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useBankStore } from '@/plugins/bankStore';
import { useUserStore } from '@/plugins/userStore';
import SubscriptionManagement from '@/components/SubscriptionManagement.vue';
import BankService from '@/services/BankService';
import NotificationService, { type UserSettings } from '@/services/NotificationService';

const bankStore = useBankStore();
const userStore = useUserStore();
const theme = useTheme();

onMounted(async () => {
  try {
    const response = await NotificationService.getAlertSettings();

    const settings = response.data || {};

    alertDays.value = settings.alertDaysBefore ?? 1;
    notificationEmail.value = settings.notificationEmail ?? true;
    notificationPush.value = settings.notificationPush ?? true;
    darkTheme.value = settings.darkTheme ?? false;
    
    // Sincronizar com o tema atual do Vuetify
    darkTheme.value = theme.global.current.value.dark;
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

// Watch para aplicar o tema quando o switch mudar
watch(darkTheme, (newValue) => {
  theme.global.name.value = newValue ? 'dark' : 'light';
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
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  padding: 32px 0;
}

.v-theme--dark .settings-container {
  background: linear-gradient(135deg, #1e1e1e 0%, #141414 100%);
}

.modern-container {
  max-width: 1400px;
}

/* Header */
.settings-header {
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

/* Switches */
.modern-switch {
  margin-top: 16px;
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

/* Bank Cards */
.bank-cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 16px;
}

.bank-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
}

.bank-card {
  width: 100px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  border-radius: 12px;
  overflow: hidden;
}

.bank-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.bank-card.selected {
  transform: translateY(-20px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  border: 2px solid #667eea;
}

.card-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
  margin-top: 16px;
  text-align: center;
}

/* Dialog Styles */
.modern-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: rgba(102, 126, 234, 0.05);
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .dialog-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(102, 126, 234, 0.1);
}

.dialog-content {
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .dialog-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 960px) {
  .settings-header {
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
  .settings-container {
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

  .bank-card {
    width: 80px;
  }
}
</style>
