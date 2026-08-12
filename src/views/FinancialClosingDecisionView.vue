<template>
  <div class="cb-page decision-page">
    <div class="cb-container narrow">
      <v-btn class="back-action" variant="text" prepend-icon="mdi-arrow-left" @click="back">Voltar para a competência</v-btn>
      <page-header title="Decisão da Produtividade" :summary-items="headerSummary" />

      <div class="announcements" aria-live="polite" aria-atomic="true">
        <p v-if="successMessage">{{ successMessage }}</p>
      </div>
      <alert-strip v-if="errorMessage" variant="info" :description="errorMessage" />

      <div v-if="loading" class="cb-empty-state" role="status">
        <v-progress-circular indeterminate />
        <p>Carregando a decisão…</p>
      </div>

      <template v-else-if="closing && summary">
        <section class="cb-card decision-state" aria-labelledby="decision-state-title">
          <div>
            <p class="eyebrow">Produtividade e Valor a Receber</p>
            <h2 id="decision-state-title" ref="statusHeading" tabindex="-1">{{ stateTitle }}</h2>
            <p>{{ stateDescription }}</p>
          </div>
          <v-chip :color="statusColor" variant="tonal">{{ statusLabel }}</v-chip>
        </section>

        <section class="metrics" aria-label="Valores da decisão">
          <article class="cb-card"><span>Produtividade Líquida</span><strong>{{ money(summary.netProductivityAmount) }}</strong></article>
          <article class="cb-card primary"><span>Valor a Receber</span><strong>{{ money(valueReceivable) }}</strong></article>
          <article class="cb-card"><span>Reservas TM e TI</span><strong>{{ money(fixedReserves) }}</strong></article>
          <article class="cb-card"><span>Reserva adicional</span><strong>{{ money(additionalReserve) }}</strong></article>
        </section>

        <section v-if="visibleBlockers.length" class="cb-card blockers" aria-labelledby="decision-blockers-title">
          <v-icon color="warning" size="32">mdi-alert-circle-outline</v-icon>
          <div>
            <h2 id="decision-blockers-title">Antes de avançar</h2>
            <ul><li v-for="blocker in visibleBlockers" :key="blocker">{{ blocker }}</li></ul>
          </div>
        </section>

        <section class="section" aria-labelledby="payout-lines-title">
          <div class="section-heading">
            <div><p class="eyebrow">Memória congelada</p><h2 id="payout-lines-title">Valores por participante</h2></div>
            <span>{{ lineCount }} participante(s)</span>
          </div>
          <div class="participant-list">
            <article v-for="line in displayLines" :key="line.participantId" class="cb-card participant-line">
              <div><strong>{{ participantName(line.participantId) }}</strong><small v-if="line.dueDate">Vencimento {{ dateLabel(line.dueDate) }}</small></div>
              <div class="line-amount"><span>Valor a Receber</span><strong>{{ money(line.amount) }}</strong></div>
            </article>
          </div>
        </section>

        <section class="cb-card boundary" aria-labelledby="decision-boundary-title">
          <v-icon size="30">mdi-shield-check-outline</v-icon>
          <div>
            <h2 id="decision-boundary-title">O que esta aprovação faz</h2>
            <p>Ela congela o fechamento e emite uma obrigação para cada Valor a Receber positivo. Não executa transferência bancária e não decide a destinação da Margem.</p>
          </div>
        </section>

        <section v-if="!decision" class="cb-card action-form" aria-labelledby="prepare-title">
          <div><p class="eyebrow">Preparação</p><h2 id="prepare-title">Criar proposta</h2><p>Os valores vêm do cálculo atual e não podem ser editados nesta etapa.</p></div>
          <v-text-field v-model="defaultDueDate" type="date" label="Vencimento padrão (opcional)" hide-details />
        </section>

        <section v-else-if="decision.status === 'REVIEW'" class="cb-card action-form" aria-labelledby="approval-title">
          <div><p class="eyebrow">Autorização final</p><h2 id="approval-title">Aprovar e emitir obrigações</h2><p>Somente ADMIN ou OWNER elegível pode concluir. O criador não pode aprovar a própria proposta, salvo a exceção restrita de OWNER único validada pelo servidor.</p></div>
          <v-textarea v-if="canApprove" v-model="approvalJustification" label="Justificativa da aprovação" rows="3" :counter="500" />
          <p v-else class="role-note">Seu perfil pode consultar esta proposta, mas não realizar a autorização final.</p>
        </section>

        <section v-if="decision?.status === 'APPROVED'" class="cb-card approved-facts" aria-labelledby="approved-title">
          <v-icon color="success" size="34">mdi-check-decagram-outline</v-icon>
          <div><h2 id="approved-title">Histórico preservado</h2><p>{{ decision.issuedObligationCount }} obrigação(ões) emitida(s). A versão está congelada e não pode ser reescrita.</p></div>
        </section>

        <section class="cb-card margin-boundary" aria-labelledby="margin-boundary-title">
          <p class="eyebrow">Fluxo independente</p>
          <h2 id="margin-boundary-title">Destinação da Margem</h2>
          <p>Retenção, reserva, despesa ou distribuição da Margem pertencem a outra decisão. Esta tela não mistura essa capacidade com o Valor a Receber da Produtividade.</p>
        </section>

        <div class="sticky-action">
          <p>{{ actionHint }}</p>
          <v-btn v-if="!decision" color="primary" size="large" :loading="working" :disabled="blockers.length > 0 || !canWrite" @click="createDecision">Criar proposta</v-btn>
          <v-btn v-else-if="decision.status === 'DRAFT'" color="primary" size="large" :loading="working" :disabled="!canWrite" @click="submitDecision">Enviar para autorização</v-btn>
          <v-btn v-else-if="decision.status === 'REVIEW' && canApprove" color="success" size="large" :loading="working" :disabled="approvalBlockers.length > 0 || !approvalJustification.trim()" @click="approveDecision">Aprovar e emitir obrigações</v-btn>
          <v-btn v-else variant="tonal" size="large" @click="back">Voltar ao painel</v-btn>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'
