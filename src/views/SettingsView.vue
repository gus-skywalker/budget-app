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
        <v-tab value="workspace" class="settings-tab">
          <v-icon class="tab-icon">mdi-office-building-cog</v-icon>
          <span class="tab-text">{{ $t('account_management.tabs.workspace') }}</span>
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
                    <v-alert
                      v-if="profileFeedback.message"
                      :type="profileFeedback.type"
                      variant="tonal"
                      class="mb-4"
                    >
                      {{ profileFeedback.message }}
                    </v-alert>
                    <v-alert v-if="isOAuthUser" type="info" variant="tonal" class="mb-4">
                      Esta conta está vinculada ao Google. Alterações de nome e e-mail devem ser feitas diretamente na sua conta Google.
                    </v-alert>
                    <v-text-field 
                      v-model="username" 
                      :label="$t('account_management.username_label')"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-inner-icon="mdi-account"
                      class="modern-input mb-4"
                      :disabled="isOAuthUser"
                      :loading="isLoadingProfile"
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
                      :disabled="isOAuthUser"
                      :loading="isLoadingProfile"
                    ></v-text-field>
                    <v-file-input 
                      v-model="avatar" 
                      :label="$t('account_management.profile_picture_label')"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-icon="mdi-camera"
                      class="modern-input mb-4"
                      :disabled="isOAuthUser"
                      :loading="isLoadingProfile"
                    ></v-file-input>
                    <v-select 
                      v-model="profileLocale" 
                      :items="availableLanguages" 
                      item-title="text" 
                      item-value="value"
                      :label="$t('language_label')" 
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      prepend-inner-icon="mdi-translate"
                      class="modern-input mb-4"
                      :disabled="isOAuthUser"
                      :loading="isLoadingProfile"
                    ></v-select>
                    <v-btn 
                      v-if="!isOAuthUser"
                      @click="saveProfile"
                      class="modern-btn gradient-btn"
                      size="large"
                      :loading="isSavingProfile"
                      :disabled="isSavingProfile || isLoadingProfile"
                      block
                    >
                      <v-icon left>mdi-content-save</v-icon>
                      {{ $t('save_changes') }}
                    </v-btn>
                  </v-form>
                </div>
              </div>

              <div class="modern-card mt-6 danger-zone-card">
                <div class="card-header">
                  <h2 class="card-title danger-title">
                    <v-icon color="error" class="mr-2">mdi-alert-octagon</v-icon>
                    {{ $t('account_management.danger_zone_title') }}
                  </h2>
                  <p class="card-description">
                    {{ $t('account_management.delete_account_description') }}
                  </p>
                </div>
                <div class="card-content">
                  <v-btn
                    color="error"
                    variant="outlined"
                    block
                    @click="deleteAccountDialog = true"
                  >
                    <v-icon left>mdi-delete-forever</v-icon>
                    {{ $t('account_management.delete_account_button') }}
                  </v-btn>
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
                  <template v-if="!isOAuthUser">
                    <v-form>
                      <v-alert
                        v-if="passwordFeedback.message"
                        :type="passwordFeedback.type"
                        variant="tonal"
                        class="mb-4"
                      >
                        {{ passwordFeedback.message }}
                      </v-alert>
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
                      <v-text-field
                        v-model="confirmNewPassword"
                        :label="$t('account_management.confirm_new_password_label')"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        color="#667eea"
                        prepend-inner-icon="mdi-lock-check"
                        class="modern-input mb-4"
                      ></v-text-field>
                      <v-btn 
                        @click="changePassword"
                        class="modern-btn gradient-btn mb-4"
                        size="large"
                        block
                        :loading="isChangingPassword"
                        :disabled="isChangingPassword"
                      >
                        <v-icon left>mdi-shield-check</v-icon>
                        {{ $t('account_management.change_password') }}
                      </v-btn>
                    </v-form>
                  </template>
                  <template v-else>
                    <v-alert type="info" variant="tonal">
                      Você está autenticado via Google.<br>
                      A senha é gerenciada pelo provedor de login.
                    </v-alert>
                  </template>
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

                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.notifications.daily_digest_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.notifications.daily_digest_hint') }}</div>
                    </div>
                    <v-switch
                      v-model="dailyDigestEmail"
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

        <!-- Tab: Empresa -->
        <v-window-item value="workspace">
          <WorkspaceSettings />
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
                    <div
                      v-for="bank in supportedBankCards"
                      :key="bank.institutionKey"
                      class="bank-card-item"
                      :class="{ 'bank-card-highlight': highlightedCard === bank.institutionKey }"
                      @mouseenter="highlightCard(bank.institutionKey)"
                      @mouseleave="highlightCard('')"
                      @focusin="highlightCard(bank.institutionKey)"
                      @focusout="highlightCard('')"
                    >
                      <div class="bank-logo">
                        <v-img :src="bank.logo" aspect-ratio="1"></v-img>
                      </div>
                      <div class="bank-name">{{ bank.label }}</div>
                      <v-chip :color="bankCardStatus(bank.institutionKey).color" size="small" variant="outlined">
                        <v-icon start size="small">{{ bankCardStatus(bank.institutionKey).icon }}</v-icon>
                        {{ bankCardStatus(bank.institutionKey).label }}
                      </v-chip>
                      <div
                        v-if="openFinanceConnectionByKey[bank.institutionKey]?.linkedAccountsCount"
                        class="bank-card-meta"
                      >
                        {{ openFinanceConnectionByKey[bank.institutionKey]?.linkedAccountsCount }} conta(s) deste banco
                      </div>
                      <div
                        v-if="openFinanceAccountNamesByInstitution[bank.institutionKey]?.length"
                        class="bank-card-meta bank-card-meta--stacked"
                      >
                        {{ openFinanceAccountNamesByInstitution[bank.institutionKey].join(' • ') }}
                      </div>
                      <div
                        v-if="openFinanceConnectionByKey[bank.institutionKey]?.lastSyncTo"
                        class="bank-card-meta"
                      >
                        Último sync: {{ openFinanceConnectionByKey[bank.institutionKey]?.lastSyncTo }}
                      </div>
                      <div
                        v-if="openFinanceConnectionByKey[bank.institutionKey]?.lastErrorSummary"
                        class="bank-card-error"
                      >
                        {{ openFinanceConnectionByKey[bank.institutionKey]?.lastErrorSummary }}
                      </div>
                      <v-btn
                        class="mt-3"
                        size="small"
                        variant="tonal"
                        color="#667eea"
                        :loading="openFinanceConnectionLoadingKey === bank.institutionKey"
                        :disabled="openFinanceConnectionLoadingKey === bank.institutionKey"
                        @click.stop="toggleOpenFinanceConnection(bank.institutionKey)"
                      >
                        {{
                          isConnectionDisconnectable(bank.institutionKey)
                            ? 'Desconectar'
                            : 'Conectar'
                        }}
                      </v-btn>
                    </div>
                  </div>
                  <v-alert type="info" variant="tonal" class="mt-4">
                    Você pode fazer opt-out do Open Finance a qualquer momento por banco conectado.
                    Ao desconectar, interrompemos novas sincronizações daquela instituição e mantemos rastreabilidade do histórico já importado.
                  </v-alert>
                  <div class="connection-legal-links">
                    <v-btn variant="text" @click="openLegalDoc('privacy-policy')">Política de Privacidade</v-btn>
                    <v-btn variant="text" @click="openLegalDoc('terms-of-use')">Termos de Uso</v-btn>
                    <v-btn variant="text" @click="openLegalDoc('cookie-policy')">Política de Cookies</v-btn>
                  </div>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-chart-box-outline</v-icon>
                    Saúde operacional
                  </h2>
                  <p class="card-description">
                    Visão rápida do estado atual do Open Finance para este workspace.
                  </p>
                </div>
                <div class="card-content">
                  <div v-if="openFinanceObservabilitySummary" class="observability-grid">
                    <div class="observability-card">
                      <div class="observability-label">Contas conectadas</div>
                      <div class="observability-value">{{ openFinanceObservabilitySummary.connectedAccounts }}</div>
                    </div>
                    <div class="observability-card">
                      <div class="observability-label">Transações importadas</div>
                      <div class="observability-value">{{ openFinanceObservabilitySummary.importedTransactions }}</div>
                    </div>
                    <div class="observability-card">
                      <div class="observability-label">Mappings ativos</div>
                      <div class="observability-value">{{ openFinanceObservabilitySummary.categoryMappings }}</div>
                    </div>
                    <div class="observability-card">
                      <div class="observability-label">Conflitos abertos</div>
                      <div class="observability-value">{{ openFinanceOpenConflictCount }}</div>
                    </div>
                    <div class="observability-card">
                      <div class="observability-label">Contas em rate limit hoje</div>
                      <div class="observability-value">{{ openFinanceObservabilitySummary.accountsAtRateLimitToday }}</div>
                    </div>
                    <div class="observability-card">
                      <div class="observability-label">Última sincronização</div>
                      <div class="observability-value observability-value--small">
                        {{ openFinanceObservabilitySummary.lastSyncedAt ? formatOpenFinanceDate(openFinanceObservabilitySummary.lastSyncTo || '') : 'Ainda não sincronizado' }}
                      </div>
                      <div
                        v-if="openFinanceObservabilitySummary.lastSyncFrom && openFinanceObservabilitySummary.lastSyncTo"
                        class="observability-subtitle"
                      >
                        {{ openFinanceObservabilitySummary.lastSyncFrom }} → {{ openFinanceObservabilitySummary.lastSyncTo }}
                      </div>
                      <div
                        v-if="openFinanceObservabilitySummary.lastSyncTrigger"
                        class="observability-subtitle"
                      >
                        Origem: {{ openFinanceObservabilitySummary.lastSyncTrigger === 'AUTOMATIC' ? 'Automática' : 'Manual' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-history</v-icon>
                    Histórico de sincronizações
                  </h2>
                  <p class="card-description">
                    Últimas execuções de sync Open Finance com os principais contadores operacionais.
                  </p>
                </div>
                <div class="card-content">
                  <div v-if="!openFinanceSyncHistory.length" class="empty-state-panel">
                    <v-icon size="40" color="#667eea" class="mb-3">mdi-history</v-icon>
                    <p class="empty-message">Nenhuma sincronização registrada ainda.</p>
                  </div>
                  <div v-else class="sync-history-list">
                    <div v-for="item in openFinanceSyncHistory" :key="item.id" class="sync-history-item">
                      <div class="sync-history-title-row">
                        <div class="sync-history-title">{{ item.syncFrom }} → {{ item.syncTo }}</div>
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="item.status === 'FAILED' ? 'error' : '#667eea'"
                        >
                          {{ item.status === 'FAILED' ? 'Falhou' : 'Sucesso' }}
                        </v-chip>
                      </div>
                      <div class="sync-history-subtitle">
                        {{ formatOpenFinanceDate(item.createdAt.split('T')[0]) }}
                        <span class="sync-history-trigger">
                          • {{ item.trigger === 'AUTOMATIC' ? 'Automático' : 'Manual' }}
                        </span>
                      </div>
                      <div class="sync-history-metrics">
                        <span>{{ item.transactionsCreated }} novas</span>
                        <span>{{ item.transactionsUpdated }} atualizadas</span>
                        <span>{{ item.reconciliationConflicts }} conflitos</span>
                        <span>{{ item.accountsSkippedDueToRateLimit }} rate limit</span>
                      </div>
                      <div v-if="item.errorSummary" class="sync-history-error">
                        {{ item.errorSummary }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-file-compare</v-icon>
                    Revisão Open Finance
                  </h2>
                  <p class="card-description">
                    Sincronize uma janela de datas e resolva conflitos de reconciliação sem sair da área de conexões.
                  </p>
                </div>
                <div class="card-content">
                  <v-alert type="info" variant="tonal" class="mb-4">
                    Algumas integrações Open Finance limitam o fetch a 4 sincronizações por dia, por conta.
                  </v-alert>

                  <v-alert
                    v-if="openFinanceFeedback.message"
                    :type="openFinanceFeedback.type"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ openFinanceFeedback.message }}
                  </v-alert>

                  <div class="open-finance-toolbar mb-4">
                    <v-text-field
                      v-model="openFinanceFrom"
                      label="De"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      hide-details
                    />
                    <v-text-field
                      v-model="openFinanceTo"
                      label="Até"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      color="#667eea"
                      hide-details
                    />
                    <v-btn
                      class="modern-btn gradient-btn"
                      :loading="openFinanceSyncing"
                      :disabled="openFinanceSyncing"
                      @click="syncOpenFinance"
                    >
                      <v-icon start>mdi-sync</v-icon>
                      Sincronizar
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="#667eea"
                      @click="goToImportedTransactions"
                    >
                      <v-icon start>mdi-open-in-new</v-icon>
                      Ver transações importadas
                    </v-btn>
                  </div>

                  <div v-if="lastOpenFinanceSync" class="sync-summary mb-4">
                    <v-chip size="small" variant="tonal" color="#667eea">
                      {{ lastOpenFinanceSync.transactionsCreated }} novas
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="#667eea">
                      {{ lastOpenFinanceSync.transactionsUpdated }} atualizadas
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="#667eea">
                      {{ lastOpenFinanceSync.reconciliationConflicts }} conflitos
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="warning">
                      {{ lastOpenFinanceSync.accountsSkippedDueToRateLimit }} contas em rate limit
                    </v-chip>
                  </div>

                  <div v-if="openFinanceLoadingConflicts" class="loading-state">
                    <v-progress-circular indeterminate color="#667eea" size="36" />
                  </div>
                  <div v-else-if="!openFinanceConflicts.length" class="empty-state-panel">
                    <v-icon size="40" color="#667eea" class="mb-3">mdi-check-decagram-outline</v-icon>
                    <p class="empty-message">Nenhum conflito de reconciliação pendente.</p>
                  </div>
                  <div v-else class="conflict-list">
                    <div v-for="conflict in openFinanceConflicts" :key="conflict.id" class="conflict-item">
                      <div class="conflict-main">
                        <div class="conflict-title-row">
                          <div class="conflict-title">{{ conflict.description }}</div>
                          <v-chip size="small" color="warning" variant="tonal">
                            {{ conflict.rawStatus || 'SEM STATUS' }}
                          </v-chip>
                        </div>
                        <div class="conflict-meta">
                          <span>{{ formatOpenFinanceDate(conflict.transactionDate) }}</span>
                          <span>{{ formatOpenFinanceCurrency(conflict.amount) }}</span>
                          <span>{{ conflict.conflictReason || 'Conflito de assinatura' }}</span>
                        </div>
                        <div class="conflict-meta">
                          <span>Transação remota: {{ conflict.remoteTransactionId }}</span>
                          <span>Conta: {{ conflict.accountExternalId }}</span>
                          <span v-if="conflict.bankCategoryId">Categoria banco: {{ conflict.bankCategoryId }}</span>
                        </div>
                      </div>
                      <div class="conflict-actions">
                        <v-btn
                          variant="outlined"
                          color="#667eea"
                          :loading="openFinanceResolvingId === conflict.id"
                          :disabled="openFinanceResolvingId === conflict.id"
                          @click="resolveOpenFinanceConflict(conflict.id, 'keep-existing')"
                        >
                          Manter existente
                        </v-btn>
                        <v-btn
                          color="#667eea"
                          variant="tonal"
                          :loading="openFinanceResolvingId === conflict.id"
                          :disabled="openFinanceResolvingId === conflict.id"
                          @click="resolveOpenFinanceConflict(conflict.id, 'create-new')"
                        >
                          Criar nova
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modern-card mt-6">
                <div class="card-header">
                  <h2 class="card-title">
                    <v-icon color="#667eea" class="mr-2">mdi-shape-plus</v-icon>
                    Mapeamento de categorias
                  </h2>
                  <p class="card-description">
                    Defina como cada categoria do banco deve ser convertida para a categoria interna do produto.
                  </p>
                </div>
                <div class="card-content">
                  <v-text-field
                    v-model="openFinanceCategorySearch"
                    label="Buscar categoria do banco"
                    variant="outlined"
                    density="comfortable"
                    color="#667eea"
                    prepend-inner-icon="mdi-magnify"
                    class="modern-input mb-4"
                  />

                  <div v-if="!filteredOpenFinanceCategoryRows.length" class="empty-state-panel">
                    <v-icon size="40" color="#667eea" class="mb-3">mdi-shape-outline</v-icon>
                    <p class="empty-message">Nenhuma categoria bancária encontrada para mapear.</p>
                  </div>

                  <div v-else class="mapping-list">
                    <div
                      v-for="row in filteredOpenFinanceCategoryRows"
                      :key="row.bankCategory.id"
                      class="mapping-item"
                      :class="{ 'mapping-item--unmapped': !row.isMapped }"
                    >
                      <div class="mapping-main">
                        <div class="mapping-title-row">
                          <div>
                            <div class="mapping-title">{{ row.bankCategory.name }}</div>
                            <div class="mapping-subtitle">
                              {{ row.bankCategory.id }}
                              <span v-if="row.bankCategory.parentId">• pai: {{ row.bankCategory.parentId }}</span>
                            </div>
                            <div v-if="!row.isMapped && row.suggestedCategoryName" class="mapping-suggestion">
                              Sugestão: {{ row.suggestedCategoryName }}
                              <span v-if="row.suggestionReason">• {{ row.suggestionReason }}</span>
                            </div>
                          </div>
                          <v-chip
                            size="small"
                            :color="row.isMapped ? '#667eea' : 'warning'"
                            variant="tonal"
                          >
                            {{ row.isMapped ? 'Mapeada' : 'Pendente' }}
                          </v-chip>
                        </div>

                        <v-select
                          v-model="openFinanceMappingSelections[row.bankCategory.id]"
                          :items="internalCategories"
                          item-title="name"
                          item-value="id"
                          label="Categoria interna"
                          variant="outlined"
                          density="comfortable"
                          color="#667eea"
                          class="modern-input mt-3"
                        />
                        <v-btn
                          v-if="!row.isMapped && row.suggestedCategoryId"
                          variant="text"
                          color="#667eea"
                          class="mapping-suggestion-action"
                          @click="openFinanceMappingSelections[row.bankCategory.id] = row.suggestedCategoryId"
                        >
                          Aplicar sugestão
                        </v-btn>
                        <v-checkbox
                          v-model="openFinanceMappingReprocessSelections[row.bankCategory.id]"
                          label="Reprocessar transações já importadas com esta categoria"
                          color="#667eea"
                          density="comfortable"
                          hide-details
                          class="mt-2"
                        />
                      </div>

                      <div class="mapping-actions">
                        <v-btn
                          variant="tonal"
                          color="#667eea"
                          :loading="openFinanceMappingSavingId === row.bankCategory.id"
                          :disabled="openFinanceMappingDeletingId === row.bankCategory.id"
                          @click="saveOpenFinanceCategoryMapping(row.bankCategory.id)"
                        >
                          Salvar
                        </v-btn>
                        <v-btn
                          variant="outlined"
                          color="error"
                          :disabled="!row.isMapped || openFinanceMappingSavingId === row.bankCategory.id"
                          :loading="openFinanceMappingDeletingId === row.bankCategory.id"
                          @click="removeOpenFinanceCategoryMapping(row.bankCategory.id)"
                        >
                          Remover
                        </v-btn>
                      </div>
                    </div>
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
                      <template v-if="isOAuthUser">
                        <v-chip color="green" variant="tonal">
                          Conectado via Google
                        </v-chip>
                      </template>
                      <template v-else>
                        <v-btn 
                          v-if="!isGoogleConnected"
                          @click="connectGoogle"
                          variant="outlined"
                          color="#667eea"
                          class="modern-btn"
                        >
                          <v-icon left>mdi-link-variant</v-icon>
                          {{ $t('account_management.integrations.connect') }}
                        </v-btn>
                        <v-btn 
                          v-else
                          @click="disconnectGoogle"
                          variant="tonal"
                          color="#d14343"
                          class="modern-btn"
                        >
                          <v-icon left>mdi-link-variant-off</v-icon>
                          {{ $t('account_management.disconnect_google') }}
                        </v-btn>
                      </template>
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

    <!-- Diálogo de consentimento Open Finance -->
    <v-dialog v-model="bankDialog" max-width="500">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#667eea" class="mr-2">mdi-shield-check-outline</v-icon>
          <span class="headline">Conectar {{ selectedBank }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="mb-3">
            Esta etapa simula o consentimento Open Finance para a instituição
            <strong>{{ selectedBank }}</strong>.
          </p>
          <p class="mb-0 text-medium-emphasis">
            Ao confirmar, a conexão ficará ativa para sincronizar contas, transações, saldos,
            limites e categorias do banco dentro do seu workspace.
          </p>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeBankDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            @click="confirmOpenFinanceConsent"
            class="modern-btn gradient-btn"
            :loading="openFinanceConnectionLoadingKey === selectedInstitutionKey"
          >
            Confirmar consentimento
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="disconnectDialog" max-width="560">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#d14343" class="mr-2">mdi-link-variant-off</v-icon>
          <span class="headline">Desconectar {{ disconnectInstitutionName }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="mb-3">
            Você está prestes a fazer opt-out da integração com <strong>{{ disconnectInstitutionName }}</strong>.
          </p>
          <p class="mb-3 text-medium-emphasis">
            O que acontece agora:
          </p>
          <p class="mb-1 text-medium-emphasis">1. Novas sincronizações automáticas desse banco serão interrompidas.</p>
          <p class="mb-1 text-medium-emphasis">2. Contas e transações já importadas permanecem no workspace para histórico e auditoria.</p>
          <p class="mb-3 text-medium-emphasis">3. Você poderá reconectar a instituição depois, se desejar.</p>
          <div class="connection-legal-links">
            <v-btn variant="text" @click="openLegalDoc('privacy-policy')">Política de Privacidade</v-btn>
            <v-btn variant="text" @click="openLegalDoc('terms-of-use')">Termos de Uso</v-btn>
            <v-btn variant="text" @click="openLegalDoc('cookie-policy')">Política de Cookies</v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeDisconnectDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="openFinanceConnectionLoadingKey === disconnectInstitutionKey"
            :disabled="openFinanceConnectionLoadingKey === disconnectInstitutionKey"
            @click="confirmDisconnectOpenFinanceConnection"
          >
            Confirmar desconexão
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteAccountDialog" max-width="520">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#eb3349" class="mr-2">mdi-alert-octagon</v-icon>
          <span class="headline">{{ $t('account_management.delete_account_confirm_title') }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="mb-4">
            {{ $t('account_management.delete_account_confirm_hint', { phrase: deleteAccountPhrase }) }}
          </p>
          <v-text-field
            v-model="deleteAccountConfirm"
            :label="$t('account_management.delete_account_confirm_label')"
            variant="outlined"
            density="comfortable"
            color="#eb3349"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn @click="closeDeleteAccountDialog" variant="text">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deletingAccount"
            :disabled="deleteAccountConfirm.trim() !== deleteAccountPhrase"
            @click="deleteAccount"
          >
            {{ $t('account_management.delete_account_button') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useUserStore } from '@/plugins/userStore';
import SubscriptionManagement from '@/components/SubscriptionManagement.vue';
import WorkspaceSettings from '@/components/WorkspaceSettings.vue';
import DataService from '@/services/DataService';
import FinancialReadService from '@/services/FinancialReadService';
import OpenFinanceService from '@/services/OpenFinanceService';
import AuthService from '@/services/AuthService';
import NotificationService, {
  type NotificationPreferenceMap,
  type UserSettings
} from '@/services/NotificationService';
import type { AccountView } from '@/types/financialRead';
import type {
  OpenFinanceBankCategory,
  OpenFinanceCategoryMapping,
  OpenFinanceConnection,
  OpenFinanceConflict,
  OpenFinanceObservabilitySummary,
  OpenFinanceSyncHistoryItem,
  OpenFinanceSyncResponse,
} from '@/types/openFinance';
import { toUiLocale, toUserLanguageCode } from '@/utils/languageUtils';

const userStore = useUserStore();
const theme = useTheme();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

// Tab ativa
const activeTab = ref('profile')
const validSettingsTabs = new Set(['profile', 'security', 'preferences', 'workspace', 'connections', 'subscription'])
const isSettingsRoute = computed(() => route.name === 'settings')

const resolveSettingsTab = (value: unknown) => {
  const tab = typeof value === 'string' ? value : ''
  return validSettingsTabs.has(tab) ? tab : 'profile'
}

const DAILY_DIGEST_EVENT_TYPE = 'DAILY_DIGEST'

const loadAlertSettings = async () => {
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
    // Endpoint legado pode não existir mais em alguns ambientes.
    console.warn('Configurações legadas de alerta indisponíveis:', error);
  }

  try {
    const preferencesResponse = await NotificationService.getPreferences()
    const preferences: NotificationPreferenceMap = preferencesResponse.data || {}
    const digestPreference = preferences[DAILY_DIGEST_EVENT_TYPE]
    dailyDigestEmail.value = digestPreference?.emailEnabled ?? true
  } catch (error) {
    console.error('Erro ao carregar preferências de notificação:', error);
  }
};

// Cria uma propriedade computada para o objeto `user`
const user = computed(() => userStore.getUser);
// Usuário autenticado via OAuth2 (Google)
const isOAuthUser = computed(() => {
  return user.value?.userRoles?.includes('OAUTH2_USER');
});

// Informações Básicas do Perfil
const username = ref('')
const email = ref('')
const avatar = ref(null)
const profileUserId = ref('')
const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const profileFeedback = ref<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: ''
})
const deleteAccountDialog = ref(false)
const deleteAccountConfirm = ref('')
const deletingAccount = ref(false)
const deleteAccountPhrase = 'EXCLUIR'

// Segurança
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isChangingPassword = ref(false)
const passwordFeedback = ref<{ type: 'success' | 'error'; message: string }>({
  type: 'success',
  message: ''
})
const twoFactorAuth = ref(false)
const isGoogleConnected = computed(() => isOAuthUser.value)
const profileLocale = ref(locale.value)

// Preferências
const notificationEmail = ref(true)
const notificationPush = ref(true)
const dailyDigestEmail = ref(true)
const darkTheme = ref(false)
const alertDays = ref(1);
const alertOptions = [1, 2, 3, 5, 7, 10];

// Watch para aplicar o tema quando o switch mudar
watch(darkTheme, (newValue) => {
  theme.global.name.value = newValue ? 'dark' : 'light';
});

watch(locale, () => {
  loadInternalCategories()
})

watch(
  () => route.query.tab,
  (tab) => {
    if (!isSettingsRoute.value) {
      return
    }
    activeTab.value = resolveSettingsTab(tab)
  },
  { immediate: true }
)

watch(activeTab, async (tab) => {
  if (!isSettingsRoute.value) {
    return
  }
  if (route.query.tab === tab) {
    return
  }

  await router.replace({
    query: {
      ...route.query,
      tab,
    },
  })
})

watch(
  activeTab,
  async (tab) => {
    if (tab === 'connections') {
      await refreshOpenFinanceConsistencySnapshot()
      startOpenFinanceConnectionsPolling()
      return
    }
    stopOpenFinanceConnectionsPolling()
  }
)

// Estado dos diálogos
const bankDialog = ref(false)

const selectedBank = ref('')
const selectedInstitutionKey = ref('')
const disconnectDialog = ref(false)
const disconnectInstitutionKey = ref('')
const disconnectInstitutionName = ref('')
const highlightedCard = ref('')
const openFinanceFrom = ref('')
const openFinanceTo = ref('')
const openFinanceSyncing = ref(false)
const openFinanceLoadingConflicts = ref(false)
const openFinanceConflictsLoaded = ref(false)
const openFinanceResolvingId = ref<string | null>(null)
const openFinanceConflicts = ref<OpenFinanceConflict[]>([])
const lastOpenFinanceSync = ref<OpenFinanceSyncResponse | null>(null)
const openFinanceConnections = ref<OpenFinanceConnection[]>([])
const openFinanceImportedAccounts = ref<AccountView[]>([])
const openFinanceConnectionLoadingKey = ref<string | null>(null)
const openFinanceObservabilitySummary = ref<OpenFinanceObservabilitySummary | null>(null)
const openFinanceSyncHistory = ref<OpenFinanceSyncHistoryItem[]>([])
const openFinanceBankCategories = ref<OpenFinanceBankCategory[]>([])
const openFinanceCategoryMappings = ref<OpenFinanceCategoryMapping[]>([])
const internalCategories = ref<Array<{ id: number; name: string; code: string }>>([])
const openFinanceCategorySearch = ref('')
const openFinanceMappingSavingId = ref<string | null>(null)
const openFinanceMappingDeletingId = ref<string | null>(null)
const openFinanceMappingSelections = ref<Record<string, number | null>>({})
const openFinanceMappingReprocessSelections = ref<Record<string, boolean>>({})
const openFinanceFeedback = ref<{ type: 'success' | 'error' | 'info'; message: string }>({
  type: 'info',
  message: ''
})
const OPEN_FINANCE_CONNECTIONS_POLL_MS = 20000
let openFinanceConnectionsPollId: ReturnType<typeof setInterval> | null = null

type SuggestedMapping = {
  categoryId: number | null
  reason: string | null
}

const availableLanguages = [
  { text: 'English', value: 'en' },
  { text: 'Português', value: 'pt' },
  { text: 'Français', value: 'fr' },
  { text: 'Español', value: 'es' }
];

const supportedBankCards = [
  { institutionKey: 'nubank', label: 'Nubank', logo: 'banks/nubank-logo.png' },
  { institutionKey: 'banco-do-brasil', label: 'Banco do Brasil', logo: 'banks/bb-logo.webp' },
  { institutionKey: 'itau', label: 'Itaú', logo: 'banks/itau-logo.jpg' },
]

const normalizeOptionalText = (value: unknown): string | null => {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (raw.toLowerCase() === 'n/a') return null
  if (raw.toLowerCase() === 'null') return null
  if (raw.toLowerCase() === 'undefined') return null
  return raw
}

const normalizeMappingText = (value: string | null | undefined) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const CATEGORY_ALIASES: Array<{ terms: string[]; categoryCodes: string[] }> = [
  { terms: ['supermercado', 'mercado', 'grocery', 'groceries'], categoryCodes: ['groceries', 'of_market', 'mercado'] },
  { terms: ['transporte', 'uber', '99', 'taxi', 'mobilidade', 'bus'], categoryCodes: ['transportation', 'of_transport'] },
  { terms: ['restaurante', 'ifood', 'food', 'delivery', 'dining'], categoryCodes: ['dining_out', 'alimentacao'] },
  { terms: ['saude', 'health', 'farmacia', 'pharmacy'], categoryCodes: ['healthcare', 'saude'] },
  { terms: ['assinatura', 'subscription', 'streaming', 'netflix', 'spotify'], categoryCodes: ['subscriptions'] },
  { terms: ['casa', 'home', 'moradia', 'maintenance'], categoryCodes: ['home_maintenance'] },
  { terms: ['viagem', 'travel', 'hotel', 'airline'], categoryCodes: ['travel'] },
  { terms: ['educacao', 'education', 'school', 'curso'], categoryCodes: ['education'] },
  { terms: ['entretenimento', 'entertainment', 'cinema', 'movie'], categoryCodes: ['entertainment'] },
  { terms: ['vestuario', 'clothing', 'roupa'], categoryCodes: ['clothing'] },
  { terms: ['conta', 'utilities', 'energia', 'agua', 'internet'], categoryCodes: ['utilities'] },
]

const findInternalCategoryByCodes = (codes: string[]) => {
  const normalizedCodes = codes.map((code) => normalizeMappingText(code))
  return internalCategories.value.find((category) => {
    const normalizedCode = normalizeMappingText(category.code)
    const normalizedName = normalizeMappingText(category.name)
    return normalizedCodes.includes(normalizedCode) || normalizedCodes.includes(normalizedName)
  }) || null
}

const suggestInternalCategory = (bankCategory: OpenFinanceBankCategory): SuggestedMapping => {
  const normalizedName = normalizeMappingText(bankCategory.name)
  const normalizedParentId = normalizeMappingText(bankCategory.parentId)

  const exactMatch = internalCategories.value.find((category) => {
    return (
      normalizeMappingText(category.name) === normalizedName ||
      normalizeMappingText(category.code) === normalizedName
    )
  })
  if (exactMatch) {
    return { categoryId: exactMatch.id, reason: 'Nome equivalente' }
  }

  const aliasMatch = CATEGORY_ALIASES.find((alias) =>
    alias.terms.some((term) => normalizedName.includes(normalizeMappingText(term)) || normalizedParentId.includes(normalizeMappingText(term)))
  )
  if (aliasMatch) {
    const internalCategory = findInternalCategoryByCodes(aliasMatch.categoryCodes)
    if (internalCategory) {
      return { categoryId: internalCategory.id, reason: 'Sugestão por similaridade' }
    }
  }

  return { categoryId: null, reason: null }
}

const toIsoDateInput = (value: Date) => value.toISOString().split('T')[0]

const formatOpenFinanceDate = (value: string) => {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

const formatOpenFinanceCurrency = (value: number) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const extractErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    (typeof error?.response?.data === 'string' ? error.response.data : null) ||
    fallback
  )
}

const filteredOpenFinanceCategoryRows = computed(() => {
  const query = openFinanceCategorySearch.value.trim().toLowerCase()
  const mappingByBankCategoryId = new Map(
    openFinanceCategoryMappings.value.map((mapping) => [mapping.bankCategoryId, mapping])
  )

  return [...openFinanceBankCategories.value]
    .map((bankCategory) => {
      const mapping = mappingByBankCategoryId.get(bankCategory.id) || null
      const selectedCategoryId = openFinanceMappingSelections.value[bankCategory.id]
        ?? mapping?.categoryId
        ?? null
      const internalCategory = internalCategories.value.find((category) => category.id === selectedCategoryId) || null
      const suggestedMapping = suggestInternalCategory(bankCategory)
      const suggestedCategory = internalCategories.value.find((category) => category.id === suggestedMapping.categoryId) || null

      return {
        bankCategory,
        mapping,
        selectedCategoryId,
        internalCategoryName: internalCategory?.name || null,
        suggestedCategoryId: suggestedMapping.categoryId,
        suggestedCategoryName: suggestedCategory?.name || null,
        suggestionReason: suggestedMapping.reason,
        isMapped: Boolean(mapping),
      }
    })
    .filter((row) => {
      if (!query) return true
      return (
        row.bankCategory.name.toLowerCase().includes(query) ||
        row.bankCategory.id.toLowerCase().includes(query) ||
        (row.internalCategoryName || '').toLowerCase().includes(query)
      )
    })
    .sort((left, right) => {
      if (left.isMapped !== right.isMapped) {
        return left.isMapped ? 1 : -1
      }
      return left.bankCategory.name.localeCompare(right.bankCategory.name)
    })
})

const openFinanceConnectionByKey = computed(() => {
  return openFinanceConnections.value.reduce((accumulator, connection) => {
    accumulator[connection.institutionKey] = connection
    return accumulator
  }, {} as Record<string, OpenFinanceConnection>)
})

const openFinanceAccountNamesByInstitution = computed(() => {
  return openFinanceImportedAccounts.value.reduce((accumulator: Record<string, string[]>, account: AccountView) => {
    const connection = openFinanceConnections.value.find((item) =>
      account.name.startsWith(`${item.institutionName} - `)
    )
    if (!connection) {
      return accumulator
    }

    if (!accumulator[connection.institutionKey]) {
      accumulator[connection.institutionKey] = []
    }

    accumulator[connection.institutionKey].push(account.name.replace(`${connection.institutionName} - `, ''))
    return accumulator
  }, {} as Record<string, string[]>)
})

const openFinanceOpenConflictCount = computed(() => {
  if (openFinanceConflictsLoaded.value) {
    return openFinanceConflicts.value.length
  }
  return Number(openFinanceObservabilitySummary.value?.openConflicts || 0)
})

const loadOpenFinanceConflicts = async () => {
  openFinanceLoadingConflicts.value = true
  try {
    const response = await OpenFinanceService.listReconciliationConflicts()
    openFinanceConflicts.value = response.data || []
    openFinanceConflictsLoaded.value = true
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar os conflitos Open Finance.')
    }
  } finally {
    openFinanceLoadingConflicts.value = false
  }
}

