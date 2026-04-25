<template>
  <div class="accounts-page">
    <v-container class="modern-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('accounts.title') }}</h1>
          <p class="page-subtitle">{{ $t('accounts.subtitle') }}</p>
        </div>
        <v-alert
          v-if="conflictCount > 0"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="conflict-alert"
        >
          {{ conflictCount }} conflito(s) Open Finance pendente(s) de revisão.
        </v-alert>
      </div>

      <div class="modern-card optout-story-card mb-6">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-shield-account-outline</v-icon>
            Controle de conexão e opt-out
          </h2>
        </div>
        <div class="card-content">
          <p class="story-text">
            Se você quiser sair do Open Finance, o caminho é simples: vá em Conexões, desconecte o banco e a sincronização automática é interrompida.
          </p>
          <p class="story-text">
            O histórico já importado pode continuar disponível para auditoria; a gestão de retenção e exclusão deve seguir as políticas legais abaixo.
          </p>
          <div class="story-actions">
            <v-btn color="#667eea" variant="tonal" @click="goToConnections">
              <v-icon start>mdi-link-variant-off</v-icon>
              Ir para Conexões
            </v-btn>
            <v-btn variant="text" @click="openLegalDoc('privacy-policy')">Política de Privacidade</v-btn>
            <v-btn variant="text" @click="openLegalDoc('terms-of-use')">Termos de Uso</v-btn>
            <v-btn variant="text" @click="openLegalDoc('cookie-policy')">Política de Cookies</v-btn>
          </div>
        </div>
      </div>

      <div class="modern-card">
        <div class="card-header">
          <h2 class="card-title">
            <v-icon color="#667eea" class="mr-2">mdi-bank-outline</v-icon>
            {{ $t('accounts.list_title') }}
          </h2>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="#667eea" size="40" />
          </div>
          <div v-else-if="accounts.length" class="accounts-grid">
            <div v-for="account in accounts" :key="account.id" class="account-card">
              <div class="account-card__header">
                <div>
                  <h3 class="account-card__title">{{ account.name }}</h3>
                  <p class="account-card__subtitle">{{ account.provider }} • {{ account.accountType }}</p>
                </div>
                <v-chip size="small" variant="tonal" color="#667eea">{{ account.currency }}</v-chip>
              </div>
              <div class="account-card__balance">{{ formatCurrency(account.balance, account.currency) }}</div>
            </div>
          </div>
          <div v-else class="empty-state">
            <v-icon size="48" color="#667eea" class="mb-3">mdi-bank-off-outline</v-icon>
            <p class="empty-message">{{ $t('accounts.empty') }}</p>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import FinancialReadService from '@/services/FinancialReadService'
import OpenFinanceService from '@/services/OpenFinanceService'
import type { AccountView } from '@/types/financialRead'

const { locale } = useI18n()
const router = useRouter()

const accounts = ref<AccountView[]>([])
const loading = ref(false)
const conflictCount = ref(0)

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

const fetchAccounts = async () => {
  loading.value = true
  try {
    const [accountsResponse, conflictsResponse] = await Promise.all([
      FinancialReadService.fetchAccounts(),
      OpenFinanceService.listReconciliationConflicts(),
    ])
    accounts.value = accountsResponse.data || []
    conflictCount.value = Array.isArray(conflictsResponse.data) ? conflictsResponse.data.length : 0
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
  } finally {
    loading.value = false
  }
}

const goToConnections = () => {
  router.push({ name: 'settings', query: { tab: 'connections' } })
}

const openLegalDoc = (routeName: 'privacy-policy' | 'terms-of-use' | 'cookie-policy') => {
  const resolved = router.resolve({ name: routeName })
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
}

onMounted(fetchAccounts)
</script>

<style scoped>
.accounts-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(245, 247, 250, 1) 0%, rgba(232, 234, 240, 1) 100%);
  padding: 32px 0;
}

.v-theme--dark .accounts-page {
  background: linear-gradient(135deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%);
}

.modern-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.conflict-alert {
  max-width: 420px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.v-theme--dark .page-title {
  color: #ffffff;
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.v-theme--dark .page-subtitle {
  color: #b0b0b0;
}

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.optout-story-card {
  margin-top: 0;
}

.story-text {
  margin: 0 0 10px;
  color: #4b5563;
}

.v-theme--dark .story-text {
  color: #cbd5e1;
}

.story-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.v-theme--dark .modern-card {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  color: #1a1a1a;
}

.v-theme--dark .card-title {
  color: #ffffff;
}

.card-content {
  padding: 24px;
}

.loading-state,
.empty-state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.accounts-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.account-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 18px;
  background: rgba(102, 126, 234, 0.04);
}

.v-theme--dark .account-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(102, 126, 234, 0.08);
}

.account-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.account-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.v-theme--dark .account-card__title {
  color: #ffffff;
}

.account-card__subtitle {
  margin: 4px 0 0;
  color: #666;
  font-size: 0.9rem;
}

.v-theme--dark .account-card__subtitle {
  color: #b0b0b0;
}

.account-card__balance {
  font-size: 1.35rem;
  font-weight: 700;
  color: #667eea;
}

.empty-message {
  color: #666;
  margin: 0;
}

.v-theme--dark .empty-message {
  color: #b0b0b0;
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .conflict-alert {
    max-width: none;
    width: 100%;
  }
}
</style>
