<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="$t('account_management.title')" :meta="$t('account_management.subtitle')" />

      <!-- Tabs de Navegação -->
      <v-tabs 
        v-model="activeTab" 
        color="var(--cb-primary)" 
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
              <div class="cb-card profile-card">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-account-edit</v-icon>
                    {{ $t('account_management.profile.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.profile.description') }}</p>
                </div>
                <div class="cb-card__body">
                  <v-form>
                    <v-alert
                      v-if="profileFeedback.message"
                      :type="profileFeedback.type"
                      variant="tonal"
                      class="mb-4"
                    >
                      {{ profileFeedback.message }}
                    </v-alert>
                    <v-alert v-if="isFederatedIdentityManaged" type="info" variant="tonal" class="mb-4">
                      {{ $t('account_management.federated_profile_notice', { provider: federatedProviderLabel }) }}
                    </v-alert>
                    <v-text-field 
                      v-model="username" 
                      :label="$t('account_management.username_label')"
                      variant="outlined"
                      density="comfortable"
                      color="var(--cb-primary)"
                      prepend-inner-icon="mdi-account"
                      class="modern-input mb-4"
                      :disabled="isFederatedIdentityManaged"
                      :loading="isLoadingProfile"
                    ></v-text-field>
                    <v-text-field 
                      v-model="email" 
                      :label="$t('account_management.email_label')" 
                      type="email"
                      variant="outlined"
                      density="comfortable"
                      color="var(--cb-primary)"
                      prepend-inner-icon="mdi-email"
                      class="modern-input mb-4"
                      :disabled="isFederatedIdentityManaged"
                      :loading="isLoadingProfile"
                    ></v-text-field>
                    <v-file-input 
                      v-model="avatar" 
                      :label="$t('account_management.profile_picture_label')"
                      variant="outlined"
                      density="comfortable"
                      color="var(--cb-primary)"
                      prepend-icon="mdi-camera"
                      class="modern-input mb-4"
                      :disabled="isFederatedIdentityManaged"
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
                      color="var(--cb-primary)"
                      prepend-inner-icon="mdi-translate"
                      class="modern-input mb-4"
                      :disabled="isLoadingProfile"
                      :loading="isLoadingProfile"
                    ></v-select>
                    <v-btn 
                      @click="saveProfile"
                     
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

              <div class="cb-card mt-6 danger-zone-card">
                <div class="cb-card__header">
                  <h2 class="cb-card__title danger-title">
                    <v-icon color="error" class="mr-2">mdi-alert-octagon</v-icon>
                    {{ $t('account_management.danger_zone_title') }}
                  </h2>
                  <p class="card-description">
                    {{ $t('account_management.delete_account_description') }}
                  </p>
                </div>
                <div class="cb-card__body">
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
              <div class="cb-card security-card">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-key-variant</v-icon>
                    {{ $t('account_management.security_card.password_title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.security_card.password_description') }}</p>
                </div>
                <div class="cb-card__body">
                  <template v-if="!isFederatedIdentityManaged">
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
                        color="var(--cb-primary)"
                        prepend-inner-icon="mdi-lock"
                        class="modern-input mb-4"
                      ></v-text-field>
                      <v-text-field 
                        v-model="newPassword" 
                        :label="$t('account_management.new_password_label')"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        color="var(--cb-primary)"
                        prepend-inner-icon="mdi-lock-reset"
                        class="modern-input mb-4"
                      ></v-text-field>
                      <v-text-field
                        v-model="confirmNewPassword"
                        :label="$t('account_management.confirm_new_password_label')"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        color="var(--cb-primary)"
                        prepend-inner-icon="mdi-lock-check"
                        class="modern-input mb-4"
                      ></v-text-field>
                      <v-btn 
                        @click="changePassword"
                        class="mb-4"
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
                      {{ $t('account_management.federated_password_notice', { provider: federatedProviderLabel }) }}
                    </v-alert>
                  </template>
                </div>
              </div>

              <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-two-factor-authentication</v-icon>
                    {{ $t('account_management.security_card.two_factor_title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.security_card.two_factor_description') }}</p>
                </div>
                <div class="cb-card__body">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.security_card.two_factor_enable') }}</div>
                      <div class="setting-hint">{{ $t('account_management.security_card.two_factor_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="twoFactorAuth" 
                      color="var(--cb-primary)"
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
              <div class="cb-card">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-bell-ring</v-icon>
                    {{ $t('account_management.notifications.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.notifications.description') }}</p>
                </div>
                <div class="cb-card__body">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.notifications.email_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.notifications.email_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="notificationEmail" 
                      color="var(--cb-primary)"
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
                      color="var(--cb-primary)"
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
                      color="var(--cb-primary)"
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
                    color="var(--cb-primary)"
                    prepend-inner-icon="mdi-calendar-clock"
                    class="modern-input"
                  ></v-select>
                </div>
              </div>

              <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-palette</v-icon>
                    {{ $t('account_management.appearance.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.appearance.description') }}</p>
                </div>
                <div class="cb-card__body">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-label">{{ $t('account_management.appearance.dark_theme_label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.appearance.dark_theme_hint') }}</div>
                    </div>
                    <v-switch 
                      v-model="darkTheme" 
                      color="var(--cb-primary)"
                      hide-details
                    >
                      <template v-slot:prepend>
                        <v-icon>{{ darkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
                      </template>
                    </v-switch>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="setting-item setting-item--stacked">
                    <div class="setting-info full-width">
                      <div class="setting-label">{{ $t('account_management.app_voice.label') }}</div>
                      <div class="setting-hint">{{ $t('account_management.app_voice.hint') }}</div>
                    </div>
                    <v-select
                      v-model="appVoice"
                      :items="appVoiceOptions"
                      item-title="title"
                      item-value="value"
                      :label="$t('account_management.app_voice.select_label')"
                      variant="outlined"
                      density="comfortable"
                      color="var(--cb-primary)"
                      prepend-inner-icon="mdi-account-voice"
                      class="modern-input"
                    />
                    <div class="voice-preview">
                      <span>{{ $t('account_management.app_voice.preview_label') }}</span>
                      <p>{{ appVoicePreview }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <v-btn 
                @click="saveAlertSettings"
                class="mt-6"
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
              <v-alert
                v-if="!canUseConnectedFinance"
                type="info"
                variant="tonal"
                class="mb-6"
              >
                {{ $t('openFinance.settings.connected_finance_locked') }}
                <template #append>
                  <v-btn size="small" variant="text" color="var(--cb-primary)" @click="goToChoosePlan">
                    {{ $t('planning.budget.upgrade_to_unlock') }}
                  </v-btn>
                </template>
              </v-alert>

              <template v-else>
                <OpenFinanceConnectionsPanel
                  :connections="openFinanceConnections"
                  :loading="openFinanceConnectionsLoading"
                  :can-manage="canManageOpenFinance"
                  @refresh="refreshOpenFinanceConnectionsPanel"
                  @feedback="openFinanceFeedback = $event"
                />

                <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-history</v-icon>
                    {{ $t('openFinance.settings.sync_history_title') }}
                  </h2>
                  <p class="card-description">
                    {{ $t('openFinance.settings.sync_history_description') }}
                  </p>
                </div>
                <div class="cb-card__body">
                  <div v-if="!openFinanceSyncHistory.length" class="empty-state-panel">
                    <v-icon size="40" color="var(--cb-primary)" class="mb-3">mdi-history</v-icon>
                    <p class="empty-message">{{ $t('openFinance.settings.no_sync_history') }}</p>
                  </div>
                  <div v-else class="sync-history-list">
                    <div v-for="item in openFinanceSyncHistory" :key="item.id" class="sync-history-item">
                      <div class="sync-history-title-row">
                        <div class="sync-history-title">{{ item.syncFrom }} → {{ item.syncTo }}</div>
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="item.status === 'FAILED' ? 'error' : item.status === 'PROCESSING' ? 'warning' : 'var(--cb-primary)'"
                        >
                          {{ item.status === 'FAILED' ? $t('openFinance.settings.sync_failed') : item.status === 'PROCESSING' ? $t('openFinance.settings.sync_processing') : $t('openFinance.settings.sync_success') }}
                        </v-chip>
                      </div>
                      <div class="sync-history-subtitle">
                        {{ formatOpenFinanceDate(item.createdAt.split('T')[0]) }}
                        <span class="sync-history-trigger">
                          • {{ item.trigger === 'AUTOMATIC' ? $t('openFinance.settings.trigger_automatic') : $t('openFinance.settings.trigger_manual') }}
                        </span>
                      </div>
                      <div v-if="formatSyncHistoryConnection(item)" class="sync-history-connection">
                        <v-icon size="16">mdi-bank-outline</v-icon>
                        <span>{{ formatSyncHistoryConnection(item) }}</span>
                      </div>
                      <div class="sync-history-metrics">
                        <span v-if="item.fetchedCount !== undefined">{{ $t('openFinance.settings.metric_fetched', { count: item.fetchedCount }) }}</span>
                        <span>{{ $t('openFinance.settings.metric_created', { count: item.transactionsCreated }) }}</span>
                        <span>{{ $t('openFinance.settings.metric_updated', { count: item.transactionsUpdated }) }}</span>
                        <span v-if="item.providerDuplicateCount !== undefined">{{ $t('openFinance.settings.metric_provider_duplicates', { count: item.providerDuplicateCount }) }}</span>
                        <span v-if="item.localDuplicateCount !== undefined">{{ $t('openFinance.settings.metric_local_duplicates', { count: item.localDuplicateCount }) }}</span>
                        <span>{{ $t('openFinance.settings.metric_conflicts', { count: item.reconciliationConflicts }) }}</span>
                        <span>{{ $t('openFinance.settings.metric_rate_limit', { count: item.accountsSkippedDueToRateLimit }) }}</span>
                      </div>
                      <div v-if="item.errorSummary" class="sync-history-error" :title="sanitizeOpenFinanceUserMessage(item.errorSummary)">
                        {{ sanitizeOpenFinanceUserMessage(item.errorSummary) }}
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-file-compare</v-icon>
                    {{ $t('openFinance.settings.review_title') }}
                  </h2>
                  <p class="card-description">
                    {{ $t('openFinance.settings.review_description') }}
                  </p>
                </div>
                <div class="cb-card__body">
                  <v-alert type="info" variant="tonal" class="mb-4">
                    {{ $t('openFinance.settings.auto_sync_notice') }}
                  </v-alert>

                  <v-alert
                    v-if="openFinanceFeedback.message"
                    :type="openFinanceFeedback.type"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ openFinanceFeedback.message }}
                  </v-alert>

                  <div class="open-finance-actions mb-4">
                    <v-btn
                      variant="outlined"
                      color="var(--cb-primary)"
                      @click="goToImportedTransactions"
                    >
                      <v-icon start>mdi-open-in-new</v-icon>
                      {{ $t('openFinance.settings.view_imported_transactions') }}
                    </v-btn>
                  </div>

                  <div v-if="openFinanceLoadingConflicts" class="loading-state">
                    <v-progress-circular indeterminate color="var(--cb-primary)" size="36" />
                  </div>
                  <div v-else-if="!openFinanceConflicts.length" class="empty-state-panel">
                    <v-icon size="40" color="var(--cb-primary)" class="mb-3">mdi-check-decagram-outline</v-icon>
                    <p class="empty-message">{{ $t('openFinance.settings.no_pending_conflicts') }}</p>
                  </div>
                  <div v-else class="conflict-list">
                    <div v-for="conflict in openFinanceConflicts" :key="conflict.id" class="conflict-item">
                      <div class="conflict-main">
                        <div class="conflict-title-row">
                          <div class="conflict-title">{{ conflict.description }}</div>
                          <v-chip size="small" color="warning" variant="tonal">
                            {{ formatOpenFinanceConflictStatus(conflict.rawStatus) }}
                          </v-chip>
                        </div>
                        <div class="conflict-meta">
                          <span>{{ formatOpenFinanceDate(conflict.transactionDate) }}</span>
                          <span>{{ formatOpenFinanceCurrency(conflict.amount) }}</span>
                          <span>{{ conflict.conflictReason || $t('openFinance.settings.signature_conflict') }}</span>
                        </div>
                        <div class="conflict-meta">
                          <span>{{ $t('openFinance.settings.remote_transaction', { id: conflict.remoteTransactionId }) }}</span>
                          <span>{{ $t('openFinance.settings.account', { id: conflict.accountExternalId }) }}</span>
                          <span v-if="conflict.bankCategoryId">{{ $t('openFinance.settings.bank_category', { id: conflict.bankCategoryId }) }}</span>
                        </div>
                      </div>
                      <div class="conflict-actions">
                        <v-btn
                          variant="outlined"
                          color="var(--cb-primary)"
                          :loading="openFinanceResolvingId === conflict.id"
                          :disabled="openFinanceResolvingId === conflict.id"
                          @click="resolveOpenFinanceConflict(conflict.id, 'keep-existing')"
                        >
                          {{ $t('openFinance.settings.keep_existing') }}
                        </v-btn>
                        <v-btn
                          color="var(--cb-primary)"
                          variant="tonal"
                          :loading="openFinanceResolvingId === conflict.id"
                          :disabled="openFinanceResolvingId === conflict.id"
                          @click="resolveOpenFinanceConflict(conflict.id, 'create-new')"
                        >
                          {{ $t('openFinance.settings.create_new') }}
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-shape-plus</v-icon>
                    {{ $t('openFinance.settings.category_mapping_title') }}
                  </h2>
                  <p class="card-description">
                    {{ $t('openFinance.settings.category_mapping_description') }}
                  </p>
                </div>
                <div class="cb-card__body">
                  <v-text-field
                    v-model="openFinanceCategorySearch"
                    :label="$t('openFinance.settings.search_bank_category')"
                    variant="outlined"
                    density="comfortable"
                    color="var(--cb-primary)"
                    prepend-inner-icon="mdi-magnify"
                    class="modern-input mb-4"
                  />

                  <div v-if="!filteredOpenFinanceCategoryRows.length" class="empty-state-panel">
                    <v-icon size="40" color="var(--cb-primary)" class="mb-3">mdi-shape-outline</v-icon>
                    <p class="empty-message">{{ $t('openFinance.settings.no_bank_category_to_map') }}</p>
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
                              <span v-if="row.bankCategory.parentId">• {{ $t('openFinance.settings.parent', { id: row.bankCategory.parentId }) }}</span>
                            </div>
                            <div v-if="!row.isMapped && row.suggestedCategoryName" class="mapping-suggestion">
                              {{ $t('openFinance.settings.suggestion', { name: row.suggestedCategoryName }) }}
                              <span v-if="row.suggestionReason">• {{ row.suggestionReason }}</span>
                            </div>
                          </div>
                          <v-chip
                            size="small"
                            :color="row.isMapped ? 'var(--cb-primary)' : 'warning'"
                            variant="tonal"
                          >
                            {{ row.isMapped ? $t('openFinance.settings.mapped') : $t('openFinance.settings.pending') }}
                          </v-chip>
                        </div>

                        <v-select
                          v-model="openFinanceMappingSelections[row.bankCategory.id]"
                          :items="internalCategories"
                          item-title="name"
                          item-value="id"
                          :label="$t('openFinance.settings.internal_category')"
                          variant="outlined"
                          density="comfortable"
                          color="var(--cb-primary)"
                          class="modern-input mt-3"
                        />
                        <v-btn
                          v-if="!row.isMapped && row.suggestedCategoryId"
                          variant="text"
                          color="var(--cb-primary)"
                          class="mapping-suggestion-action"
                          @click="openFinanceMappingSelections[row.bankCategory.id] = row.suggestedCategoryId"
                        >
                          {{ $t('openFinance.settings.apply_suggestion') }}
                        </v-btn>
                        <v-checkbox
                          v-model="openFinanceMappingReprocessSelections[row.bankCategory.id]"
                          :label="$t('openFinance.settings.reprocess_imported')"
                          color="var(--cb-primary)"
                          density="comfortable"
                          hide-details
                          class="mt-2"
                        />
                      </div>

                      <div class="mapping-actions">
                        <v-btn
                          variant="tonal"
                          color="var(--cb-primary)"
                          :loading="openFinanceMappingSavingId === row.bankCategory.id"
                          :disabled="openFinanceMappingDeletingId === row.bankCategory.id"
                          @click="saveOpenFinanceCategoryMapping(row.bankCategory.id)"
                        >
                          {{ $t('common.save') }}
                        </v-btn>
                        <v-btn
                          variant="outlined"
                          color="error"
                          :disabled="!row.isMapped || openFinanceMappingSavingId === row.bankCategory.id"
                          :loading="openFinanceMappingDeletingId === row.bankCategory.id"
                          @click="removeOpenFinanceCategoryMapping(row.bankCategory.id)"
                        >
                          {{ $t('common.remove') }}
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </template>

              <div class="cb-card mt-6">
                <div class="cb-card__header">
                  <h2 class="cb-card__title">
                    <v-icon color="var(--cb-primary)" class="mr-2">mdi-google</v-icon>
                    {{ $t('account_management.integrations.title') }}
                  </h2>
                  <p class="card-description">{{ $t('account_management.integrations.description') }}</p>
                </div>
                <div class="cb-card__body">
                  <div class="integration-item">
                    <div class="integration-icon">
                      <v-icon size="32" color="#4285F4">mdi-google</v-icon>
                    </div>
                    <div class="integration-info">
                      <div class="integration-name">{{ $t('account_management.integrations.google_account') }}</div>
                      <div class="integration-description">{{ $t('account_management.integrations.google_description') }}</div>
                    </div>
                    <div class="integration-actions">
                      <template v-if="isGoogleConnected">
                        <v-chip color="green" variant="tonal">
                          {{ $t('account_management.integrations.connected_google') }}
                        </v-chip>
                      </template>
                      <template v-else>
                        <v-btn 
                          v-if="!isGoogleConnected"
                          @click="connectGoogle"
                          variant="outlined"
                          color="var(--cb-primary)"
                         
                        >
                          <v-icon left>mdi-link-variant</v-icon>
                          {{ $t('account_management.integrations.connect') }}
                        </v-btn>
                        <v-btn 
                          v-else
                          @click="disconnectGoogle"
                          variant="tonal"
                          color="#d14343"
                         
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
    </div>

    <v-dialog v-model="deleteAccountDialog" max-width="520">
      <v-card class="cb-card">
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
import PageHeader from '@/components/PageHeader.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useUserStore } from '@/plugins/userStore';
import SubscriptionManagement from '@/components/SubscriptionManagement.vue';
import WorkspaceSettings from '@/components/WorkspaceSettings.vue';
import OpenFinanceConnectionsPanel from '@/components/open-finance/OpenFinanceConnectionsPanel.vue';
import DataService from '@/services/DataService';
import FinancialReadService from '@/services/FinancialReadService';
import OpenFinanceService from '@/services/OpenFinanceService';
import BillingOrchestrationService, { type BillingSummaryResponse } from '@/services/BillingOrchestrationService';
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
} from '@/types/openFinance';
import { toUiLocale, toUserLanguageCode } from '@/utils/languageUtils';
import { APP_VOICES, type AppVoice } from '@/utils/appVoiceTypes';
import { parseApiError } from '@/utils/errorHandler';
import { sanitizeOpenFinanceMessage } from '@/utils/openFinanceErrors';

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
const normalizedAuthProvider = computed(() => String(user.value?.authProvider || 'LOCAL').toUpperCase())
const isFederatedIdentityManaged = computed(() => Boolean(user.value?.isFederatedAccount) && normalizedAuthProvider.value !== 'LOCAL')
const federatedProviderLabel = computed(() => {
  switch (normalizedAuthProvider.value) {
    case 'GOOGLE':
      return 'Google'
    case 'MICROSOFT':
      return 'Microsoft'
    case 'APPLE':
      return 'Apple'
    case 'GITHUB':
      return 'GitHub'
    default:
      return t('account_management.external_provider')
  }
})

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
const isGoogleConnected = computed(() => normalizedAuthProvider.value === 'GOOGLE')
const profileLocale = ref(locale.value)

// Preferências
const notificationEmail = ref(true)
const notificationPush = ref(true)
const dailyDigestEmail = ref(true)
const darkTheme = ref(false)
const alertDays = ref(1);
const alertOptions = [1, 2, 3, 5, 7, 10];
const appVoice = ref<AppVoice>(userStore.getAppVoice)
const billingSummary = ref<BillingSummaryResponse | null>(null)
const appVoiceOptions = computed(() =>
  APP_VOICES.map((voice) => ({
    value: voice,
    title: t(`account_management.app_voice.options.${voice}`)
  }))
)
const appVoicePreview = computed(() => t(`account_management.app_voice.previews.${appVoice.value}`))

// Watch para aplicar o tema quando o switch mudar
watch(darkTheme, (newValue) => {
  theme.global.name.value = newValue ? 'dark' : 'light';
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
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
      await loadConnectionsTabData()
      startOpenFinanceConnectionsPolling()
      return
    }
    stopOpenFinanceConnectionsPolling()
  }
)

const openFinanceLoadingConflicts = ref(false)
const openFinanceConflictsLoaded = ref(false)
const openFinanceResolvingId = ref<string | null>(null)
const openFinanceConflicts = ref<OpenFinanceConflict[]>([])
const openFinanceConnections = ref<OpenFinanceConnection[]>([])
const openFinanceImportedAccounts = ref<AccountView[]>([])
const openFinanceConnectionsLoading = ref(false)
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

const formatOpenFinanceDate = (value: string) => {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

const formatSyncHistoryConnection = (item: OpenFinanceSyncHistoryItem) => {
  const parts = [
    item.connectionDisplayName || item.institutionName,
    item.accountNumberMasked,
    item.payerDocumentType,
  ].filter(Boolean)
  return parts.join(' • ')
}

const formatOpenFinanceCurrency = (value: number) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const formatOpenFinanceConsentStatus = (status: string) => {
  const labels: Record<string, string> = {
    PENDING_SETUP: t('openFinance.status.PENDING_SETUP'),
    PENDING_AUTHORIZATION: t('openFinance.status.PENDING_AUTHORIZATION'),
    CONSENT_GRANTED_WAITING_PROVIDER: t('openFinance.status.CONSENT_GRANTED_WAITING_PROVIDER'),
    AUTHORIZED_SYNCING: t('openFinance.status.AUTHORIZED_SYNCING'),
    AUTHORIZED_READY: t('openFinance.status.AUTHORIZED_READY'),
    DELAYED_PROVIDER: t('openFinance.status.DELAYED_PROVIDER'),
    REAUTH_REQUIRED: t('openFinance.status.REAUTH_REQUIRED'),
    REVOKED: t('openFinance.status.REVOKED'),
    ERROR: t('openFinance.status.ERROR'),
  }
  return labels[status] || status
}

const formatOpenFinanceConflictStatus = (status: string | null | undefined) => {
  const normalized = String(status || '').trim().toUpperCase()
  if (!normalized) return t('openFinance.settings.status_review_needed')
  if (normalized.includes('CONFLICT') || normalized.includes('DUPLICATE')) {
    return t('openFinance.settings.status_review_needed')
  }
  if (normalized.includes('CANCEL')) {
    return t('openFinance.settings.status_cancelled_by_bank')
  }
  return t('openFinance.settings.status_review_needed')
}

const sanitizeOpenFinanceUserMessage = (message: string | null | undefined) => {
  return sanitizeOpenFinanceMessage(message, t('openFinance.feedback.provider_technical_error'))
}

const digitsOnly = (value: string | null | undefined) => String(value || '').replace(/\D/g, '')

const nullableText = (value: unknown) => {
  const text = String(value ?? '').trim()
  return text || null
}

const extractErrorMessage = (error: any, fallback: string) => {
  return parseApiError(error, fallback)
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

const openFinanceOpenConflictCount = computed(() => {
  if (openFinanceConflictsLoaded.value) {
    return openFinanceConflicts.value.length
  }
  return Number(openFinanceObservabilitySummary.value?.openConflicts || 0)
})

const canManageOpenFinance = computed(() => {
  const role = String(userStore.getTenantRole || '').toUpperCase()
  return role === 'ROLE_OWNER' || role === 'ROLE_ADMIN'
})
const currentWorkspaceId = computed(() =>
  userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces[0]?.workspaceId || ''
)
const canUseConnectedFinance = computed(() => {
  const capabilities = billingSummary.value?.capabilities
  if (!capabilities) return false
  if (typeof capabilities.connectedFinanceEnabled === 'boolean') return capabilities.connectedFinanceEnabled
  return Boolean(capabilities.advancedToolsEnabled || billingSummary.value?.hasPremiumAccess)
})

const loadBillingCapabilities = async () => {
  const workspaceId = currentWorkspaceId.value
  if (!workspaceId) {
    billingSummary.value = null
    return
  }
  try {
    const { data } = await BillingOrchestrationService.getBillingSummary(workspaceId)
    billingSummary.value = data || null
  } catch (error) {
    console.error('Erro ao carregar capacidades do plano:', error)
    billingSummary.value = null
  }
}

const goToChoosePlan = () => {
  router.push({ name: 'choose-plan', query: { feature: 'connected-finance' } })
}

const loadOpenFinanceConflicts = async () => {
  openFinanceLoadingConflicts.value = true
  try {
    const response = await OpenFinanceService.listReconciliationConflicts()
    openFinanceConflicts.value = response.data || []
    openFinanceConflictsLoaded.value = true
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.load_conflicts_error'))
    }
  } finally {
    openFinanceLoadingConflicts.value = false
  }
}

const loadOpenFinanceConnections = async () => {
  openFinanceConnectionsLoading.value = true
  try {
    const response = await OpenFinanceService.listConnections()
    openFinanceConnections.value = response.data || []
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.load_connections_error'))
    }
  } finally {
    openFinanceConnectionsLoading.value = false
  }
}

const loadOpenFinanceImportedAccounts = async () => {
  try {
    const response = await FinancialReadService.fetchAccounts()
    openFinanceImportedAccounts.value = (response.data || []).filter((account: AccountView) => account.provider === 'OPEN_FINANCE')
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.load_imported_accounts_error'))
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
      message: extractErrorMessage(error, t('openFinance.settings.load_summary_error'))
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
      message: extractErrorMessage(error, t('openFinance.settings.load_sync_history_error'))
    }
  }
}

const refreshOpenFinanceConsistencySnapshot = async () => {
  await Promise.allSettled([
    loadOpenFinanceConnections(),
    loadOpenFinanceConflicts(),
    loadOpenFinanceObservabilitySummary(),
  ])
}

const refreshOpenFinanceConnectionsPanel = async () => {
  await Promise.allSettled([
    loadOpenFinanceConnections(),
    loadOpenFinanceImportedAccounts(),
    loadOpenFinanceObservabilitySummary(),
    loadOpenFinanceSyncHistory(),
    loadOpenFinanceConflicts(),
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
      message: extractErrorMessage(error, t('openFinance.settings.load_internal_categories_error'))
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
      message: extractErrorMessage(error, t('openFinance.settings.load_category_mapping_error'))
    }
  }
}

const loadConnectionsTabData = async () => {
  await loadBillingCapabilities()
  if (!canUseConnectedFinance.value) {
    openFinanceConnections.value = []
    openFinanceSyncHistory.value = []
    openFinanceConflicts.value = []
    openFinanceBankCategories.value = []
    openFinanceCategoryMappings.value = []
    return
  }
  await Promise.allSettled([
    loadInternalCategories(),
    refreshOpenFinanceConnectionsPanel(),
    loadOpenFinanceCategoryMappings(),
  ])
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
      avatar: payload.pictureUrl || fallbackUser?.avatar,
      authProvider: payload.authProvider || fallbackUser?.authProvider || 'LOCAL',
      isFederatedAccount: typeof payload.isFederatedAccount === 'boolean'
        ? payload.isFederatedAccount
        : Boolean(fallbackUser?.isFederatedAccount)
    })
  } catch (error: any) {
    profileFeedback.value = {
      type: 'error',
      message: parseApiError(error, t('account_management.profile_load_error'))
    }
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(async () => {
  await Promise.allSettled([
    loadAlertSettings(),
    loadUserProfile(),
  ])

  if (activeTab.value === 'connections') {
    await loadConnectionsTabData()
    startOpenFinanceConnectionsPolling()
  }
});

onUnmounted(() => {
  stopOpenFinanceConnectionsPolling()
})

// Funções para manipular as ações do usuário
const saveProfile = async () => {
  profileFeedback.value.message = ''
  const nextLanguage = toUserLanguageCode(profileLocale.value)

  if (!profileUserId.value || (!isFederatedIdentityManaged.value && (!username.value.trim() || !email.value.trim()))) {
    profileFeedback.value = {
      type: 'error',
      message: t('account_management.profile_required_fields')
    }
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!isFederatedIdentityManaged.value && !emailRegex.test(email.value.trim())) {
    profileFeedback.value = {
      type: 'error',
      message: t('account_management.profile_invalid_email')
    }
    return
  }

  const payload = isFederatedIdentityManaged.value
    ? { language: nextLanguage }
    : {
        username: username.value.trim(),
        email: email.value.trim(),
        language: nextLanguage
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
      username: updated.username || username.value,
      email: updated.email || email.value,
      language: updatedLanguage
    })

    profileFeedback.value = {
      type: 'success',
      message: t('account_management.profile_save_success')
    }
  } catch (error: any) {
    profileFeedback.value = {
      type: 'error',
      message: parseApiError(error, t('account_management.profile_save_error'))
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
    profileFeedback.value = {
      type: 'error',
      message: parseApiError(error, t('account_management.delete_account_error'))
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
    passwordFeedback.value = {
      type: 'error',
      message: parseApiError(error, t('account_management.password_change_error'))
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

const goToImportedTransactions = () => {
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()
  router.push({
    name: 'transactions',
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

const saveOpenFinanceCategoryMapping = async (bankCategoryId: string) => {
  const categoryId = openFinanceMappingSelections.value[bankCategoryId]
  const reprocessExistingTransactions = Boolean(openFinanceMappingReprocessSelections.value[bankCategoryId])
  if (!categoryId) {
    openFinanceFeedback.value = {
      type: 'error',
      message: t('openFinance.settings.select_internal_category')
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
        ? t('openFinance.settings.mapping_saved_reprocess')
        : t('openFinance.settings.mapping_saved')
    }
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.mapping_save_error'))
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
        ? t('openFinance.settings.mapping_removed_reprocess')
        : t('openFinance.settings.mapping_removed')
    }
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.mapping_remove_error'))
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
      message: t('openFinance.settings.conflict_resolved')
    }
    await loadOpenFinanceConflicts()
    await loadOpenFinanceObservabilitySummary()
  } catch (error: any) {
    openFinanceFeedback.value = {
      type: 'error',
      message: extractErrorMessage(error, t('openFinance.settings.conflict_resolve_error'))
    }
  } finally {
    openFinanceResolvingId.value = null
  }
}

const saveAlertSettings = async () => {
  userStore.setAppVoice(appVoice.value)

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
/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.modern-tabs { background: transparent !important; }
.modern-tabs :deep(.v-tab) { text-transform: none; font-weight: 500; letter-spacing: 0.3px; }
.settings-tab { min-width: auto !important; padding: 12px 20px !important; }
.tab-icon  { margin-right: 8px; }
.tab-text  { display: inline; }

@media (max-width: 600px) {
  .settings-tab { min-width: 56px !important; padding: 12px 8px !important; }
  .tab-text { display: none; }
  .tab-icon { margin-right: 0; }
}

/* ── Danger zone ─────────────────────────────────────────────────────────── */
.danger-zone-card { border-color: rgba(235, 51, 73, 0.28); }
.danger-title     { color: #c62828; }

/* ── Card partials ──────────────────────────────────────────────────────── */
.card-description { font-size: 0.9rem; color: var(--cb-ink-muted); margin-top: 4px; font-weight: 400; }

/* ── Setting items ───────────────────────────────────────────────────────── */
.setting-item        { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.setting-info        { flex: 1; }
.setting-info.full-width { width: 100%; }
.setting-label       { font-size: 1rem; font-weight: 600; color: var(--cb-ink); margin-bottom: 4px; }
.setting-hint        { font-size: 0.85rem; color: var(--cb-ink-muted); line-height: 1.4; }
.setting-item--stacked { align-items: stretch; flex-direction: column; }
.voice-preview {
  border: 1px solid var(--cb-border-card);
  border-radius: 8px;
  padding: 12px;
  background: var(--cb-surface-soft);
}
.voice-preview span {
  display: block;
  color: var(--cb-ink-muted);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .06em;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.voice-preview p {
  color: var(--cb-ink-secondary);
  font-size: .9rem;
  line-height: 1.45;
  margin: 0;
}

/* ── Integration item ────────────────────────────────────────────────────── */
.integration-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--cb-surface-soft);
  border-radius: 12px;
  border: 1px solid var(--cb-border-card);
}

.open-finance-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.sync-summary         { display: flex; flex-wrap: wrap; gap: 8px; }

/* ── Observability ───────────────────────────────────────────────────────── */
.observability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.observability-card {
  border: 1px solid var(--cb-border-card);
  border-radius: 14px;
  padding: 16px;
  background: color-mix(in srgb, var(--cb-primary) 4%, transparent);
}

.observability-label    { font-size: 0.9rem; color: var(--cb-ink-muted); margin-bottom: 6px; }
.observability-value    { font-size: 1.6rem; font-weight: 700; color: var(--cb-ink); }
.observability-value--small { font-size: 1rem; line-height: 1.4; }
.observability-subtitle { margin-top: 6px; font-size: 0.85rem; color: var(--cb-ink-muted); }

/* ── Sync history ────────────────────────────────────────────────────────── */
.sync-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: clamp(320px, 48vh, 560px);
  overflow-y: auto;
  padding-right: 6px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.sync-history-list::-webkit-scrollbar       { width: 8px; }
.sync-history-list::-webkit-scrollbar-track { background: rgba(100, 116, 139, 0.08); border-radius: 999px; }
.sync-history-list::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--cb-primary) 38%, transparent); border-radius: 999px; }

.sync-history-item {
  padding: 16px;
  border: 1px solid var(--cb-border-card);
  border-radius: 14px;
  background: color-mix(in srgb, var(--cb-primary) 4%, transparent);
}

.sync-history-title-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.sync-history-title     { font-size: 1rem; font-weight: 600; color: var(--cb-ink); }
.sync-history-subtitle  { margin-top: 6px; font-size: 0.85rem; color: var(--cb-ink-muted); }

.sync-history-connection {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
  font-size: 0.82rem;
  font-weight: 600;
}

.sync-history-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--cb-ink-muted);
}

.sync-history-error {
  margin-top: 10px;
  max-height: 96px;
  overflow-y: auto;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(198, 40, 40, 0.08);
  font-size: 0.9rem;
  line-height: 1.4;
  color: #c62828;
  font-weight: 500;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.empty-state-panel {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* ── Conflict & mapping lists ────────────────────────────────────────────── */
.conflict-list,
.mapping-list { display: flex; flex-direction: column; gap: 12px; }

.conflict-item,
.mapping-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--cb-border-card);
  border-radius: 14px;
  background: color-mix(in srgb, var(--cb-primary) 4%, transparent);
}

.mapping-item--unmapped {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.06);
}

.conflict-main, .mapping-main { flex: 1; min-width: 0; }

.conflict-title-row,
.mapping-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.conflict-title,
.mapping-title     { font-size: 1rem; font-weight: 600; color: var(--cb-ink); }
.mapping-subtitle  { margin-top: 4px; color: var(--cb-ink-muted); font-size: 0.9rem; }

.conflict-meta     { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.9rem; color: var(--cb-ink-muted); margin-top: 6px; }

.conflict-actions,
.mapping-actions { display: flex; flex-direction: column; gap: 8px; justify-content: center; }

.mapping-suggestion        { margin-top: 6px; color: var(--cb-primary); font-size: 0.9rem; font-weight: 500; }
.mapping-suggestion-action { align-self: flex-start; padding-left: 0 !important; }

/* ── Integration display ─────────────────────────────────────────────────── */
.integration-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cb-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.integration-info        { flex: 1; }
.integration-name        { font-size: 1.1rem; font-weight: 600; color: var(--cb-ink); margin-bottom: 4px; }
.integration-description { font-size: 0.9rem; color: var(--cb-ink-muted); }
.integration-actions     { flex-shrink: 0; }

/* ── Coming soon overlay ─────────────────────────────────────────────────── */
.position-relative { position: relative; }

.coming-soon-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

.coming-soon-badge {
  text-align: center;
  padding: 32px;
  background: color-mix(in srgb, var(--cb-primary) 8%, transparent);
  border-radius: 16px;
  border: 2px dashed color-mix(in srgb, var(--cb-primary) 30%, transparent);
  max-width: 400px;
}

.coming-soon-badge .v-icon { color: var(--cb-primary); opacity: 0.8; }
.coming-soon-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cb-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.coming-soon-subtitle { font-size: 1rem; color: var(--cb-ink-muted); font-weight: 500; }

/* ── Inputs ──────────────────────────────────────────────────────────────── */
.modern-input :deep(.v-field) { border-radius: 8px; transition: all 0.3s ease; }
.modern-input :deep(.v-field--focused) { box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-primary) 12%, transparent); }

.modern-switch { margin-top: 16px; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 960px) {
  .open-finance-actions { align-items: stretch; }
  .open-finance-actions .v-btn { width: 100%; }
  .conflict-item, .mapping-item { flex-direction: column; }
  .conflict-actions, .mapping-actions { width: 100%; }
}

@media (max-width: 600px) {
  .setting-item { flex-direction: column; align-items: flex-start; }
  .integration-item { flex-direction: column; text-align: center; }
  .integration-icon { margin: 0 auto; }
}
</style>