import FinancialClosingService, { type ClosingParticipant, type ClosingSummary, type FinancialClosing, type PayoutDecision } from '@/services/FinancialClosingService'
import { useUserStore } from '@/plugins/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const closing = ref<FinancialClosing | null>(null)
const summary = ref<ClosingSummary | null>(null)
const participants = ref<ClosingParticipant[]>([])
const decision = ref<PayoutDecision | null>(null)
const loading = ref(true)
const working = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const defaultDueDate = ref('')
const approvalJustification = ref('')
const approvalKey = ref('')
const statusHeading = ref<HTMLElement | null>(null)

const canWrite = computed(() => userStore.canWrite)
const canApprove = computed(() => userStore.isAdmin)
const headerSummary = computed(() => closing.value ? [
  { label: 'Competência', value: `${String(closing.value.periodMonth).padStart(2, '0')}/${closing.value.periodYear}` },
  { label: 'Escopo', value: closing.value.closingKey },
] : [])
const valueReceivable = computed(() => summary.value?.participantPayouts?.reduce((total, item) => total + Number(item.valueReceivableAmount || 0), 0) || 0)
const fixedReserves = computed(() => summary.value?.participantPayouts?.reduce((total, item) => total + Number(item.tmReserveAmount || 0) + Number(item.tiReserveAmount || 0), 0) || 0)
const additionalReserve = computed(() => summary.value?.participantPayouts?.reduce((total, item) => total + Number(item.undistributedAmount || 0), 0) || 0)
const calculatedLines = computed(() => (summary.value?.participantPayouts || []).filter(item => Number(item.valueReceivableAmount) > 0).map(item => ({ participantId: item.participantId, amount: item.valueReceivableAmount, dueDate: defaultDueDate.value || undefined })))
const displayLines = computed(() => decision.value?.lines || calculatedLines.value)
const lineCount = computed(() => displayLines.value.length)
const missingScores = computed(() => (summary.value?.participantPayouts || []).filter(item => Number(item.productivityAmount) > 0 && item.score == null))
const blockers = computed(() => {
  const values: string[] = []
  if (!closing.value?.currentVersion.calculationCurrent) values.push('O cálculo atual precisa ser refeito antes da proposta.')
  if (Math.abs(Number(summary.value?.residualAmount || 0)) >= 0.005) values.push('A memória de cálculo possui residual e precisa ser revisada.')
  if (missingScores.value.length) values.push(`${missingScores.value.length} participante(s) com produtividade positiva ainda não possuem pontuação mensal explícita.`)
  if (!lineCount.value) values.push('Não há Valor a Receber positivo para compor a proposta.')
  return values
})
const approvalBlockers = computed(() => {
  const values = [...blockers.value]
  if (Math.abs(Number(summary.value?.reconciliation?.divergenceAmount || 0)) >= 0.005) values.push('A cobertura das entradas ainda não está integralmente conciliada.')
  return values
})
const visibleBlockers = computed(() => decision.value?.status === 'REVIEW' ? approvalBlockers.value : blockers.value)
const stateTitle = computed(() => decision.value?.status === 'APPROVED' ? 'Decisão aprovada' : decision.value?.status === 'REVIEW' ? 'Proposta em autorização' : decision.value?.status === 'DRAFT' ? 'Proposta preparada' : 'Revise antes de criar a proposta')
const stateDescription = computed(() => decision.value?.status === 'APPROVED' ? 'Os fatos aprovados e as obrigações emitidas são imutáveis.' : decision.value?.status === 'REVIEW' ? 'Os valores estão bloqueados para edição enquanto aguardam autorização final.' : decision.value?.status === 'DRAFT' ? 'Confira participantes, valores e vencimentos antes de enviar.' : 'A proposta copiará somente os Valores a Receber positivos do cálculo atual.')
const statusLabel = computed(() => decision.value?.status === 'APPROVED' ? 'Aprovada' : decision.value?.status === 'REVIEW' ? 'Em autorização' : decision.value?.status === 'DRAFT' ? 'Rascunho' : 'Não criada')
const statusColor = computed(() => decision.value?.status === 'APPROVED' ? 'success' : decision.value?.status === 'REVIEW' ? 'info' : 'warning')
const actionHint = computed(() => decision.value?.status === 'APPROVED' ? 'A aprovação não executou transferência bancária.' : decision.value?.status === 'REVIEW' ? (canApprove.value ? 'A autorização final emitirá as obrigações de forma atômica.' : 'Aguardando ADMIN ou OWNER elegível.') : decision.value?.status === 'DRAFT' ? 'Enviar bloqueia a proposta para revisão.' : 'Criar a proposta ainda não emite obrigação.')
const money = (value?: number | null) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: closing.value?.currency || 'BRL' }).format(Number(value || 0))
const participantName = (id: string) => participants.value.find(item => item.id === id)?.displayName || 'Participante'
const dateLabel = (value: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))

