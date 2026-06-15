<template>
  <div class="cb-page">
    <div class="cb-container">
      <page-header :title="t('accounts.title')" :meta="t('accounts.subtitle')">
        <template v-if="conflictCount > 0" #actions>
          <v-chip color="var(--cb-warning)" variant="tonal" prepend-icon="mdi-alert">
            {{ conflictCount }} conflito(s) Open Finance pendente(s)
          </v-chip>
        </template>
      </page-header>

      <alert-strip
        v-if="activeOpenFinanceConnections.length"
        variant="info"
        :description="openFinanceVisibilityMessage"
      />

      <alert-strip
        v-else-if="!canUseConnectedFinance"
        variant="info"
        :title="t('accounts.connected_finance_locked_title')"
        :description="t('accounts.connected_finance_locked_description')"
      />

      <div class="cb-card accounts-optout-card">
        <div class="cb-card__header">
          <h2 class="cb-card__title">
            <v-icon color="var(--cb-primary)" class="mr-2" size="18">mdi-shield-account-outline</v-icon>
            Controle de conexão e opt-out
          </h2>
        </div>
        <div class="cb-card__body">
          <p class="story-text">
            Se você quiser sair do Open Finance, o caminho é simples: vá em Conexões, desconecte o banco e a sincronização automática é interrompida.
          </p>
          <p class="story-text">
            O histórico já importado pode continuar disponível para auditoria; a gestão de retenção e exclusão deve seguir as políticas legais abaixo.
          </p>
          <div class="story-actions">
            <v-btn color="var(--cb-primary)" variant="tonal" @click="goToConnections">
              <v-icon start>{{ canUseConnectedFinance ? 'mdi-link-variant-off' : 'mdi-lock-open-outline' }}</v-icon>
              {{ canUseConnectedFinance ? t('accounts.go_to_connections') : t('accounts.open_finance_upgrade_cta') }}
            </v-btn>
            <v-btn variant="text" @click="openLegalDoc('privacy-policy')">Política de Privacidade</v-btn>
            <v-btn variant="text" @click="openLegalDoc('terms-of-use')">Termos de Uso</v-btn>
            <v-btn variant="text" @click="openLegalDoc('cookie-policy')">Política de Cookies</v-btn>
          </div>
        </div>
      </div>

      <div class="cb-card">
        <div class="cb-card__header">
          <h2 class="cb-card__title">
            <v-icon color="var(--cb-primary)" class="mr-2" size="18">mdi-bank-outline</v-icon>
            {{ t('accounts.list_title') }}
          </h2>
        </div>
        <div class="cb-card__body">
          <div v-if="loading" class="cb-empty-state">
            <v-icon size="40" color="var(--cb-ink-muted)">mdi-timer-sand</v-icon>
            <p>Carregando contas...</p>
          </div>
          <div v-else-if="visibleAccounts.length" class="accounts-grid">
            <div v-for="account in visibleAccounts" :key="account.id" class="account-card">
              <div class="account-card__header">
                <div class="account-card__identity">
                  <span class="account-card__logo">
                    <img
                      :src="accountLogoFor(account)"
                      :alt="accountInstitutionLabel(account)"
                      @error="markAccountLogoAsFailed(account.id)"
                    >
                  </span>
                  <div>
                    <h3 class="account-card__title">{{ account.name }}</h3>
                    <p class="account-card__subtitle">{{ account.accountType || t('accounts.account_type_unavailable') }}</p>
                  </div>
                </div>
                <v-chip size="small" variant="tonal" color="var(--cb-accent)">{{ account.currency }}</v-chip>
              </div>
              <div class="account-card__balance">{{ formatCurrency(account.balance, account.currency) }}</div>
              <div v-if="findConnectionForAccount(account)" class="account-card__chips">
                <v-chip size="x-small" variant="tonal" color="var(--cb-accent)">Open Finance</v-chip>
                <v-chip
                  v-if="findConnectionForAccount(account)?.payerDocumentType"
                  size="x-small"
                  variant="outlined"
                >
                  {{ findConnectionForAccount(account)?.payerDocumentType }}
                </v-chip>
                <v-chip
                  v-if="connectionSharingBadge(findConnectionForAccount(account))"
                  size="x-small"
                  variant="tonal"
                  :color="connectionSharingBadge(findConnectionForAccount(account))?.color"
                >
                  {{ connectionSharingBadge(findConnectionForAccount(account))?.label }}
                </v-chip>
              </div>
              <p v-if="findConnectionForAccount(account)" class="account-card__sharing-note">
                {{ connectionSharingNote(findConnectionForAccount(account)) }}
              </p>
            </div>
          </div>
          <div v-else class="cb-empty-state">
            <v-icon size="48" color="var(--cb-ink-muted)">mdi-bank-off-outline</v-icon>
            <p>{{ t('accounts.empty') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import FinancialReadService from '@/services/FinancialReadService'
import OpenFinanceService from '@/services/OpenFinanceService'
import BillingOrchestrationService, { type BillingSummaryResponse } from '@/services/BillingOrchestrationService'
import { bankLogoPath, genericBankLogo } from '@/data/openFinanceInstitutions'
import type { AccountView } from '@/types/financialRead'
import type { OpenFinanceConnection } from '@/types/openFinance'
import { useUserStore } from '@/plugins/userStore'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const accounts = ref<AccountView[]>([])
const loading = ref(false)
const conflictCount = ref(0)
const openFinanceConnections = ref<OpenFinanceConnection[]>([])
const billingSummary = ref<BillingSummaryResponse | null>(null)
const failedAccountLogos = ref<Record<string, boolean>>({})
const ACTIVE_OPEN_FINANCE_STATUSES = new Set(['CONNECTED', 'ERROR'])
const currentWorkspaceId = computed(() =>
  userStore.getCurrentWorkspaceId || userStore.getPreferredWorkspaceId || userStore.getWorkspaces[0]?.workspaceId || ''
)
const currentRole = computed(() => String(userStore.getCurrentRole || '').toUpperCase())
const isOwnerOrAdmin = computed(() => ['ROLE_OWNER', 'ROLE_ADMIN'].includes(currentRole.value))
const canUseConnectedFinance = computed(() => {
  const capabilities = billingSummary.value?.capabilities
  if (!capabilities) return false
  if (typeof capabilities.connectedFinanceEnabled === 'boolean') return capabilities.connectedFinanceEnabled
  return Boolean(capabilities.advancedToolsEnabled || billingSummary.value?.hasPremiumAccess)
})

const activeOpenFinanceConnections = computed(() => {
  return openFinanceConnections.value.filter((connection) => ACTIVE_OPEN_FINANCE_STATUSES.has(String(connection.status || '').toUpperCase()))
})

const openFinanceVisibilityMessage = computed(() => {
  if (isOwnerOrAdmin.value) {
    return 'Fontes CNPJ aparecem como compartilhadas com o espaço. Em fontes CPF, "Planejamento apenas" alimenta só o baseline; "Compartilhado com administradores" libera visibilidade operacional para proprietários e administradores.'
  }
  return 'Fontes CNPJ compartilhadas aparecem normalmente neste espaço. Fontes CPF continuam privadas para a sua permissão, exceto pelo impacto agregado de planejamento quando o proprietário habilita esse nível.'
})

const visibleAccounts = computed(() => {
  const nonOpenFinanceAccounts = accounts.value.filter((account) => String(account.provider || '').toUpperCase() !== 'OPEN_FINANCE')
  const openFinanceAccounts = accounts.value.filter((account) => String(account.provider || '').toUpperCase() === 'OPEN_FINANCE')
  const syntheticConnectionAccounts = activeOpenFinanceConnections.value
    .filter((connection) => !openFinanceAccounts.some((account) => accountMatchesConnection(account, connection)))
    .map(connectionToAccountView)

  return [
    ...nonOpenFinanceAccounts,
    ...openFinanceAccounts,
    ...syntheticConnectionAccounts,
  ]
})

const accountMatchesConnection = (account: AccountView, connection: OpenFinanceConnection) => {
  const bankCode = String(account.bankCode || '').trim()
  if (bankCode && connection.bankCode && bankCode === connection.bankCode) return true

  const institutionKey = String(account.institutionKey || '').trim()
  if (institutionKey && connection.institutionKey && institutionKey === connection.institutionKey) return true

  const institutionName = String(account.institutionName || '').trim()
  if (institutionName && connection.institutionName && institutionName === connection.institutionName) return true

  const accountName = String(account.name || '')
  const connectionName = String(connection.institutionName || '').trim()
  if (connectionName && accountName.startsWith(`${connectionName} - `)) return true

  const displayName = String(connection.displayName || '').trim()
  return Boolean(displayName && accountName === displayName)
}

const connectionToAccountView = (connection: OpenFinanceConnection): AccountView => ({
  id: `open-finance-connection-${connection.id}`,
  name: connection.displayName || connection.institutionName || 'Open Finance',
  provider: 'OPEN_FINANCE',
  accountType: connection.statementType || 'BANK',
  currency: 'BRL',
  balance: 0,
  bankCode: connection.bankCode || null,
  institutionKey: connection.institutionKey || null,
  institutionName: connection.institutionName || null,
})

const getLocaleForFormatting = () => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'fr') return 'fr-FR'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
}