const loadOpenFinanceConnections = async () => {
  try {
    const response = await OpenFinanceService.listConnections()
    openFinanceConnections.value = response.data || []
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar as conexões Open Finance.')
    }
  }
}

const loadOpenFinanceImportedAccounts = async () => {
  try {
    const response = await FinancialReadService.fetchAccounts()
    openFinanceImportedAccounts.value = (response.data || []).filter((account: AccountView) => account.provider === 'OPEN_FINANCE')
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar as contas importadas do Open Finance.')
    }
  }
}

const loadOpenFinanceObservabilitySummary = async () => {
  try {
    const response = await OpenFinanceService.getObservabilitySummary()
    openFinanceObservabilitySummary.value = response.data || null
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar o resumo operacional do Open Finance.')
    }
  }
}

const loadOpenFinanceSyncHistory = async () => {
  try {
    const response = await OpenFinanceService.listSyncHistory(10)
    openFinanceSyncHistory.value = response.data || []
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar o histórico de sincronização Open Finance.')
    }
  }
}

const refreshOpenFinanceConsistencySnapshot = async () => {
  await Promise.allSettled([
    loadOpenFinanceConflicts(),
    loadOpenFinanceObservabilitySummary(),
  ])
}

const stopOpenFinanceConnectionsPolling = () => {
  if (!openFinanceConnectionsPollId) {
    return
  }
  clearInterval(openFinanceConnectionsPollId)
  openFinanceConnectionsPollId = null
}

