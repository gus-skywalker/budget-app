<template>
  <div class="settings-container">
    <v-container class="modern-container">
      <!-- Header -->
      <div class="settings-header">
        <h1 class="page-title">{{ $t('account_management.title') }}</h1>
        <p class="page-subtitle">{{ $t('account_management.subtitle') }}</p>
      </div>

      <!-- Tabs de Navegação -->
      <v-tabs 
        v-model="activeTab" 
        color="#667eea" 
        class="modern-tabs mb-6"
        show-arrows
      >
        <v-tab value="profile" class="settings-tab">
          <v-icon class="tab-icon">mdi-account-circle</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.profile') }}</span>
        </v-tab>
        <v-tab value="security" class="settings-tab">
          <v-icon class="tab-icon">mdi-shield-lock</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.security') }}</span>
        </v-tab>
        <v-tab value="preferences" class="settings-tab">
          <v-icon class="tab-icon">mdi-cog</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.preferences') }}</span>
        </v-tab>
        <v-tab value="connections" class="settings-tab">
          <v-icon class="tab-icon">mdi-link-variant</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.connections') }}</span>
        </v-tab>
        <v-tab value="subscription" class="settings-tab">
          <v-icon class="tab-icon">mdi-crown</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.subscription') }}</span>
        </v-tab>
      </v-tabs>

      <!-- Conteúdo das Tabs -->
      <v-window v-model="activeTab">
        <!-- Tab: Perfil -->
        <v-window-item value="profile">
          <v-row>
            <v-col cols="12" md="8" lg="6">
              <div class="modern-card profile-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-account-edit</v-icon>
                    {{ $t('account_management.profile.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.profile.description') }}</p>
                </div>
                <div class="card-content">
                  <v-form>
                    <v-text-field 
                      v-model="username" 
                      :label="$t('account_management.username_label')"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-inner-icon="mdi-account"
                      class="modern-input mb-4"
                    ></v-text-field>
                    <v-text-field 
                      v-model="email" 
                      :label="$t('account_management.email_label')" 
                      type="email"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-inner-icon="mdi-email"
                      class="modern-input mb-4"
                    ></v-text-field>
                    <v-file-input 
                      v-model="avatar" 
                      :label="$t('account_management.profile_picture_label')"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-icon="mdi-camera"
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
                      prepend-inner-icon="mdi-translate"
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
          </v-row>
        </v-window-item>

        <!-- Tab: Segurança -->
        <v-window-item value="security">
          <v-row>
            <v-col cols="12" md="8" lg="6">
              <div class="modern-card security-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-key-variant</v-icon>
                    {{ $t('account_management.security_card.password_title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.security_card.password_description') }}</p>
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
                      prepend-inner-icon="mdi-lock"
                      class="modern-input mb-4"
                    ></v-text-field>
                    <v-text-field 
                      v-model="newPassword" 
                      :label="$t('account_management.new_password_label')"
                      type="password"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-inner-icon="mdi-lock-reset"
                      class="modern-input mb-4"
                    ></v-text-field>
                    <v-btn 
                      @click="changePassword"
                      class="modern-btn gradient-btn mb-4"
                      size="large"
                      block
                    >
                      <v-icon left>mdi-shield-check</v-icon>
                      {{ $t('account_management.change_password') }}
                    </v-btn>
                  </v-form>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-two-factor-authentication</v-icon>
                    {{ $t('account_management.security_card.two_factor_title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.security_card.two_factor_description') }}</p>
                </div>
                <div class="card-content">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.security_card.two_factor_enable') }}</div>
                      <div class="setting-hint">{{ $t('account_management.security_card.two_factor_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="twoFactorAuth" 
                      color="#667eea"
                      hide-details
                    ></v-switch>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Tab: Preferências -->
        <v-window-item value="preferences">
          <v-row>
            <v-col cols="12" md="8" lg="6">
              <div class="modern-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-bell-ring</v-icon>
                    {{ $t('account_management.notifications.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.notifications.description') }}</p>
                </div>
                <div class="card-content">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.notifications.email_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.notifications.email_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="notificationEmail" 
                      color="#667eea"
                      hide-details
                    ></v-switch>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.notifications.push_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.notifications.push_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="notificationPush" 
                      color="#667eea"
                      hide-details
                    ></v-switch>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="setting-item mb-4">
                    <div class="setting-info full-width">
                      <div class="setting-label">{{ $t('account_management.notifications.alert_days_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.notifications.alert_days_hint') }}</div>
                    </div>
                  </div>
                  <v-select 
                    v-model="alertDays" 
                    :items="alertOptions"
                    :label="$t('account_management.alert_days_before_label')" 
                    variant="outlined"
                    density="comfortable"
                    color="#667eea"
                    prepend-inner-icon="mdi-calendar-clock"
                    class="modern-input"
                  ></v-select>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-palette</v-icon>
                    {{ $t('account_management.appearance.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.appearance.description') }}</p>
                </div>
                <div class="card-content">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.appearance.dark_theme_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.appearance.dark_theme_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="darkTheme" 
                      color="#667eea"
                      hide-details
                    >
                      <template v-slot:prepend>
                        <v-icon>{{ darkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
                      </template>
                    </v-switch>
                  </div>
                </div>
              </div>

              <v-btn 
                @click="saveAlertSettings"
                class="modern-btn gradient-btn mt-6"
                size="large"
                block
              >
                <v-icon left>mdi-content-save</v-icon>
                {{ $t('account_management.save_preferences') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Tab: Conexões -->
        <v-window-item value="connections">
          <v-row>
            <v-col cols="12" md="10" lg="8">
              <div class="modern-card position-relative">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-bank</v-icon>
                    {{ $t('account_management.bank_connections.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.bank_connections.description') }}</p>
                </div>
                <div class="card-content">
                  <div class="bank-cards">
                    <div class="bank-card-item">
                      <div class="bank-logo">
                        <v-img src="banks/nubank-logo.png" aspect-ratio="1"></v-img>
                      </div>
                      <div class="bank-name">Nubank</div>
                      <v-chip size="small" color="grey" variant="outlined">
                        <v-icon start size="small">mdi-link-variant-off</v-icon>
                        {{ $t('account_management.bank_connections.disconnected') }}
                      </v-chip>
                    </div>

                    <div class="bank-card-item">
                      <div class="bank-logo">
                        <v-img src="banks/bb-logo.webp" aspect-ratio="1"></v-img>
                      </div>
                      <div class="bank-name">Banco do Brasil</div>
                      <v-chip size="small" color="grey" variant="outlined">
                        <v-icon start size="small">mdi-link-variant-off</v-icon>
                        {{ $t('account_management.bank_connections.disconnected') }}
                      </v-chip>
                    </div>

                    <div class="bank-card-item">
                      <div class="bank-logo">
                        <v-img src="banks/itau-logo.jpg" aspect-ratio="1"></v-img>
                      </div>
                      <div class="bank-name">Itaú</div>
                      <v-chip size="small" color="grey" variant="outlined">
                        <v-icon start size="small">mdi-link-variant-off</v-icon>
                        {{ $t('account_management.bank_connections.disconnected') }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <!-- Overlay de Em Breve -->
                <div class="coming-soon-overlay">
                  <div class="coming-soon-badge">
                    <v-icon size="48" class="mb-3">mdi-clock-outline</v-icon>
                    <div class="coming-soon-title">{{ $t('account_management.bank_connections.coming_soon') }}</div>
                    <div class="coming-soon-subtitle">{{ $t('account_management.bank_connections.coming_soon_message') }}</div>
                  </div>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-google</v-icon>
                    {{ $t('account_management.integrations.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.integrations.description') }}</p>
                </div>
                <div class="card-content">
                  <div class="integration-item">
                    <div class="integration-icon">
                      <v-icon size="32" color="#4285F4">mdi-google</v-icon>
                    </div>
                    <div class="integration-info">
                      <div class="integration-name">{{ $t('account_management.integrations.google_account') }}</div>
                      <div class="integration-description">{{ $t('account_management.integrations.google_description') }}</div>
                    </div>
                    <div class="integration-actions">
                      <v-btn 
                        @click="connectGoogle"
                        variant="outlined"
                        color="#667eea"
                        class="modern-btn"
                      >
                        <v-icon left>mdi-link-variant</v-icon>
                        {{ $t('account_management.integrations.connect') }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Tab: Assinatura -->
        <v-window-item value="subscription">
          <SubscriptionManagement :user="user" />
        </v-window-item>
      </v-window>
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
              :label="$t('account_management.verification_code_label')"
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

// Tab ativa
const activeTab = ref('profile')

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
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 600px) {
  .modern-container {
    padding-left: 24px;
    padding-right: 24px;
  }
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

.card-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
  font-weight: 400;
}

.v-theme--dark .card-description {
  color: #b0b0b0;
}

/* Tabs */
.modern-tabs {
  background: transparent !important;
}

.modern-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.settings-tab {
  min-width: auto !important;
  padding: 12px 20px !important;
}

.tab-icon {
  margin-right: 8px;
}

.tab-text {
  display: inline;
}

/* Mobile: Apenas ícones nas tabs */
@media (max-width: 600px) {
  .settings-tab {
    min-width: 56px !important;
    padding: 12px 8px !important;
  }
  
  .tab-text {
    display: none;
  }
  
  .tab-icon {
    margin-right: 0;
  }
}

/* Settings Items */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.setting-info {
  flex: 1;
}

.setting-info.full-width {
  width: 100%;
}

.setting-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.v-theme--dark .setting-label {
  color: #ffffff;
}

.setting-hint {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.v-theme--dark .setting-hint {
  color: #b0b0b0;
}

/* Bank Cards Redesign */
.bank-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.bank-card-item {
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: not-allowed;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.v-theme--dark .bank-card-item {
  background: #1e1e1e;
  border-color: rgba(102, 126, 234, 0.2);
}

.bank-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 12px;
  overflow: hidden;
}

.bank-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.v-theme--dark .bank-name {
  color: #ffffff;
}

/* Integration Item */
.integration-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.v-theme--dark .integration-item {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
}

.integration-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .integration-icon {
  background: #2a2a2a;
}

.integration-info {
  flex: 1;
}

.integration-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.v-theme--dark .integration-name {
  color: #ffffff;
}

.integration-description {
  font-size: 0.9rem;
  color: #666;
}

.v-theme--dark .integration-description {
  color: #b0b0b0;
}

.integration-actions {
  flex-shrink: 0;
}

/* Coming Soon Overlay */
.position-relative {
  position: relative;
}

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

.v-theme--dark .coming-soon-overlay {
  background: rgba(30, 30, 30, 0.5);
}

.coming-soon-badge {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  max-width: 400px;
}

.v-theme--dark .coming-soon-badge {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.4);
}

.coming-soon-badge .v-icon {
  color: #667eea;
  opacity: 0.8;
}

.coming-soon-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.coming-soon-subtitle {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.v-theme--dark .coming-soon-subtitle {
  color: #b0b0b0;
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

  .bank-cards {
    grid-template-columns: 1fr;
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

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .integration-item {
    flex-direction: column;
    text-align: center;
  }

  .integration-icon {
    margin: 0 auto;
  }
}
</style>
