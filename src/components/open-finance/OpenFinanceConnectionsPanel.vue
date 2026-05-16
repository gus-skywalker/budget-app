<template>
  <div class="of-panel">
    <section class="modern-card of-connect-card">
      <div class="of-connect-copy">
        <div class="of-title-row">
          <v-icon color="#667eea">mdi-bank-outline</v-icon>
          <h2>Conectar bancos</h2>
        </div>
        <p>Sincronize saldos e transações com segurança via Open Finance.</p>
        <div class="of-security-note">
          <v-icon size="18" color="#667eea">mdi-shield-check-outline</v-icon>
          <span>Você será redirecionado ao ambiente seguro do banco para autorizar o compartilhamento. O CoBudget não acessa sua senha.</span>
        </div>
      </div>
      <v-btn class="gradient-btn" :disabled="!canManage" @click="wizardOpen = true">
        <v-icon start>mdi-plus</v-icon>
        Adicionar conexão
      </v-btn>
    </section>

    <section class="modern-card mt-6">
      <div class="of-section-header">
        <div>
          <h3>Conexões existentes</h3>
          <p>Autorizações e contas conectadas neste workspace.</p>
        </div>
        <v-btn variant="text" color="#667eea" :loading="loading" @click="$emit('refresh')">
          <v-icon start>mdi-refresh</v-icon>
          Atualizar
        </v-btn>
      </div>

      <div v-if="!connections.length" class="of-empty">
        <v-icon size="42" color="#667eea">mdi-bank-plus</v-icon>
        <strong>Nenhum banco conectado ainda.</strong>
        <span>Comece adicionando uma conexão pelo catálogo de bancos.</span>
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
                  {{ connection.displayName || 'Conta Open Finance' }}
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
                Status checado em {{ formatDateTime(connection.lastProviderStatusCheckedAt) }}
              </div>

              <p v-if="connection.lastErrorSummary" class="of-provider-status of-provider-status--error of-connection__error">
                {{ connectionErrorSummary(connection) }}
              </p>

              <p v-if="showSync(connection)" class="of-sync-policy">
                {{ syncPolicyLabel(connection) }}
              </p>
            </div>
          </div>

          <div class="of-connection__actions">
            <v-btn
              v-if="showContinueAuthorization(connection)"
              size="small"
              variant="tonal"
              color="#667eea"
              @click="openAuthorization(connection)"
            >
              Continuar autorização
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
              Tentar novamente
            </v-btn>
            <v-btn
              v-if="showRefresh(connection)"
              size="small"
              variant="outlined"
              color="#667eea"
              :loading="busyConnectionId === connection.id"
              :disabled="!canManage"
              @click="refreshStatus(connection)"
            >
              Atualizar status
            </v-btn>
            <v-btn
              v-if="showSync(connection)"
              size="small"
              variant="tonal"
              color="#667eea"
              :loading="syncingConnectionId === connection.id"
              :disabled="!canManage"
              :title="syncButtonTitle(connection)"
              @click="syncConnection(connection)"
            >
              {{ syncButtonLabel(connection) }}
            </v-btn>
            <v-btn
              v-if="showNewProtocol(connection)"
              size="small"
              variant="outlined"
              color="#667eea"
              :loading="newProtocolConnectionId === connection.id"
              :disabled="!canManage"
              title="Cria um novo protocolo no provedor, respeitando quota e cooldown."
              @click="syncConnection(connection, { forceNewProtocol: true })"
            >
              Gerar protocolo
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              :disabled="!canManage"
              @click="requestDisconnect(connection)"
            >
              Desconectar
            </v-btn>
          </div>
        </article>
      </div>
    </section>

    <section class="modern-card mt-6">
      <div class="of-section-header">
        <div>
          <h3>Saúde operacional</h3>
          <p>Visão rápida derivada das conexões atuais.</p>
        </div>
      </div>
      <div class="of-health-grid">
        <div class="of-health-card">
          <span>Contas conectadas</span>
          <strong>{{ connectedCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>Autorizações pendentes</span>
          <strong>{{ pendingCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>Conexões com erro</span>
          <strong>{{ errorCount }}</strong>
        </div>
        <div class="of-health-card">
          <span>Última atualização</span>
          <strong>{{ latestStatusCheck || 'Sem atualização' }}</strong>
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
          <span class="headline">Desconectar banco?</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          Novas sincronizações serão interrompidas, mas o histórico já importado será mantido para rastreabilidade.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="disconnectDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" :loading="disconnecting" @click="confirmDisconnect">
            Desconectar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { OpenFinanceConnection, OpenFinanceSyncResponse } from '@/types/openFinance'
import { bankLogoPath, genericBankLogo } from '@/data/openFinanceInstitutions'
import { extractOpenFinanceErrorMessage, sanitizeOpenFinanceMessage } from '@/utils/openFinanceErrors'
import OpenFinanceConnectionWizard from './OpenFinanceConnectionWizard.vue'

type CachedProviderProtocol = {
  providerProtocolId: string
  storedAt: string
}

const props = defineProps<{
  connections: OpenFinanceConnection[]
  loading?: boolean
  canManage: boolean
  syncFrom: string
  syncTo: string
}>()

const emit = defineEmits<{
  refresh: []
  feedback: [payload: { type: 'success' | 'error' | 'info'; message: string }]
  synced: [result: OpenFinanceSyncResponse | null]
}>()

const wizardOpen = ref(false)
const busyConnectionId = ref<string | null>(null)
const syncingConnectionId = ref<string | null>(null)
const newProtocolConnectionId = ref<string | null>(null)
const disconnectDialog = ref(false)
const disconnecting = ref(false)
const selectedDisconnectConnection = ref<OpenFinanceConnection | null>(null)
const failedLogos = ref<Record<string, boolean>>({})
const protocolCacheVersion = ref(0)

const PROTOCOL_REUSE_WINDOW_MS = 24 * 60 * 60 * 1000

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

const consentStatusUi: Record<string, { label: string; color: string }> = {
  PENDING_SETUP: { label: 'Preparando', color: 'grey' },
  PENDING_AUTHORIZATION: { label: 'Aguardando autorização', color: 'warning' },
  CONSENT_GRANTED_WAITING_PROVIDER: { label: 'Autorização recebida', color: 'info' },
  AUTHORIZED_SYNCING: { label: 'Sincronizando', color: 'info' },
  AUTHORIZED_READY: { label: 'Atualizado', color: 'success' },
  DELAYED_PROVIDER: { label: 'Aguardando banco', color: 'warning' },
  REAUTH_REQUIRED: { label: 'Reautorizar', color: 'warning' },
  REVOKED: { label: 'Revogado', color: 'error' },
  ERROR: { label: 'Erro', color: 'error' },
  AUTHORIZATION_EXPIRED: { label: 'Autorização expirada', color: 'error' },
  AUTHORIZATION_FAILED: { label: 'Falha na autorização', color: 'error' },
  USER_CANCELLED_AUTHORIZATION: { label: 'Cancelado pelo usuário', color: 'grey' },
}

const statusUi = (status: string | null | undefined) => consentStatusUi[String(status || '')] || { label: status || 'Indefinido', color: 'grey' }
const showContinueAuthorization = (connection: OpenFinanceConnection) => connection.consentStatus === 'PENDING_AUTHORIZATION' && Boolean(connection.authorizationLink || connection.openfinanceLink)
const showRetry = (connection: OpenFinanceConnection) => ['AUTHORIZATION_EXPIRED', 'AUTHORIZATION_FAILED', 'USER_CANCELLED_AUTHORIZATION', 'REAUTH_REQUIRED'].includes(String(connection.consentStatus || ''))
const showRefresh = (connection: OpenFinanceConnection) => ['PENDING_AUTHORIZATION', 'CONSENT_GRANTED_WAITING_PROVIDER', 'DELAYED_PROVIDER'].includes(String(connection.consentStatus || ''))
const showSync = (connection: OpenFinanceConnection) => ['AUTHORIZED_READY', 'AUTHORIZED_SYNCING'].includes(String(connection.consentStatus || '')) || isRecoverableSyncError(connection)
const showNewProtocol = (connection: OpenFinanceConnection) => showSync(connection) && Boolean(cachedProtocolFor(connection))
const syncButtonLabel = (connection: OpenFinanceConnection) => cachedProtocolFor(connection) ? 'Atualizar dados' : 'Gerar protocolo'
const syncButtonTitle = (connection: OpenFinanceConnection) => cachedProtocolFor(connection)
  ? 'Busca novamente os dados usando o último protocolo salvo, sem criar um novo protocolo no provedor.'
  : 'Cria um novo protocolo de extrato no provedor. Essa ação respeita o limite operacional diário.'
const syncPolicyLabel = (connection: OpenFinanceConnection) => cachedProtocolFor(connection)
  ? 'Usará o último protocolo salvo para atualizar os dados sem consumir uma nova geração.'
  : 'Criará um novo protocolo no provedor se a janela de quota/cooldown permitir.'

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
      emit('feedback', { type: 'success', message: 'Status da conexão atualizado.' })
    } else {
      emit('feedback', {
        type: 'info',
        message: 'A autorização ainda não foi confirmada pelo provedor. Aguarde alguns minutos e atualize novamente.',
      })
    }
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, 'Falha ao atualizar status da conexão.') })
  } finally {
    busyConnectionId.value = null
  }
}