const startOpenFinanceConnectionsPolling = () => {
  stopOpenFinanceConnectionsPolling()
  openFinanceConnectionsPollId = setInterval(() => {
    if (activeTab.value !== 'connections') {
      return
    }
    refreshOpenFinanceConsistencySnapshot()
  }, OPEN_FINANCE_CONNECTIONS_POLL_MS)
}

const syncOpenFinanceMappingSelections = () => {
  const nextSelections: Record<string, number | null> = {}
  const nextReprocessSelections: Record<string, boolean> = {}
  for (const bankCategory of openFinanceBankCategories.value) {
    const mapping = openFinanceCategoryMappings.value.find((item) => item.bankCategoryId === bankCategory.id)
    const suggestion = suggestInternalCategory(bankCategory)
    nextSelections[bankCategory.id] = mapping?.categoryId ?? suggestion.categoryId ?? null
    nextReprocessSelections[bankCategory.id] = false
  }
  openFinanceMappingSelections.value = nextSelections
  openFinanceMappingReprocessSelections.value = nextReprocessSelections
}

const loadInternalCategories = async () => {
  try {
    const response = await DataService.fetchCategories(locale.value)
    const categories = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.items)
        ? response.data.items
        : []

    internalCategories.value = categories
      .map((category: any) => ({
        id: Number(category.id),
        name: String(category.name || category.code || '').trim(),
        code: String(category.code || '').trim(),
      }))
      .filter((category: { id: number; name: string; code: string }) => Number.isFinite(category.id) && category.name)
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar as categorias internas.')
    }
  }
}

