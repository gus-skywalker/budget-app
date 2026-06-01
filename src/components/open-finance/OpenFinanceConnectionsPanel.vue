<template>
  <div class="of-panel">
    <section class="cb-card of-connect-card">
      <div class="of-connect-copy">
        <div class="of-title-row">
          <v-icon color="var(--cb-primary)">mdi-bank-outline</v-icon>
          <h2>{{ t('openFinance.panel.connect_banks') }}</h2>
        </div>
        <p>{{ t('openFinance.panel.connect_description') }}</p>
        <div class="of-security-note">
          <v-icon size="18" color="var(--cb-primary)">mdi-shield-check-outline</v-icon>
          <span>{{ t('openFinance.panel.security_note') }}</span>
        </div>
      </div>
      <v-btn color="var(--cb-primary)" :disabled="!canManage" @click="wizardOpen = true">
        <v-icon start>mdi-plus</v-icon>
        {{ t('openFinance.panel.add_connection') }}
      </v-btn>
    </section>

    <section class="cb-card mt-6">
      <div class="of-section-header">
        <div>
          <h3>{{ t('openFinance.panel.existing_connections') }}</h3>
          <p>{{ t('openFinance.panel.existing_connections_description') }}</p>
        </div>
        <v-btn variant="text" color="var(--cb-primary)" :loading="loading" @click="$emit('refresh')">
          <v-icon start>mdi-refresh</v-icon>
          {{ t('openFinance.panel.refresh') }}
        </v-btn>
      </div>

      <div v-if="!connections.length" class="of-empty">
        <v-icon size="42" color="var(--cb-primary)">mdi-bank-plus</v-icon>
        <strong>{{ t('openFinance.panel.empty_title') }}</strong>
        <span>{{ t('openFinance.panel.empty_description') }}</span>
      </div>

      <div v-else class="of-connection-list">
        <article v-for="connection in connections" :key="connection.id" class="of-connection">
          <div class="of-connection__main">
            <div class="of-connection__identity">
              <span class="of-bank-mark">
                <img
                  v-if="logoFor(connection)"
                  :src="logoFor(connection)"
                  :alt="connection.institutionName"
                  @error="markLogoAsFailed(connection.bankCode || connection.institutionKey)"
                >
                <span v-else>{{ initials(connection.institutionName || connection.institutionKey) }}</span>
              </span>
              <div class="of-connection__identity-copy">
                <div class="of-connection__title">{{ connection.institutionName || connection.institutionKey }}</div>
                <div class="of-connection__subtitle">
                  {{ connection.displayName || t('openFinance.panel.default_account_name') }}
                  <span v-if="connection.accountNumberMasked">• {{ connection.accountNumberMasked }}</span>
                </div>
              </div>
            </div>

            <div class="of-connection__status-block">
              <div class="of-connection__status-row">
                <v-chip size="small" variant="tonal" :color="statusUi(connection.consentStatus).color">
                  {{ statusUi(connection.consentStatus).label }}
                </v-chip>
                <span v-if="connection.lastProviderStatus" class="of-provider-status">{{ connection.lastProviderStatus }}</span>
              </div>

              <div v-if="connection.lastProviderStatusCheckedAt" class="of-connection__meta">
                {{ t('openFinance.panel.status_checked_at', { date: formatDateTime(connection.lastProviderStatusCheckedAt) }) }}
              </div>

              <div class="of-connection__policy-chips">
                <v-chip
                  v-if="connection.payerDocumentType"
                  size="x-small"
                  variant="outlined"
                >
                  {{ connection.payerDocumentType }}
                </v-chip>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="sharingPolicyBadge(connection).color"
                >
                  {{ sharingPolicyBadge(connection).label }}
                </v-chip>
              </div>

              <p v-if="connection.lastErrorSummary" class="of-provider-status of-provider-status--error of-connection__error">
                {{ connectionErrorSummary(connection) }}
              </p>

              <p v-if="showBackendSyncPolicy(connection)" class="of-sync-policy">
                {{ syncPolicyLabel(connection) }}
              </p>

              <div v-if="showPlanningSharingControl(connection)" class="of-planning-share">
                <div>
                  <strong>{{ planningSharingTitle(connection) }}</strong>
                  <span>{{ planningSharingDescription(connection) }}</span>
                </div>
                <v-select
                  :model-value="planningSharingSelection(connection)"
                  :items="planningSharingOptions"
                  item-title="label"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="of-planning-share__select"
                  :loading="busyConnectionId === connection.id"
                  :disabled="!canManage"
                  @update:model-value="updatePlanningSharingSelection(connection, $event)"
                />
              </div>
            </div>
          </div>

          <div class="of-connection__actions">
            <v-btn
              v-if="showContinueAuthorization(connection)"
              size="small"
              variant="tonal"
              color="var(--cb-primary)"
              @click="openAuthorization(connection)"
            >
              {{ t('openFinance.panel.continue_authorization') }}
            </v-btn>
            <v-btn
              v-if="showRetry(connection)"
              size="small"
              variant="tonal"
              color="warning"
              :loading="busyConnectionId === connection.id"
              :disabled="!canManage"
              @click="retryAuthorization(connection)"
            >
              {{ t('openFinance.panel.retry') }}
            </v-btn>
            <v-btn
              v-if="showRefresh(connection)"
              size="small"
              variant="outlined"
              color="var(--cb-primary)"
              :loading="busyConnectionId === connection.id"
              :disabled="!canManage"
              @click="refreshStatus(connection)"
            >
              {{ t('openFinance.panel.refresh_status') }}
            </v-btn>
            <v-btn
              v-if="showDevSync(connection)"
              size="small"
              variant="outlined"
              color="warning"
              :loading="busyConnectionId === connection.id"
              :disabled="!canManage"
              @click="syncNowForDev(connection)"
            >
              DEV sync
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              :disabled="!canManage"
              @click="requestDisconnect(connection)"
            >
              {{ t('openFinance.panel.disconnect') }}
            </v-btn>
          </div>
        </article>
      </div>
    </section>

    <section class="cb-card mt-6">
      <div class="of-section-header">
        <div>
          <h3>{{ t('openFinance.panel.operational_health') }}</h3>
          <p>{{ t('openFinance.panel.operational_health_description') }}</p>
        </div>
      </div>
      <div class="of-health-grid">
        <div class="of-health-card">
          <span>{{ t('openFinance.panel.connected_accounts') }}</span>
          <strong>{{ connectedCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>{{ t('openFinance.panel.pending_authorizations') }}</span>
          <strong>{{ pendingCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>{{ t('openFinance.panel.error_connections') }}</span>
          <strong>{{ errorCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>{{ t('openFinance.panel.latest_update') }}</span>
          <strong>{{ latestStatusCheck || t('openFinance.panel.no_update') }}</strong>
        </div>
      </div>
    </section>

    <OpenFinanceConnectionWizard
      v-model="wizardOpen"
      @created="handleCreated"
      @feedback="$emit('feedback', $event)"
    />

    <v-dialog v-model="disconnectDialog" max-width="520">
      <v-card class="modern-dialog-card">
        <v-card-title class="dialog-header">
          <v-icon color="#d14343" class="mr-2">mdi-link-variant-off</v-icon>
          <span class="headline">{{ t('openFinance.panel.disconnect_title') }}</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          {{ t('openFinance.panel.disconnect_description') }}
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="disconnectDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="elevated" :loading="disconnecting" @click="confirmDisconnect">
            {{ t('openFinance.panel.disconnect') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { OpenFinanceConnection } from '@/types/openFinance'
import { bankLogoPath, genericBankLogo } from '@/data/openFinanceInstitutions'
import { extractOpenFinanceErrorMessage, sanitizeOpenFinanceMessage } from '@/utils/openFinanceErrors'
import { useUserStore } from '@/plugins/userStore'
import OpenFinanceConnectionWizard from './OpenFinanceConnectionWizard.vue'

const props = defineProps<{
  connections: OpenFinanceConnection[]
  loading?: boolean
  canManage: boolean
}>()

const emit = defineEmits<{
  refresh: []
  feedback: [payload: { type: 'success' | 'error' | 'info'; message: string }]
}>()

const wizardOpen = ref(false)
const busyConnectionId = ref<string | null>(null)
const disconnectDialog = ref(false)
const disconnecting = ref(false)
const selectedDisconnectConnection = ref<OpenFinanceConnection | null>(null)
const failedLogos = ref<Record<string, boolean>>({})
const userStore = useUserStore()
const { t, locale } = useI18n()

const connectedCount = computed(() => props.connections.filter((item) => item.consentStatus === 'AUTHORIZED_READY' || item.status === 'CONNECTED').length)
const pendingCount = computed(() => props.connections.filter((item) => ['PENDING_SETUP', 'PENDING_AUTHORIZATION', 'CONSENT_GRANTED_WAITING_PROVIDER', 'DELAYED_PROVIDER'].includes(String(item.consentStatus || ''))).length)
const errorCount = computed(() => props.connections.filter((item) => ['ERROR', 'AUTHORIZATION_EXPIRED', 'AUTHORIZATION_FAILED'].includes(String(item.consentStatus || ''))).length)
const latestStatusCheck = computed(() => {
  const dates = props.connections
    .map((item) => item.lastProviderStatusCheckedAt || item.lastSyncedAt || item.connectedAt)
    .filter(Boolean)
    .sort()
  return dates.length ? formatDateTime(dates[dates.length - 1] as string) : ''
})

const consentStatusColor: Record<string, string> = {
  PENDING_SETUP: 'grey',
  PENDING_AUTHORIZATION: 'warning',
  CONSENT_GRANTED_WAITING_PROVIDER: 'info',
  AUTHORIZED_SYNCING: 'info',
  AUTHORIZED_READY: 'success',
  DELAYED_PROVIDER: 'warning',
  REAUTH_REQUIRED: 'warning',
  REVOKED: 'error',
  ERROR: 'error',
  AUTHORIZATION_EXPIRED: 'error',
  AUTHORIZATION_FAILED: 'error',
  USER_CANCELLED_AUTHORIZATION: 'grey',
}

const statusUi = (status: string | null | undefined) => {
  const key = String(status || '')
  const labelKey = `openFinance.status.${key}`
  const label = key ? t(labelKey) : t('openFinance.status.undefined')
  return { label: label === labelKey ? key : label, color: consentStatusColor[key] || 'grey' }
}
const showContinueAuthorization = (connection: OpenFinanceConnection) => connection.consentStatus === 'PENDING_AUTHORIZATION' && Boolean(connection.authorizationLink || connection.openfinanceLink)
const showRetry = (connection: OpenFinanceConnection) => ['AUTHORIZATION_EXPIRED', 'AUTHORIZATION_FAILED', 'USER_CANCELLED_AUTHORIZATION', 'REAUTH_REQUIRED'].includes(String(connection.consentStatus || ''))
const showRefresh = (connection: OpenFinanceConnection) => ['PENDING_AUTHORIZATION', 'CONSENT_GRANTED_WAITING_PROVIDER', 'DELAYED_PROVIDER'].includes(String(connection.consentStatus || ''))
const isDevMode = import.meta.env.DEV
const showDevSync = (connection: OpenFinanceConnection) => (
  isDevMode
  && (connection.status === 'CONNECTED' || ['AUTHORIZED_READY', 'AUTHORIZED_SYNCING', 'DELAYED_PROVIDER', 'ERROR'].includes(String(connection.consentStatus || '')))
)
const showBackendSyncPolicy = (connection: OpenFinanceConnection) => ['AUTHORIZED_READY', 'AUTHORIZED_SYNCING'].includes(String(connection.consentStatus || '')) || isRecoverableSyncError(connection)
const syncPolicyLabel = (connection: OpenFinanceConnection) => connection.consentStatus === 'AUTHORIZED_SYNCING'
  ? t('openFinance.panel.sync_in_progress')
  : t('openFinance.panel.sync_policy')
const currentUserId = computed(() => String(userStore.getUser?.id || '').trim())
const showPlanningSharingControl = (connection: OpenFinanceConnection) => (
  connection.payerDocumentType === 'CPF'
  && Boolean(currentUserId.value)
  && connection.connectedByUserId === currentUserId.value
)
const planningSharingOptions = [
  { label: t('openFinance.sharing.private'), value: 'PRIVATE' },
  { label: t('openFinance.sharing.planning_only'), value: 'PLANNING_IMPACT_ONLY' },
  { label: t('openFinance.sharing.personal_shared'), value: 'PERSONAL_SHARED' },
] as const
const planningSharingSelection = (connection: OpenFinanceConnection) => {
  if (connection.planningSharingLevel === 'PLANNING_IMPACT_ONLY' || connection.sharingPolicy === 'PLANNING_IMPACT_ONLY') {
    return 'PLANNING_IMPACT_ONLY'
  }
  if (connection.planningSharingLevel === 'PERSONAL_SHARED' || connection.sharingPolicy === 'PERSONAL_SHARED') {
    return 'PERSONAL_SHARED'
  }
  return 'PRIVATE'
}
const planningSharingTitle = (connection: OpenFinanceConnection) => {
  const level = planningSharingSelection(connection)
  if (level === 'PLANNING_IMPACT_ONLY') return t('openFinance.sharing.included_in_planning')
  if (level === 'PERSONAL_SHARED') return t('openFinance.sharing.personal_shared')
  return t('openFinance.sharing.private')
}
const planningSharingDescription = (connection: OpenFinanceConnection) => {
  const level = planningSharingSelection(connection)
  if (level === 'PLANNING_IMPACT_ONLY') {
    return t('openFinance.sharing.planning_description')
  }
  if (level === 'PERSONAL_SHARED') {
    return t('openFinance.sharing.personal_shared_description')
  }
  return t('openFinance.sharing.private_description')
}
const sharingPolicyBadge = (connection: OpenFinanceConnection) => {
  if (connection.payerDocumentType === 'CNPJ') {
    return { label: t('openFinance.sharing.workspace_shared'), color: 'success' }
  }
  const level = planningSharingSelection(connection)
  if (level === 'PLANNING_IMPACT_ONLY') {
    return { label: t('openFinance.sharing.planning_only'), color: 'warning' }
  }
  if (level === 'PERSONAL_SHARED') {
    return { label: t('openFinance.sharing.personal_shared'), color: 'info' }
  }
  return { label: t('openFinance.sharing.private'), color: 'grey' }
}

const handleCreated = () => {
  wizardOpen.value = false
  emit('refresh')
}

const openAuthorization = (connection: OpenFinanceConnection) => {
  const link = connection.authorizationLink || connection.openfinanceLink
  if (!link) return
  window.open(link, '_blank', 'noopener,noreferrer')
}

const refreshStatus = async (connection: OpenFinanceConnection) => {
  busyConnectionId.value = connection.id
  try {
    const response = await OpenFinanceService.refreshConnectionStatus(connection.id)
    const refreshed = response.data
    if (refreshed.openfinanceId || ['AUTHORIZED_READY', 'AUTHORIZED_SYNCING', 'CONSENT_GRANTED_WAITING_PROVIDER'].includes(String(refreshed.consentStatus || ''))) {
      emit('feedback', { type: 'success', message: t('openFinance.feedback.status_updated') })
    } else {
      emit('feedback', {
        type: 'info',
        message: t('openFinance.feedback.authorization_pending'),
      })
    }
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, t('openFinance.feedback.status_update_error')) })
  } finally {
    busyConnectionId.value = null
  }
}

const retryAuthorization = async (connection: OpenFinanceConnection) => {
  busyConnectionId.value = connection.id
  try {
    const response = await OpenFinanceService.retryAuthorization(connection.id)
    emit('feedback', { type: 'success', message: t('openFinance.feedback.retry_link_generated') })
    const link = response.data.authorizationLink || response.data.openfinanceLink
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, t('openFinance.feedback.retry_error')) })
  } finally {
    busyConnectionId.value = null
  }
}

const syncNowForDev = async (connection: OpenFinanceConnection) => {
  busyConnectionId.value = connection.id
  const today = new Date()
  const from = new Date(today)
  from.setFullYear(from.getFullYear() - 1)
  const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

  try {
    const response = await OpenFinanceService.syncConnection(connection.id, {
      connectionId: connection.id,
      from: toIsoDate(from),
      to: toIsoDate(today),
    })
    const status = String(response.data?.status || '')
    const result = response.data?.result
    if (status === 'EXECUTED') {
      emit('feedback', {
        type: 'success',
        message: t('openFinance.feedback.dev_sync_done', { created: result?.transactionsCreated || 0, updated: result?.transactionsUpdated || 0 }),
      })
    } else if (status === 'PROCESSING') {
      emit('feedback', {
        type: 'info',
        message: t('openFinance.feedback.dev_sync_processing'),
      })
    } else {
      emit('feedback', {
        type: 'info',
        message: t('openFinance.feedback.dev_sync_skipped', { reason: response.data?.reason || status || t('openFinance.feedback.no_reason') }),
      })
    }
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, t('openFinance.feedback.dev_sync_error')) })
  } finally {
    busyConnectionId.value = null
  }
}