const formatCurrency = (value: number, currency = 'BRL') => {
  return Number(value || 0).toLocaleString(getLocaleForFormatting(), {
    style: 'currency',
    currency,
  })
}

const findConnectionForAccount = (account: AccountView) => {
  const bankCode = String(account.bankCode || '').trim()
  if (bankCode) {
    const byCode = activeOpenFinanceConnections.value.find((connection) => connection.bankCode === bankCode)
    if (byCode) return byCode
  }

  const institutionName = String(account.institutionName || '').trim()
  if (institutionName) {
    const byInstitution = activeOpenFinanceConnections.value.find((connection) => connection.institutionName === institutionName)
    if (byInstitution) return byInstitution
  }

  const accountName = String(account.name || '')
  return activeOpenFinanceConnections.value.find((connection) => {
    const name = String(connection.institutionName || '').trim()
    return name && accountName.startsWith(`${name} - `)
  })
}

const connectionSharingBadge = (connection?: OpenFinanceConnection | null) => {
  if (!connection) return null
  if (connection.payerDocumentType === 'CNPJ') {
    return { label: 'Compartilhado com espaço', color: 'success' }
  }
  const level = connection.planningSharingLevel || connection.sharingPolicy
  if (level === 'PLANNING_IMPACT_ONLY') {
    return { label: 'Planejamento apenas', color: 'warning' }
  }
  if (level === 'PERSONAL_SHARED') {
    return { label: 'Compartilhado com administradores', color: 'info' }
  }
  return { label: 'Privado', color: 'grey' }
}