const loadOpenFinanceCategoryMappings = async () => {
  try {
    const [bankCategoriesResponse, mappingsResponse] = await Promise.all([
      OpenFinanceService.listBankCategories(),
      OpenFinanceService.listCategoryMappings(),
    ])
    openFinanceBankCategories.value = bankCategoriesResponse.data || []
    openFinanceCategoryMappings.value = mappingsResponse.data || []
    syncOpenFinanceMappingSelections()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Não foi possível carregar o mapeamento de categorias Open Finance.')
    }
  }
}

const loadUserProfile = async () => {
  profileFeedback.value.message = ''
  isLoadingProfile.value = true

  if (userStore.getToken) {
    userStore.syncFromToken(userStore.getToken)
  }

  const fallbackUser = userStore.getUser
  profileUserId.value = normalizeOptionalText(fallbackUser?.id) || ''
  username.value = normalizeOptionalText(fallbackUser?.username) || ''
  email.value = normalizeOptionalText(fallbackUser?.email) || ''
  if (normalizeOptionalText(fallbackUser?.language)) {
    profileLocale.value = toUiLocale(fallbackUser.language)
  }

  try {
    const response = await AuthService.getUserInfo()
    const payload = response?.data || {}

    profileUserId.value =
      normalizeOptionalText(payload.id) ||
      normalizeOptionalText(fallbackUser?.id) ||
      ''
    username.value =
      normalizeOptionalText(payload.username) ||
      normalizeOptionalText(fallbackUser?.username) ||
      ''
    email.value =
      normalizeOptionalText(payload.email) ||
      normalizeOptionalText(fallbackUser?.email) ||
      ''

    const apiLanguage = normalizeOptionalText(payload.language) || normalizeOptionalText(fallbackUser?.language) || 'PT'
    const uiLocale = toUiLocale(apiLanguage)
    profileLocale.value = uiLocale
    locale.value = uiLocale
    userStore.setLanguage(apiLanguage)

    userStore.setUser({
      id: profileUserId.value,
      username: username.value,
      email: email.value,
      language: apiLanguage,
      avatar: payload.pictureUrl || fallbackUser?.avatar
    })
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      (typeof error?.response?.data === 'string' ? error.response.data : null)
    profileFeedback.value = {
      type: 'error',
      message: backendMessage || t('account_management.profile_load_error')
    }
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(async () => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)
  openFinanceFrom.value = toIsoDateInput(thirtyDaysAgo)
  openFinanceTo.value = toIsoDateInput(today)

  await Promise.all([
    loadAlertSettings(),
    loadUserProfile(),
    loadOpenFinanceConflicts(),
    loadOpenFinanceConnections(),
    loadOpenFinanceImportedAccounts(),
    loadOpenFinanceObservabilitySummary(),
    loadOpenFinanceSyncHistory(),
    loadInternalCategories(),
    loadOpenFinanceCategoryMappings(),
  ])

  if (activeTab.value === 'connections') {
    startOpenFinanceConnectionsPolling()
  }
});