const updatePlanningSharingSelection = async (connection: OpenFinanceConnection, selectedLevel: string | null) => {
  const sharingLevel = selectedLevel === 'PLANNING_IMPACT_ONLY' || selectedLevel === 'PERSONAL_SHARED'
    ? selectedLevel
    : 'PRIVATE'
  if (planningSharingSelection(connection) === sharingLevel) {
    return
  }
  busyConnectionId.value = connection.id
  try {
    await OpenFinanceService.updatePlanningSharing(connection.id, sharingLevel)
    emit('feedback', {
      type: 'success',
      message: sharingLevel === 'PLANNING_IMPACT_ONLY'
        ? t('openFinance.feedback.planning_enabled')
        : sharingLevel === 'PERSONAL_SHARED'
          ? t('openFinance.feedback.personal_shared')
          : t('openFinance.feedback.private_again'),
    })
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, t('openFinance.feedback.planning_update_error')) })
  } finally {
    busyConnectionId.value = null
  }
}

const requestDisconnect = (connection: OpenFinanceConnection) => {
  selectedDisconnectConnection.value = connection
  disconnectDialog.value = true
}

const confirmDisconnect = async () => {
  const connection = selectedDisconnectConnection.value
  if (!connection) return
  disconnecting.value = true
  try {
    await OpenFinanceService.disconnectConnection(connection.id)
    emit('feedback', { type: 'success', message: t('openFinance.feedback.disconnected') })
    disconnectDialog.value = false
    selectedDisconnectConnection.value = null
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, t('openFinance.feedback.disconnect_error')) })
  } finally {
    disconnecting.value = false
  }
}