const connectionSharingNote = (connection?: OpenFinanceConnection | null) => {
  if (!connection) return ''
  if (connection.payerDocumentType === 'CNPJ') {
    return 'Fonte empresarial compartilhada com o espaço para uso operacional e planejamento.'
  }
  const level = connection.planningSharingLevel || connection.sharingPolicy
  if (level === 'PLANNING_IMPACT_ONLY') {
    return 'Fonte pessoal usada apenas em agregados de planejamento. Os detalhes continuam privados.'
  }
  if (level === 'PERSONAL_SHARED') {
    return isOwnerOrAdmin.value
      ? 'Fonte pessoal compartilhada com proprietários e administradores para visibilidade operacional.'
      : 'Fonte pessoal com compartilhamento administrativo. Esse nível não libera detalhes para a sua permissão.'
  }
  return 'Fonte pessoal privada. Sem compartilhamento operacional nem impacto em planejamento.'
}

const accountLogoFor = (account: AccountView) => {
  if (failedAccountLogos.value[account.id]) return genericBankLogo
  const connection = findConnectionForAccount(account)
  return bankLogoPath(
    account.bankCode || connection?.bankCode,
    account.institutionKey || connection?.institutionKey,
    account.institutionName || connection?.institutionName || account.provider || account.name,
  )
}

const accountInstitutionLabel = (account: AccountView) => {
  const connection = findConnectionForAccount(account)
  return account.institutionName || connection?.institutionName || account.provider || account.name || 'Banco'
}

const markAccountLogoAsFailed = (accountId: string) => {
  failedAccountLogos.value = { ...failedAccountLogos.value, [accountId]: true }
}

const fetchAccounts = async () => {
  loading.value = true
  try {
    const accountsResponse = await FinancialReadService.fetchAccounts()
    accounts.value = accountsResponse.data || []

    if (!canUseConnectedFinance.value) {
      conflictCount.value = 0
      openFinanceConnections.value = []
      return
    }

    const [conflictsResponse, connectionsResponse] = await Promise.all([
      OpenFinanceService.listReconciliationConflicts(),
      OpenFinanceService.listConnections(),
    ])
    conflictCount.value = Array.isArray(conflictsResponse.data) ? conflictsResponse.data.length : 0
    openFinanceConnections.value = Array.isArray(connectionsResponse.data) ? connectionsResponse.data : []
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
  } finally {
    loading.value = false
  }
}

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

const goToConnections = () => {
  if (!canUseConnectedFinance.value) {
    router.push({ name: 'choose-plan', query: { feature: 'connected-finance' } })
    return
  }
  router.push({ name: 'settings', query: { tab: 'connections' } })
}

const openLegalDoc = (routeName: 'privacy-policy' | 'terms-of-use' | 'cookie-policy') => {
  const resolved = router.resolve({ name: routeName })
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  await loadBillingCapabilities()
  await fetchAccounts()
})
</script>

<style scoped>
/* Opt-out info card spacing */
.accounts-optout-card {
  margin-bottom: 20px;
}

.story-text {
  margin: 0 0 10px;
  color: var(--cb-ink-secondary);
  font-size: 0.9rem;
  line-height: 1.55;
}

.story-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

/* Account grid */
.accounts-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.account-card {
  border: 1px solid var(--cb-border-card);
  border-radius: var(--cb-radius-card);
  padding: 18px;
  background: var(--cb-surface-soft);
}

.account-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.account-card__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.account-card__logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 8px;
  background: var(--cb-surface);
  overflow: hidden;
}

.account-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.account-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--cb-ink);
}

.account-card__subtitle {
  margin: 4px 0 0;
  color: var(--cb-ink-muted);
  font-size: 0.88rem;
}

.account-card__balance {
  font-family: var(--cb-font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--cb-primary);
}

.account-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.account-card__sharing-note {
  margin: 10px 0 0;
  color: var(--cb-ink-secondary);
  font-size: 0.88rem;
  line-height: 1.45;
}
</style>