onUnmounted(() => {
  stopOpenFinanceConnectionsPolling()
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

// Funções para manipular as ações do usuário
const saveProfile = async () => {
  profileFeedback.value.message = ''

  if (!profileUserId.value || !username.value.trim() || !email.value.trim()) {
    profileFeedback.value = {
      type: 'error',
      message: t('account_management.profile_required_fields')
    }
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    profileFeedback.value = {
      type: 'error',
      message: t('account_management.profile_invalid_email')
    }
    return
  }

  const payload = {
    username: username.value.trim(),
    email: email.value.trim(),
    language: toUserLanguageCode(profileLocale.value)
  }

  isSavingProfile.value = true
  try {
    const response = await AuthService.updateUser(profileUserId.value, payload)
    const updated = response?.data || {}

    const updatedLanguage = String(updated.language || payload.language || 'PT')
    userStore.setLanguage(updatedLanguage)
    locale.value = toUiLocale(updatedLanguage)
    profileLocale.value = toUiLocale(updatedLanguage)

    userStore.setUser({
      id: profileUserId.value,
      username: updated.username || payload.username,
      email: updated.email || payload.email,
      language: updatedLanguage
    })

    profileFeedback.value = {
      type: 'success',
      message: t('account_management.profile_save_success')
    }
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      (typeof error?.response?.data === 'string' ? error.response.data : null)
    profileFeedback.value = {
      type: 'error',
      message: backendMessage || t('account_management.profile_save_error')
    }
  } finally {
    isSavingProfile.value = false
  }
}

const closeDeleteAccountDialog = () => {
  deleteAccountDialog.value = false
  deleteAccountConfirm.value = ''
}

const deleteAccount = async () => {
  profileFeedback.value.message = ''
  const userId = profileUserId.value || userStore.getUser?.id
  if (!userId) {
    profileFeedback.value = {
      type: 'error',
      message: t('account_management.delete_account_error')
    }
    return
  }

  if (deleteAccountConfirm.value.trim() !== deleteAccountPhrase) {
    return
  }

  deletingAccount.value = true
  try {
    await AuthService.deleteUser(String(userId))
    closeDeleteAccountDialog()
    userStore.logout()
    await router.push({ name: 'login', query: { accountDeleted: 'true' } })
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      (typeof error?.response?.data === 'string' ? error.response.data : null)
    profileFeedback.value = {
      type: 'error',
      message: backendMessage || t('account_management.delete_account_error')
    }
  } finally {
    deletingAccount.value = false
  }
}

const changePassword = async () => {
  passwordFeedback.value.message = ''

  if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
    passwordFeedback.value = {
      type: 'error',
      message: t('account_management.password_required_fields')
    }
    return
  }

  if (newPassword.value !== confirmNewPassword.value) {
    passwordFeedback.value = {
      type: 'error',
      message: t('account_management.password_mismatch')
    }
    return
  }

  if (currentPassword.value === newPassword.value) {
    passwordFeedback.value = {
      type: 'error',
      message: t('account_management.password_same_as_current')
    }
    return
  }

  isChangingPassword.value = true
  try {
    await AuthService.changePassword(currentPassword.value, newPassword.value)
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    passwordFeedback.value = {
      type: 'success',
      message: t('account_management.password_change_success')
    }
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      (typeof error?.response?.data === 'string' ? error.response.data : null)

    passwordFeedback.value = {
      type: 'error',
      message: backendMessage || t('account_management.password_change_error')
    }
  } finally {
    isChangingPassword.value = false
  }
}

// Funções de conexão Google não alteram mais isGoogleConnected, pois agora é computed
const connectGoogle = () => {
  // lógica de conexão, se necessário
}

const disconnectGoogle = () => {
  // lógica de desconexão, se necessário
}

const openBankDialog = (bank: string) => {
  selectedBank.value = bank
  bankDialog.value = true
}

const closeBankDialog = () => {
  bankDialog.value = false
  selectedBank.value = ''
  selectedInstitutionKey.value = ''
}

const bankCardStatus = (institutionKey: string) => {
  const connection = openFinanceConnectionByKey.value[institutionKey]
  if (!connection) {
    return { label: t('account_management.bank_connections.disconnected'), color: 'grey', icon: 'mdi-link-variant-off' }
  }
  if (connection.status === 'CONNECTED') {
    return { label: 'Conectado', color: 'green', icon: 'mdi-link-variant' }
  }
  if (connection.status === 'PENDING_CONSENT') {
    return { label: 'Consentimento pendente', color: 'warning', icon: 'mdi-clock-outline' }
  }
  if (connection.status === 'ERROR') {
    return { label: 'Erro', color: 'error', icon: 'mdi-alert-circle-outline' }
  }
  return { label: 'Pendente', color: 'warning', icon: 'mdi-clock-outline' }
}

const isConnectionDisconnectable = (institutionKey: string) => {
  const existing = openFinanceConnectionByKey.value[institutionKey]
  return Boolean(existing && (existing.status === 'CONNECTED' || existing.status === 'ERROR'))
}

const closeDisconnectDialog = () => {
  disconnectDialog.value = false
  disconnectInstitutionKey.value = ''
  disconnectInstitutionName.value = ''
}

const requestDisconnectOpenFinanceConnection = (institutionKey: string) => {
  const matchedBank = supportedBankCards.find((item) => item.institutionKey === institutionKey)
  disconnectInstitutionKey.value = institutionKey
  disconnectInstitutionName.value =
    matchedBank?.label ||
    openFinanceConnectionByKey.value[institutionKey]?.institutionName ||
    institutionKey
  disconnectDialog.value = true
}

const confirmDisconnectOpenFinanceConnection = async () => {
  if (!disconnectInstitutionKey.value) {
    return
  }
  const institutionKey = disconnectInstitutionKey.value
  openFinanceConnectionLoadingKey.value = institutionKey
  try {
    await OpenFinanceService.disconnectConnection(institutionKey)
    openFinanceFeedback.value = {
      type: 'success',
      message: 'Conexão Open Finance removida com sucesso.'
    }
    closeDisconnectDialog()
    await loadOpenFinanceConnections()
    await loadOpenFinanceImportedAccounts()
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao alterar a conexão Open Finance.')
    }
  } finally {
    openFinanceConnectionLoadingKey.value = null
  }
}

