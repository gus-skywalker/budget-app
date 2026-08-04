<template>
  <div class="cb-page closing-page">
    <div class="cb-container">
      <page-header title="Produtividade Líquida" :summary-items="headerSummary">
        <template #actions>
          <v-btn variant="tonal" prepend-icon="mdi-calculator-variant" :loading="calculating" :disabled="!selectedClosing || !canCalculate" @click="calculate">
            Recalcular
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-send-outline" disabled>Enviar para decisão</v-btn>
        </template>
      </page-header>

      <section class="closing-toolbar cb-card">
        <v-select v-model="selectedId" :items="closingOptions" item-title="title" item-value="value" label="Competência e escopo" hide-details />
        <div v-if="selectedClosing" class="closing-toolbar__badges">
          <v-chip size="small" color="info" variant="tonal">Versão {{ selectedClosing.currentVersion.versionNumber }}</v-chip>
          <v-chip size="small" :color="selectedClosing.workflowStatus === 'DRAFT' ? 'warning' : 'success'" variant="tonal">{{ workflowLabel }}</v-chip>
          <v-chip v-if="!selectedClosing.currentVersion.calculationCurrent" size="small" color="error" variant="tonal">Cálculo obsoleto</v-chip>
        </div>
      </section>

      <alert-strip v-if="errorMessage" variant="info" :description="errorMessage" />
      <div v-if="loading" class="cb-empty-state"><v-progress-circular indeterminate /><p>Carregando apuração…</p></div>
      <div v-else-if="!selectedClosing" class="cb-empty-state">
        <v-icon size="44">mdi-table-large</v-icon><p class="cb-empty-state__title">Nenhuma apuração encontrada</p>
        <p>Crie a competência pelo contrato de importação para visualizar a matriz.</p>
      </div>

      <template v-else-if="summary && matrix">
        <section class="closing-kpis">
          <article class="cb-card metric"><span>Total bruto</span><strong>{{ money(summary.grossAmount) }}</strong></article>
          <article class="cb-card metric"><span>Deduções e retenções</span><strong class="negative">{{ money(summary.deductionAmount) }}</strong></article>
          <article class="cb-card metric"><span>Ajustes do fechamento</span><strong>{{ signedMoney(summary.closingAdjustmentAmount) }}</strong></article>
          <article class="cb-card metric metric--primary"><span>Produtividade Líquida</span><strong>{{ money(summary.productivityAmount) }}</strong></article>
          <article class="cb-card metric metric--pool"><span>Margem de Contribuição</span><strong>{{ money(summary.undistributedPoolAmount) }}</strong><small>Pool sem destinação</small></article>
          <article class="cb-card metric"><span>Receita líquida apurada</span><strong>{{ money(summary.netRevenueAmount) }}</strong></article>
        </section>

        <section class="cb-card matrix-card">
          <div class="section-heading"><div><p class="eyebrow">Participante × origem</p><h2>Composição da Produtividade Líquida</h2></div><span>Valores em {{ selectedClosing.currency }}</span></div>
          <div class="matrix-scroll">
            <table class="closing-matrix">
              <thead><tr><th>Participante</th><th v-for="source in matrix.sources" :key="source.id">{{ source.displayName }}</th><th>Total líquido</th></tr></thead>
              <tbody>
                <tr v-for="row in matrix.rows" :key="row.participant.id">
                  <th>{{ row.participant.displayName }}</th>
                  <td v-for="source in matrix.sources" :key="source.id">
                    <button class="cell-button" :disabled="!row.values[source.id]" @click="openDrillDown(row, source)">{{ money(row.values[source.id] || 0) }}</button>
                  </td>
                  <td class="row-total">{{ money(row.total) }}</td>
                </tr>
              </tbody>
              <tfoot><tr><th>Total por origem</th><td v-for="source in matrix.sources" :key="source.id">{{ money(matrix.sourceTotals[source.id] || 0) }}</td><td>{{ money(matrix.productivityTotal) }}</td></tr></tfoot>
            </table>
          </div>
          <p class="matrix-hint"><v-icon size="16">mdi-cursor-default-click-outline</v-icon> Selecione um valor para conferir os itens que formam a célula.</p>
        </section>

        <section class="closing-lower-grid">
          <article class="cb-card reconciliation-card">
            <div class="section-heading"><div><p class="eyebrow">Conciliação de entrada</p><h2>Cobertura bancária</h2></div><strong>{{ summary.reconciliation.coveragePercentage.toFixed(1) }}%</strong></div>
            <v-progress-linear :model-value="summary.reconciliation.coveragePercentage" color="primary" height="8" rounded />
            <dl><div><dt>Entrada esperada</dt><dd>{{ money(summary.reconciliation.expectedInflowAmount) }}</dd></div><div><dt>Entrada encontrada</dt><dd>{{ money(summary.reconciliation.reconciledInflowAmount) }}</dd></div><div><dt>Divergência</dt><dd>{{ money(summary.reconciliation.divergenceAmount) }}</dd></div><div><dt>Itens não conciliados</dt><dd>{{ summary.reconciliation.unreconciledItemCount }}</dd></div></dl>
            <p>A conciliação confirma recebimentos e não altera a titularidade dos valores.</p>
          </article>
          <article class="cb-card memory-card">
            <div class="section-heading"><div><p class="eyebrow">Explicabilidade</p><h2>Memória de cálculo</h2></div><v-btn variant="text" :loading="loadingMemory" @click="toggleMemory">{{ memory ? 'Ocultar' : 'Consultar' }}</v-btn></div>
            <p>Política {{ summary.calculationPolicyVersion }} · {{ summary.roundingMode }} · escala intermediária {{ summary.intermediateScale }}</p>
            <div v-if="memory" class="memory-list"><details v-for="item in memory.items" :key="item.itemId"><summary>{{ item.clientItemKey }}</summary><pre>{{ prettyMemory(item.memory) }}</pre></details></div>
            <div class="residual"><span>Residual explícito</span><strong>{{ money(summary.residualAmount) }}</strong></div>
          </article>
        </section>
        <section class="cb-card obligations-card">
          <div class="section-heading"><div><p class="eyebrow">Settlement operacional</p><h2>Obrigações emitidas</h2></div><v-select v-model="obligationDomain" :items="[{ title: 'Todos os domínios', value: 'ALL' }, { title: 'Produtividade', value: 'PRODUCTIVITY' }, { title: 'Margem', value: 'MARGIN' }]" density="compact" hide-details /></div>
          <div v-if="loadingObligations" class="cb-empty-state"><v-progress-circular indeterminate size="24" /></div>
          <p v-else-if="!filteredObligations.length" class="matrix-hint">Nenhuma obrigação emitida para os filtros selecionados.</p>
          <div v-else class="matrix-scroll"><table class="closing-matrix"><thead><tr><th>Domínio</th><th>Principal</th><th>Pago em dinheiro</th><th>Crédito</th><th>Saldo aberto</th><th>Dinheiro</th><th>Resolução</th></tr></thead><tbody><tr v-for="item in filteredObligations" :key="item.id"><th>{{ item.domain === 'PRODUCTIVITY' ? 'Produtividade' : 'Margem' }}</th><td>{{ money(item.principalAmount) }}</td><td>{{ money(item.cashPaidAmount) }}</td><td>{{ money(item.creditedAmount) }}</td><td>{{ money(item.openAmount) }}</td><td><v-chip size="x-small" variant="tonal">{{ statusLabel(item.cashSettlementStatus) }}</v-chip></td><td><v-chip size="x-small" :color="item.resolutionStatus === 'SETTLED' ? 'success' : undefined" variant="tonal">{{ statusLabel(item.resolutionStatus) }}</v-chip></td></tr></tbody></table></div>
          <p class="matrix-hint">Consulta somente. Registrar fatos internos não executa transferência bancária.</p>
        </section>
      </template>
    </div>

    <v-dialog v-model="drillOpen" max-width="860">
      <v-card><v-card-title>{{ drillTitle }}</v-card-title><v-card-subtitle v-if="drill">Bruto {{ money(drill.grossAmount) }} · Deduções {{ money(drill.deductionAmount) }} · Ajustes {{ signedMoney(drill.adjustmentAmount) }} · Líquido {{ money(drill.netAmount) }}</v-card-subtitle>
        <v-card-text><v-progress-linear v-if="loadingDrill" indeterminate /><div v-else-if="drill" class="drill-list"><article v-for="item in drill.items" :key="item.itemId"><div><strong>{{ item.financialLabel || item.clientItemKey }}</strong><small>{{ item.occurredOn || 'Data não informada' }}</small></div><div><span>{{ money(item.signedGrossAmount) }}</span><span>− {{ money(item.deductionAmount) }}</span><strong>{{ money(item.netAmount) }}</strong></div></article></div></v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="drillOpen = false">Fechar</v-btn></v-card-actions></v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import FinancialClosingService, { type CalculationMemory, type ClosingMatrix, type ClosingSource, type ClosingSummary, type DrillDown, type FinancialClosing, type MatrixRow, type OperationalObligation } from '@/services/FinancialClosingService'