const logoFor = (connection: OpenFinanceConnection) => {
  const key = connection.bankCode || connection.institutionKey
  if (!key) return genericBankLogo
  if (failedLogos.value[key]) return genericBankLogo
  return bankLogoPath(connection.bankCode, connection.institutionKey, connection.institutionName)
}
const markLogoAsFailed = (key: string) => {
  failedLogos.value = { ...failedLogos.value, [key]: true }
}
const initials = (value: string) => value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const getLocaleForFormatting = () => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
}
const formatDateTime = (value: string) => new Date(value).toLocaleString(getLocaleForFormatting(), { dateStyle: 'short', timeStyle: 'short' })
const isRecoverableSyncError = (connection: OpenFinanceConnection) => {
  if (String(connection.consentStatus || '') !== 'ERROR') return false
  if (!connection.openfinanceId) return false
  const providerStatus = String(connection.lastProviderStatus || '').toUpperCase()
  const summary = String(connection.lastErrorSummary || '').toLowerCase()
  if (providerStatus === 'ERROR_401' || (providerStatus === 'ERROR_403' && !summary.includes('fetching statement protocol'))) return false
  return !summary.includes('autoriz')
    && !summary.includes('revogad')
    && !summary.includes('expirad')
    && !summary.includes('reautoriz')
}
const connectionErrorSummary = (connection: OpenFinanceConnection) => (
  sanitizeOpenFinanceMessage(connection.lastErrorSummary, t('openFinance.feedback.provider_technical_error'))
)
const extractErrorMessage = (error: any, fallback: string) => (
  extractOpenFinanceErrorMessage(error, fallback)
)
</script>