const retryAuthorization = async (connection: OpenFinanceConnection) => {
  busyConnectionId.value = connection.id
  try {
    const response = await OpenFinanceService.retryAuthorization(connection.id)
    emit('feedback', { type: 'success', message: 'Novo link de autorização gerado.' })
    const link = response.data.authorizationLink || response.data.openfinanceLink
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, 'Falha ao tentar autorização novamente.') })
  } finally {
    busyConnectionId.value = null
  }
}

const syncConnection = async (connection: OpenFinanceConnection, options: { forceNewProtocol?: boolean } = {}) => {
  if (options.forceNewProtocol) {
    newProtocolConnectionId.value = connection.id
  } else {
    syncingConnectionId.value = connection.id
  }
  try {
    const cachedProtocol = options.forceNewProtocol ? null : cachedProtocolFor(connection)
    const response = await OpenFinanceService.syncConnection(connection.id, {
      connectionId: connection.id,
      from: props.syncFrom,
      to: props.syncTo,
      providerProtocolId: cachedProtocol?.providerProtocolId || null,
    })
    emit('synced', response.data.result)
    const protocolId = response.data.providerProtocolId || response.data.result?.providerProtocolId
    if (protocolId) {
      storeCachedProtocol(connection.id, protocolId)
    } else if (options.forceNewProtocol) {
      clearCachedProtocol(connection.id)
    }
    emit('feedback', {
      type: response.data.status === 'EXECUTED' ? 'success' : 'info',
      message: response.data.status === 'EXECUTED'
        ? `${cachedProtocol ? 'Dados atualizados a partir do protocolo salvo' : 'Sincronização da conexão concluída'}.${protocolId ? ` Protocolo: ${protocolId}.` : ''}`
        : response.data.status === 'PROCESSING'
          ? `Sincronização em processamento no banco.${protocolId ? ` Protocolo: ${protocolId}.` : ''}${response.data.reason ? ` ${response.data.reason}` : ''}`
          : `Sincronização não executada: ${response.data.reason || response.data.status}`,
    })
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, 'Falha ao sincronizar a conexão.') })
  } finally {
    syncingConnectionId.value = null
    newProtocolConnectionId.value = null
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
    emit('feedback', { type: 'success', message: 'Banco desconectado. O histórico importado foi mantido.' })
    disconnectDialog.value = false
    selectedDisconnectConnection.value = null
    emit('refresh')
  } catch (error: any) {
    emit('feedback', { type: 'error', message: extractErrorMessage(error, 'Falha ao desconectar banco.') })
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
const cacheKeyFor = (connectionId: string) => `cobudget:open-finance:provider-protocol:${connectionId}`
const cachedProtocolFor = (connection: OpenFinanceConnection): CachedProviderProtocol | null => {
  protocolCacheVersion.value
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(cacheKeyFor(connection.id))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedProviderProtocol
    if (!parsed.providerProtocolId || !parsed.storedAt) return null
    const ageMs = Date.now() - new Date(parsed.storedAt).getTime()
    if (Number.isNaN(ageMs) || ageMs < 0 || ageMs > PROTOCOL_REUSE_WINDOW_MS) {
      window.localStorage.removeItem(cacheKeyFor(connection.id))
      protocolCacheVersion.value += 1
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(cacheKeyFor(connection.id))
    protocolCacheVersion.value += 1
    return null
  }
}
const storeCachedProtocol = (connectionId: string, providerProtocolId: string) => {
  if (typeof window === 'undefined' || !providerProtocolId) return
  window.localStorage.setItem(cacheKeyFor(connectionId), JSON.stringify({
    providerProtocolId,
    storedAt: new Date().toISOString(),
  }))
  protocolCacheVersion.value += 1
}
const clearCachedProtocol = (connectionId: string) => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(cacheKeyFor(connectionId))
  protocolCacheVersion.value += 1
}
const initials = (value: string) => value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const formatDateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
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
  sanitizeOpenFinanceMessage(connection.lastErrorSummary, 'Falha técnica no provedor de Open Finance. Tente sincronizar novamente mais tarde.')
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

.v-theme--dark .of-sync-policy {
  color: #cbd5e1;
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

.gradient-btn {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