import { useUserStore } from '@/plugins/userStore'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'

const userStore = useUserStore()
const closings = ref<FinancialClosing[]>([]); const selectedId = ref(''); const summary = ref<ClosingSummary | null>(null); const matrix = ref<ClosingMatrix | null>(null)
const memory = ref<CalculationMemory | null>(null); const drill = ref<DrillDown | null>(null); const drillOpen = ref(false)
const obligations = ref<OperationalObligation[]>([]); const loadingObligations = ref(false); const obligationDomain = ref('ALL')
const loading = ref(true); const calculating = ref(false); const loadingMemory = ref(false); const loadingDrill = ref(false); const errorMessage = ref(''); const drillTitle = ref('Detalhamento')
const selectedClosing = computed(() => closings.value.find(item => item.id === selectedId.value) || null)
const closingOptions = computed(() => closings.value.map(item => ({ value: item.id, title: `${String(item.periodMonth).padStart(2, '0')}/${item.periodYear} · ${item.closingKey}` })))
const workflowLabel = computed(() => ({ DRAFT: 'Rascunho', REVIEW: 'Em revisão', APPROVED: 'Aprovado', CANCELLED: 'Cancelado' }[selectedClosing.value?.workflowStatus || 'DRAFT']))
const canCalculate = computed(() => userStore.canWrite && selectedClosing.value?.workflowStatus === 'DRAFT' && selectedClosing.value.currentVersion.versionStatus === 'EDITABLE')
const headerSummary = computed(() => summary.value ? [{ label: 'Produtividade Líquida', value: money(summary.value.productivityAmount) }, { label: 'Margem separada', value: money(summary.value.undistributedPoolAmount) }, { label: 'Receita líquida', value: money(summary.value.netRevenueAmount) }] : [])
const filteredObligations = computed(() => obligations.value.filter(item => obligationDomain.value === 'ALL' || item.domain === obligationDomain.value))
const money = (value: number | undefined) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: selectedClosing.value?.currency || 'BRL' }).format(Number(value || 0))
const signedMoney = (value: number) => `${value > 0 ? '+' : ''}${money(value)}`