const toggleOpenFinanceConnection = async (institutionKey: string) => {
  if (isConnectionDisconnectable(institutionKey)) {
    requestDisconnectOpenFinanceConnection(institutionKey)
    return
  }

  openFinanceConnectionLoadingKey.value = institutionKey
  openFinanceFeedback.value.message = ''
  try {
    await OpenFinanceService.startConnection(institutionKey)
    selectedInstitutionKey.value = institutionKey
    openBankDialog(supportedBankCards.find((item) => item.institutionKey === institutionKey)?.label || institutionKey)
    openFinanceFeedback.value = {
      type: 'success',
      message: 'Conexão Open Finance iniciada. Confirme o consentimento para concluir.'
    }
    await loadOpenFinanceConnections()
    await loadOpenFinanceImportedAccounts()
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao alterar a conexão Open Finance.')
    }
  } finally {
    openFinanceConnectionLoadingKey.value = null
  }
}

const confirmOpenFinanceConsent = async () => {
  if (!selectedInstitutionKey.value) {
    return
  }
  openFinanceConnectionLoadingKey.value = selectedInstitutionKey.value
  try {
    await OpenFinanceService.confirmConsent(selectedInstitutionKey.value)
    const syncResponse = await OpenFinanceService.sync({
      from: openFinanceFrom.value,
      to: openFinanceTo.value,
    })
    lastOpenFinanceSync.value = syncResponse.data
    openFinanceFeedback.value = {
      type: 'success',
      message: 'Consentimento confirmado e sincronização inicial concluída. As transações já podem ser vistas em Orçamento.'
    }
    closeBankDialog()
    await loadOpenFinanceConnections()
    await loadOpenFinanceImportedAccounts()
    await loadOpenFinanceConflicts()
    await loadOpenFinanceObservabilitySummary()
    await loadOpenFinanceSyncHistory()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao confirmar o consentimento Open Finance.')
    }
  } finally {
    openFinanceConnectionLoadingKey.value = null
  }
}