function chooseDecision(items: PayoutDecision[]) {
  return items.find(item => item.status === 'REVIEW') || items.find(item => item.status === 'DRAFT') || items.find(item => item.status === 'APPROVED') || null
}
function resetApprovalKey() {
  approvalKey.value = decision.value ? `closing-payout-approval:${decision.value.id}:${decision.value.revision}:${crypto.randomUUID()}` : ''
}
async function focusState() {
  await nextTick()
  statusHeading.value?.focus()
}
async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const list = (await FinancialClosingService.list()).data
    closing.value = list.find(item => item.id === String(route.params.closingId)) || null
    if (!closing.value) throw new Error('missing closing')
    const [summaryResponse, participantResponse, decisionsResponse] = await Promise.all([
      FinancialClosingService.summary(closing.value),
      FinancialClosingService.participants(closing.value),
      FinancialClosingService.payoutDecisions(closing.value),
    ])
    summary.value = summaryResponse.data
    participants.value = participantResponse.data
    decision.value = chooseDecision(decisionsResponse.data)
    resetApprovalKey()
  } catch {
    errorMessage.value = 'Não foi possível carregar a decisão. Confirme se o cálculo está atual.'
  } finally {
    loading.value = false
  }
}
async function createDecision() {
  if (!closing.value || blockers.value.length || !canWrite.value) return
  working.value = true
  errorMessage.value = ''
  try {
    decision.value = (await FinancialClosingService.createPayoutDecision(closing.value, defaultDueDate.value || undefined)).data
    successMessage.value = 'Proposta criada sem emitir obrigações.'
    resetApprovalKey()
    await focusState()
  } catch {
    errorMessage.value = 'Não foi possível criar a proposta. Atualize o cálculo e confira as pontuações.'
  } finally {
    working.value = false
  }
}
async function submitDecision() {
  if (!closing.value || !decision.value || !canWrite.value) return
  working.value = true
  errorMessage.value = ''
  try {
    decision.value = (await FinancialClosingService.submitPayoutDecision(closing.value, decision.value.id, decision.value.revision)).data
    successMessage.value = 'Proposta enviada para autorização final.'
    resetApprovalKey()
    await focusState()
  } catch {
    errorMessage.value = 'Não foi possível enviar a proposta. O cálculo ou a revisão pode ter mudado.'
  } finally {
    working.value = false
  }
}
async function approveDecision() {
  if (!closing.value || !decision.value || !canApprove.value || approvalBlockers.value.length || !approvalJustification.value.trim()) return
  working.value = true
  errorMessage.value = ''
  try {
    decision.value = (await FinancialClosingService.approvePayoutDecision(closing.value, decision.value.id, decision.value.revision, approvalJustification.value.trim(), approvalKey.value)).data
    successMessage.value = 'Decisão aprovada e obrigações emitidas. Nenhuma transferência bancária foi executada.'
    await focusState()
  } catch {
    errorMessage.value = 'Não foi possível aprovar. Confira a conciliação, a revisão e a segregação de função.'
  } finally {
    working.value = false
  }
}
function back() {
  router.push({ name: 'planning-financial-closings', query: { closingId: closing.value?.id } })
}
watch(() => decision.value?.revision, () => { approvalJustification.value = '' })
onMounted(load)
</script>