<style scoped>
.of-panel {
  width: 100%;
}

.of-connect-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.of-title-row,
.of-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.of-title-row h2,
.of-section-header h3 {
  margin: 0;
  color: #1f2937;
}

.of-connect-copy p,
.of-section-header p {
  margin: 4px 0 0;
  color: #64748b;
}

.of-security-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  color: #475569;
  font-size: 0.92rem;
}

.of-section-header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.of-empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 34px;
  color: #64748b;
  text-align: center;
  border: 1px dashed rgba(100, 116, 139, 0.25);
  border-radius: 8px;
}

.of-connection-list {
  display: grid;
  gap: 12px;
  max-height: clamp(380px, 56vh, 680px);
  overflow-y: auto;
  padding-right: 6px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.of-connection-list::-webkit-scrollbar {
  width: 8px;
}

.of-connection-list::-webkit-scrollbar-track {
  background: rgba(100, 116, 139, 0.08);
  border-radius: 999px;
}

.of-connection-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.38);
  border-radius: 999px;
}

.of-connection {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
  padding: 16px;
  border: 1px solid rgba(100, 116, 139, 0.16);
  border-radius: 8px;
}

.of-connection__main {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.of-connection__identity {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.of-connection__identity-copy {
  min-width: 0;
}

.of-bank-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 800;
  overflow: hidden;
}

.of-bank-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.of-connection__title {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.05rem;
}

.of-connection__subtitle,
.of-connection__meta,
.of-provider-status {
  color: #64748b;
  font-size: 0.86rem;
}

.of-connection__subtitle,
.of-connection__meta,
.of-provider-status,
.of-connection__error {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.of-connection__subtitle {
  margin-top: 2px;
}

.of-provider-status--error {
  color: #b42318;
}

.of-connection__status-block {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.of-connection__status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.of-connection__policy-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.of-connection__error {
  margin: 0;
  line-height: 1.45;
  max-width: 68ch;
}

.of-sync-policy {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.45;
  max-width: 68ch;
}

.of-planning-share {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  max-width: 68ch;
  border: 1px solid rgba(102, 126, 234, 0.18);
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.06);
}

.of-planning-share div {
  display: grid;
  gap: 2px;
  min-width: 220px;
  flex: 1;
}

.of-planning-share strong {
  color: #1f2937;
  font-size: 0.86rem;
}

.of-planning-share span {
  color: #64748b;
  font-size: 0.8rem;
}

.of-planning-share__select {
  min-width: 220px;
  max-width: 240px;
}




.of-connection__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 8px;
  min-width: 220px;
}

.of-health-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.of-health-card {
  border: 1px solid rgba(100, 116, 139, 0.16);
  border-radius: 8px;
  padding: 14px;
}

.of-health-card span {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
}

.of-health-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1.2rem;
  color: #1f2937;
}


@media (max-width: 960px) {
  .of-connect-card,
  .of-section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .of-connection {
    grid-template-columns: 1fr;
  }

  .of-connection__actions {
    justify-content: flex-start;
    min-width: 0;
  }

  .of-health-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .of-health-grid {
    grid-template-columns: 1fr;
  }
}
</style>