let timeoutId: ReturnType<typeof setTimeout> | null = null

const highlightCard = (cardName: string) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    highlightedCard.value = cardName
  }, 200)
}

const goToImportedTransactions = () => {
  const month = openFinanceTo.value ? new Date(`${openFinanceTo.value}T00:00:00`).getMonth() + 1 : new Date().getMonth() + 1
  const year = openFinanceTo.value ? new Date(`${openFinanceTo.value}T00:00:00`).getFullYear() : new Date().getFullYear()
  router.push({
    name: 'budget',
    query: {
      focus: 'expenses',
      openFinance: '1',
      month: String(month),
      year: String(year),
    },
  })
}

const openLegalDoc = (routeName: 'privacy-policy' | 'terms-of-use' | 'cookie-policy') => {
  const resolved = router.resolve({ name: routeName })
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
}

const syncOpenFinance = async () => {
  if (!openFinanceFrom.value || !openFinanceTo.value) {
    openFinanceFeedback.value = {
      type: 'error',
      message: 'Informe o intervalo de datas para sincronização.'
    }
    return
  }

  openFinanceSyncing.value = true
  openFinanceFeedback.value.message = ''
  try {
    const response = await OpenFinanceService.sync({
      from: openFinanceFrom.value,
      to: openFinanceTo.value,
    })
    lastOpenFinanceSync.value = response.data
    openFinanceFeedback.value = {
      type: 'success',
      message: 'Sincronização Open Finance concluída.'
    }
    await loadOpenFinanceConnections()
    await loadOpenFinanceImportedAccounts()
    await loadOpenFinanceConflicts()
    await loadOpenFinanceObservabilitySummary()
    await loadOpenFinanceSyncHistory()
  } catch (error: any) {
    await loadOpenFinanceConnections()
    await loadOpenFinanceImportedAccounts()
    await loadOpenFinanceSyncHistory()
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao sincronizar dados Open Finance.')
    }
  } finally {
    openFinanceSyncing.value = false
  }
}