async function loadClosings() { loading.value = true; errorMessage.value = ''; try { const { data } = await FinancialClosingService.list(); closings.value = data; if (!selectedId.value && data.length) selectedId.value = data[0].id; if (!data.length) loading.value = false } catch { errorMessage.value = 'Não foi possível carregar as apurações.'; loading.value = false } }
async function loadResult() { const closing = selectedClosing.value; if (!closing) return; loading.value = true; memory.value = null; errorMessage.value = ''; try { const [summaryResponse, matrixResponse] = await Promise.all([FinancialClosingService.summary(closing), FinancialClosingService.matrix(closing)]); summary.value = summaryResponse.data; matrix.value = matrixResponse.data } catch (error: any) { summary.value = null; matrix.value = null; errorMessage.value = error?.response?.status === 409 ? 'Os dados mudaram e o cálculo precisa ser refeito.' : 'Não foi possível carregar o resultado da apuração.' } finally { loading.value = false } }
async function loadObligations() { loadingObligations.value = true; try { obligations.value = (await FinancialClosingService.obligations()).data } catch { obligations.value = [] } finally { loadingObligations.value = false } }
async function calculate() { const closing = selectedClosing.value; if (!closing) return; calculating.value = true; try { await FinancialClosingService.calculate(closing); await loadClosings(); selectedId.value = closing.id; await loadResult() } catch { errorMessage.value = 'Não foi possível recalcular a apuração.' } finally { calculating.value = false } }
async function toggleMemory() { if (memory.value) { memory.value = null; return } const closing = selectedClosing.value; if (!closing) return; loadingMemory.value = true; try { memory.value = (await FinancialClosingService.memory(closing)).data } finally { loadingMemory.value = false } }
async function openDrillDown(row: MatrixRow, source: ClosingSource) { const closing = selectedClosing.value; if (!closing) return; drillTitle.value = `${row.participant.displayName} · ${source.displayName}`; drillOpen.value = true; loadingDrill.value = true; drill.value = null; try { drill.value = (await FinancialClosingService.drillDown(closing, row.participant.id, source.id)).data } finally { loadingDrill.value = false } }
function prettyMemory(raw: string) { try { return JSON.stringify(JSON.parse(raw), null, 2) } catch { return raw } }
function statusLabel(status: string) { return ({ OPEN: 'Aberto', PARTIAL: 'Parcial', PAID: 'Pago em dinheiro', SETTLED: 'Resolvido por crédito', NOT_APPLICABLE: 'Não aplicável' } as Record<string,string>)[status] || status }
watch(selectedId, () => loadResult()); onMounted(async () => { await loadClosings(); await loadObligations() })
</script>