<style scoped>
.decision-page{min-height:100vh;background:var(--cb-surface-soft,#f6f7fb);padding-bottom:120px}.narrow{max-width:960px}.back-action{min-height:44px}.announcements{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.decision-state{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:20px}.decision-state h2{margin:3px 0}.decision-state p{color:var(--cb-text-muted,#667085)}.decision-state h2:focus{outline:3px solid var(--cb-primary,#3451b2);outline-offset:4px}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:.72rem}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}.metrics article{display:grid;gap:6px;padding:16px}.metrics strong{font-size:1.25rem}.metrics .primary{border:1px solid var(--cb-primary,#3451b2)}.blockers,.boundary,.approved-facts{display:flex;align-items:flex-start;gap:14px;padding:18px;margin:16px 0}.blockers h2,.boundary h2,.approved-facts h2{font-size:1.1rem;margin:0 0 6px}.blockers ul{margin:8px 0 0;padding-left:20px}.section{margin-top:24px}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:14px;margin-bottom:12px}.section-heading h2{margin:3px 0}.participant-list{display:grid;gap:10px}.participant-line{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px}.participant-line>div:first-child{display:grid}.participant-line small,.line-amount span{color:var(--cb-text-muted,#667085)}.line-amount{display:grid;text-align:right}.action-form,.margin-boundary{display:grid;gap:16px;padding:20px;margin-top:18px}.action-form :deep(.v-input){max-width:560px}.role-note{padding:12px;background:var(--cb-surface-soft,#f6f7fb);border-radius:8px}.sticky-action{position:fixed;z-index:5;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;gap:18px;padding:12px max(20px,env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--cb-surface,#fff) 94%,transparent);border-top:1px solid #ddd}.sticky-action p{margin:0;color:var(--cb-text-muted,#667085)}.sticky-action .v-btn{min-height:48px}@media(max-width:800px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.decision-page{padding-bottom:155px}.decision-state,.participant-line,.section-heading{align-items:flex-start;flex-direction:column}.metrics{grid-template-columns:1fr 1fr}.line-amount{text-align:left}.sticky-action{align-items:stretch;flex-direction:column;gap:6px}.sticky-action .v-btn{width:100%}.action-form,.margin-boundary{padding:16px}}@media(max-width:380px){.metrics{grid-template-columns:1fr}}
</style>