const saveOpenFinanceCategoryMapping = async (bankCategoryId: string) => {
  const categoryId = openFinanceMappingSelections.value[bankCategoryId]
  const reprocessExistingTransactions = Boolean(openFinanceMappingReprocessSelections.value[bankCategoryId])
  if (!categoryId) {
    openFinanceFeedback.value = {
      type: 'error',
      message: 'Selecione uma categoria interna antes de salvar o mapeamento.'
    }
    return
  }

  openFinanceMappingSavingId.value = bankCategoryId
  openFinanceFeedback.value.message = ''
  try {
    await OpenFinanceService.upsertCategoryMapping(bankCategoryId, categoryId, reprocessExistingTransactions)
    await loadOpenFinanceCategoryMappings()
    openFinanceFeedback.value = {
      type: 'success',
      message: reprocessExistingTransactions
        ? 'Mapeamento salvo e transações existentes reprocessadas.'
        : 'Mapeamento de categoria salvo com sucesso.'
    }
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao salvar o mapeamento de categoria.')
    }
  } finally {
    openFinanceMappingSavingId.value = null
  }
}

const removeOpenFinanceCategoryMapping = async (bankCategoryId: string) => {
  const reprocessExistingTransactions = Boolean(openFinanceMappingReprocessSelections.value[bankCategoryId])
  openFinanceMappingDeletingId.value = bankCategoryId
  openFinanceFeedback.value.message = ''
  try {
    await OpenFinanceService.deleteCategoryMapping(bankCategoryId, reprocessExistingTransactions)
    await loadOpenFinanceCategoryMappings()
    openFinanceFeedback.value = {
      type: 'success',
      message: reprocessExistingTransactions
        ? 'Mapeamento removido e transações existentes reprocessadas.'
        : 'Mapeamento removido com sucesso.'
    }
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao remover o mapeamento de categoria.')
    }
  } finally {
    openFinanceMappingDeletingId.value = null
  }
}

const resolveOpenFinanceConflict = async (conflictId: string, action: 'keep-existing' | 'create-new') => {
  openFinanceResolvingId.value = conflictId
  openFinanceFeedback.value.message = ''
  try {
    if (action === 'keep-existing') {
      await OpenFinanceService.resolveKeepExisting(conflictId)
    } else {
      await OpenFinanceService.resolveCreateNew(conflictId)
    }
    openFinanceFeedback.value = {
      type: 'success',
      message: 'Conflito resolvido com sucesso.'
    }
    await loadOpenFinanceConflicts()
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, 'Falha ao resolver conflito Open Finance.')
    }
  } finally {
    openFinanceResolvingId.value = null
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
  } catch (error) {
    // Mantemos o fluxo da UI funcional mesmo sem endpoint legado.
    console.warn('Persistência legada de alertas indisponível:', error);
  }

  try {
    await NotificationService.updatePreferences([
      {
        eventType: DAILY_DIGEST_EVENT_TYPE,
        inboxEnabled: true,
        emailEnabled: dailyDigestEmail.value,
      },
    ])
    console.log('Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar preferências de notificação:', error);
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

.danger-zone-card {
  border-color: rgba(235, 51, 73, 0.28);
}

.danger-title {
  color: #c62828;
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
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.85;
}

.connection-legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.v-theme--dark .bank-card-item {
  background: #1e1e1e;
  border-color: rgba(102, 126, 234, 0.2);
}

.bank-card-item.bank-card-highlight {
  border-color: #667eea;
  box-shadow: 0 8px 22px rgba(102, 126, 234, 0.2);
  opacity: 1;
  transform: translateY(-4px);
}

.bank-card-item:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 4px;
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

.bank-card-meta {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #666;
}

.bank-card-meta--stacked {
  line-height: 1.5;
}

.v-theme--dark .bank-card-meta {
  color: #b0b0b0;
}

.bank-card-error {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #c62828;
}

.v-theme--dark .bank-card-error {
  color: #ef9a9a;
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

.open-finance-toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
}

.sync-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.observability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.observability-card {
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 14px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.04);
}

.v-theme--dark .observability-card {
  border-color: rgba(102, 126, 234, 0.22);
  background: rgba(102, 126, 234, 0.08);
}

.observability-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 6px;
}

.v-theme--dark .observability-label {
  color: #b0b0b0;
}

.observability-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
}

.v-theme--dark .observability-value {
  color: #ffffff;
}

.observability-value--small {
  font-size: 1rem;
  line-height: 1.4;
}

.observability-subtitle {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #666;
}

.v-theme--dark .observability-subtitle {
  color: #b0b0b0;
}

.sync-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sync-history-item {
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.04);
}

.v-theme--dark .sync-history-item {
  border-color: rgba(102, 126, 234, 0.22);
  background: rgba(102, 126, 234, 0.08);
}

.sync-history-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.sync-history-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .sync-history-title {
  color: #ffffff;
}

.sync-history-subtitle {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #666;
}

.v-theme--dark .sync-history-subtitle {
  color: #b0b0b0;
}

.sync-history-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

.v-theme--dark .sync-history-metrics {
  color: #b0b0b0;
}

.sync-history-error {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #c62828;
  font-weight: 500;
}

.v-theme--dark .sync-history-error {
  color: #ef9a9a;
}

.empty-state-panel {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conflict-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.04);
}

.v-theme--dark .conflict-item {
  border-color: rgba(102, 126, 234, 0.22);
  background: rgba(102, 126, 234, 0.08);
}

.conflict-main {
  flex: 1;
  min-width: 0;
}

.conflict-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.conflict-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .conflict-title {
  color: #ffffff;
}

.conflict-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.9rem;
  color: #666;
  margin-top: 6px;
}

.v-theme--dark .conflict-meta {
  color: #b0b0b0;
}

.conflict-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapping-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.14);
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.04);
}

.mapping-item--unmapped {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.06);
}

.v-theme--dark .mapping-item {
  border-color: rgba(102, 126, 234, 0.22);
  background: rgba(102, 126, 234, 0.08);
}

.v-theme--dark .mapping-item--unmapped {
  border-color: rgba(255, 152, 0, 0.4);
  background: rgba(255, 152, 0, 0.09);
}

.mapping-main {
  flex: 1;
  min-width: 0;
}

.mapping-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.mapping-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.v-theme--dark .mapping-title {
  color: #ffffff;
}

.mapping-subtitle {
  margin-top: 4px;
  color: #666;
  font-size: 0.9rem;
}

.v-theme--dark .mapping-subtitle {
  color: #b0b0b0;
}

.mapping-suggestion {
  margin-top: 6px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

.mapping-suggestion-action {
  align-self: flex-start;
  padding-left: 0 !important;
}

.mapping-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
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

  .open-finance-toolbar {
    grid-template-columns: 1fr;
  }

  .conflict-item {
    flex-direction: column;
  }

  .conflict-actions {
    width: 100%;
  }

  .mapping-item {
    flex-direction: column;
  }

  .mapping-actions {
    width: 100%;
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