<style scoped>
.closing-page{background:var(--cb-surface-soft,#f6f7fb);min-height:100vh}.closing-toolbar{display:flex;align-items:center;gap:20px;padding:16px;margin-bottom:18px}.closing-toolbar :deep(.v-input){max-width:420px}.closing-toolbar__badges{display:flex;gap:8px;flex-wrap:wrap}.closing-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:18px}.metric{padding:18px;display:flex;flex-direction:column;gap:5px;border-left:4px solid transparent}.metric span,.metric small{color:var(--cb-text-muted,#667085)}.metric strong{font-size:1.45rem}.metric .negative{color:var(--cb-negative,#b42318)}.metric--primary{border-left-color:var(--cb-primary,#3451b2)}.metric--pool{border-left-color:#b7791f;background:#fffaf0}.matrix-card,.reconciliation-card,.memory-card{padding:20px}.section-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.section-heading h2{font-size:1.12rem;margin:2px 0}.eyebrow{margin:0;text-transform:uppercase;letter-spacing:.08em;font-size:.72rem;color:var(--cb-text-muted,#667085)}.matrix-scroll{overflow:auto}.closing-matrix{width:100%;border-collapse:separate;border-spacing:0;min-width:900px}.closing-matrix th,.closing-matrix td{padding:11px 12px;border-bottom:1px solid #e7e9ef;text-align:right;white-space:nowrap}.closing-matrix th:first-child{text-align:left;position:sticky;left:0;background:white;z-index:1}.closing-matrix thead th,.closing-matrix tfoot th,.closing-matrix tfoot td{font-weight:700;background:#f7f8fb}.cell-button{font:inherit;border:0;background:none;color:var(--cb-primary,#3451b2);cursor:pointer}.cell-button:disabled{color:inherit;cursor:default}.row-total{font-weight:700}.matrix-hint{color:var(--cb-text-muted,#667085);font-size:.86rem;margin:12px 0 0}.closing-lower-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.reconciliation-card dl{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.reconciliation-card dl div{display:flex;justify-content:space-between;gap:12px}.reconciliation-card dt{color:var(--cb-text-muted,#667085)}.reconciliation-card dd{font-weight:700;margin:0}.reconciliation-card>p,.memory-card>p{color:var(--cb-text-muted,#667085);font-size:.88rem}.memory-list{max-height:300px;overflow:auto}.memory-list details{border-top:1px solid #e7e9ef;padding:10px 0}.memory-list pre{white-space:pre-wrap;font-size:.72rem;background:#f7f8fb;padding:10px}.residual{display:flex;justify-content:space-between;border-top:1px solid #e7e9ef;margin-top:16px;padding-top:16px}.drill-list article{display:flex;justify-content:space-between;gap:18px;padding:14px 0;border-bottom:1px solid #e7e9ef}.drill-list article>div{display:flex;gap:16px}.drill-list article>div:first-child{flex-direction:column;gap:2px}.drill-list small{color:var(--cb-text-muted,#667085)}
@media(max-width:900px){.closing-kpis{grid-template-columns:1fr 1fr}.closing-lower-grid{grid-template-columns:1fr}.closing-toolbar{align-items:stretch;flex-direction:column}.closing-toolbar :deep(.v-input){max-width:none}}
@media(max-width:600px){.closing-kpis{grid-template-columns:1fr}.metric{padding:14px}.section-heading{flex-direction:column}.drill-list article,.drill-list article>div{flex-direction:column}.drill-list article>div:last-child{gap:8px}}
</style>
