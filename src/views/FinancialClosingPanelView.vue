<template>
  <div class="cb-page closing-panel">
    <div class="cb-container">
      <page-header title="Apuração de resultados" :summary-items="headerSummary" />

      <alert-strip v-if="errorMessage" variant="info" :description="errorMessage" />
      <div v-if="loading" class="cb-empty-state" role="status"><v-progress-circular indeterminate /><p>Carregando competência…</p></div>
      <div v-else-if="!selectedClosing" class="cb-empty-state">
        <v-icon size="44">mdi-calendar-plus</v-icon><p class="cb-empty-state__title">Comece uma competência</p>
        <p>Crie o período antes de preparar os dados de origem.</p>
        <div class="create-row"><v-select v-model="month" :items="months" label="Mês" /><v-text-field v-model.number="year" label="Ano" type="number" /><v-btn color="primary" :loading="creating" @click="createClosing">Criar competência</v-btn></div>
      </div>
      <template v-else>
        <section class="competence cb-card" aria-label="Competência atual">
          <v-select v-model="selectedId" :items="closingOptions" item-title="title" item-value="value" label="Competência" hide-details />
          <div class="badges"><v-chip size="small" variant="tonal">Versão {{ selectedClosing.currentVersion.versionNumber }}</v-chip><v-chip size="small" :color="selectedClosing.workflowStatus === 'DRAFT' ? 'warning' : 'success'" variant="tonal">{{ selectedClosing.workflowStatus === 'DRAFT' ? 'Em preparação' : selectedClosing.workflowStatus }}</v-chip></div>
        </section>

        <main class="journey-grid" aria-label="Etapas do fechamento">
          <article class="journey-card cb-card" :class="{ active: sourceActive }">
            <div class="step-number">1</div><div><p class="eyebrow">Dados de origem</p><h2>{{ sourceTitle }}</h2><p>{{ sourceDescription }}</p><small v-if="progress">{{ progress.materializedSourceCount }} de {{ progress.selectedSourceCount }} fonte(s) preparada(s)</small></div>
            <v-btn color="primary" class="card-action" @click="openImport">{{ sourceAction }}</v-btn>
          </article>
          <article class="journey-card cb-card" :class="{ active: rulesAvailable }">
            <div class="step-number">2</div><div><p class="eyebrow">Regras do cálculo</p><h2>{{ rulesTitle }}</h2><p>{{ rulesDescription }}</p></div>
            <v-btn class="card-action" variant="tonal" :disabled="!rulesAvailable" @click="openRules">{{ rulesAction }}</v-btn>
          </article>
          <article class="journey-card cb-card" :class="{ active: resultAvailable }">
            <div class="step-number">3</div><div><p class="eyebrow">Resultado</p><h2>{{ resultAvailable ? 'Resultado calculado' : 'Aguardando cálculo' }}</h2><p>Produtividade Bruta, deduções e Produtividade Líquida continuam no cálculo canônico.</p></div>
            <v-btn class="card-action" variant="tonal" :disabled="!rulesAvailable" @click="openResult">{{ resultAvailable ? 'Ver resultado' : 'Calcular resultado' }}</v-btn>
          </article>
          <article class="journey-card cb-card" :class="{ active: decisionAvailable }">
            <div class="step-number">4</div><div><p class="eyebrow">Decisão</p><h2>{{ decisionAvailable ? 'Pronta para decisão' : 'Aguardando resultado atual' }}</h2><p>A aprovação e seus efeitos financeiros permanecem no fluxo já contratado.</p></div>
            <v-btn class="card-action" variant="tonal" :disabled="!decisionAvailable" @click="openLegacy('closing-decision')">Abrir decisão</v-btn>
          </article>
        </main>
        <div class="legacy-link"><v-btn variant="text" prepend-icon="mdi-view-dashboard-outline" @click="openLegacy()">Abrir operação completa anterior</v-btn></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import AlertStrip from '@/components/AlertStrip.vue'
import FinancialClosingService, { type DeductionReadiness, type FinancialClosing, type WorkbookReviewProgress } from '@/services/FinancialClosingService'

const route=useRoute(),router=useRouter();const closings=ref<FinancialClosing[]>([]),selectedId=ref(''),progress=ref<WorkbookReviewProgress|null>(null),deductionReadiness=ref<DeductionReadiness|null>(null),loading=ref(true),creating=ref(false),errorMessage=ref('');const month=ref(new Date().getMonth()+1),year=ref(new Date().getFullYear());
const months=Array.from({length:12},(_,index)=>({title:String(index+1).padStart(2,'0'),value:index+1}));
const selectedClosing=computed(()=>closings.value.find(item=>item.id===selectedId.value)||null);const closingOptions=computed(()=>closings.value.map(item=>({title:`${String(item.periodMonth).padStart(2,'0')}/${item.periodYear} · ${item.closingKey}`,value:item.id})));
const headerSummary=computed(()=>selectedClosing.value?[{label:'Competência',value:`${String(selectedClosing.value.periodMonth).padStart(2,'0')}/${selectedClosing.value.periodYear}`},{label:'Escopo',value:selectedClosing.value.closingKey}]:[]);
const sourceActive=computed(()=>!progress.value||progress.value.status!=='PUBLISHED'),rulesAvailable=computed(()=>progress.value?.status==='PUBLISHED'),resultAvailable=computed(()=>Boolean(selectedClosing.value?.currentVersion.calculationCurrent)),decisionAvailable=computed(()=>resultAvailable.value&&selectedClosing.value?.workflowStatus==='DRAFT');
const sourceTitle=computed(()=>progress.value?.status==='PUBLISHED'?'Lote publicado':progress.value?'Importação em andamento':'Importar workbook');
const sourceDescription=computed(()=>progress.value?.status==='PUBLISHED'?'Os itens publicados já alimentam o fechamento.':'Selecione uma vez o arquivo e prepare as fontes reconhecidas.');
const sourceAction=computed(()=>progress.value?.status==='PUBLISHED'?'Ver publicação':progress.value?'Retomar importação':'Importar workbook');
const rulesTitle=computed(()=>!rulesAvailable.value?'Aguardando dados':deductionReadiness.value?.readyToCalculate?'Regras revisadas':'Revisão necessária');
const rulesDescription=computed(()=>!rulesAvailable.value?'Publique os dados de origem para revisar as incidências.':deductionReadiness.value?.readyToCalculate?'Todas as fontes possuem uma declaração atual.':`${deductionReadiness.value?.blockingSourceKeys.length||0} fonte(s) aguardam revisão.`);
const rulesAction=computed(()=>deductionReadiness.value?.readyToCalculate?'Ver regras':'Revisar regras');
async function load(){loading.value=true;errorMessage.value='';try{closings.value=(await FinancialClosingService.list()).data;const requested=String(route.query.closingId||route.params.closingId||'');selectedId.value=closings.value.some(item=>item.id===requested)?requested:(closings.value[0]?.id||'');await loadProgress()}catch{errorMessage.value='Não foi possível carregar o painel da competência.'}finally{loading.value=false}}
async function loadProgress(){const closing=selectedClosing.value;if(!closing){progress.value=null;deductionReadiness.value=null;return}try{const response=await FinancialClosingService.latestWorkbookReview(closing);progress.value=response.status===204?null:(response.data||null)}catch{progress.value=null}if(progress.value?.status==='PUBLISHED'){try{deductionReadiness.value=(await FinancialClosingService.deductionReadiness(closing)).data}catch{deductionReadiness.value=null}}else deductionReadiness.value=null}
async function createClosing(){creating.value=true;try{const created=(await FinancialClosingService.createOrGet(month.value,year.value,'DEFAULT','BRL')).data;await load();selectedId.value=created.id}catch{errorMessage.value='Não foi possível criar a competência.'}finally{creating.value=false}}
function openImport(){const closing=selectedClosing.value;if(!closing)return;router.push({name:'closing-import-wizard',params:{closingId:closing.id,reviewId:progress.value?.id||'nova'}})}
function openRules(){const closing=selectedClosing.value;if(closing)router.push({name:'closing-rules',params:{closingId:closing.id}})}
function openResult(){const closing=selectedClosing.value;if(closing)router.push({name:'closing-result',params:{closingId:closing.id}})}
function openLegacy(anchor=''){const closing=selectedClosing.value;if(!closing)return;router.push({name:'planning-financial-closings-legacy',query:{closingId:closing.id},hash:anchor?`#${anchor}`:''})}
watch(selectedId,loadProgress);onMounted(load)
</script>

<style scoped>
.closing-panel{min-height:100vh;background:var(--cb-surface-soft,#f6f7fb)}.competence{display:flex;align-items:center;gap:18px;padding:16px;margin-bottom:18px}.competence :deep(.v-input){max-width:440px}.badges{display:flex;gap:8px;flex-wrap:wrap}.journey-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.journey-card{display:grid;grid-template-columns:auto 1fr;gap:14px;padding:20px;opacity:.72}.journey-card.active{opacity:1;border:1px solid color-mix(in srgb,var(--cb-primary,#3451b2) 35%,transparent)}.journey-card h2{font-size:1.2rem;margin:3px 0 8px}.journey-card p{color:var(--cb-text-muted,#667085);margin:0}.journey-card small{display:block;margin-top:10px}.step-number{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--cb-primary,#3451b2);color:white;font-weight:700}.card-action{grid-column:2;justify-self:start;margin-top:6px}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:.72rem}.legacy-link{display:flex;justify-content:flex-end;margin-top:12px}.create-row{display:grid;grid-template-columns:1fr 1fr auto;align-items:start;gap:12px;max-width:680px;width:100%}@media(max-width:700px){.competence{align-items:stretch;flex-direction:column}.competence :deep(.v-input){max-width:none}.journey-grid{grid-template-columns:1fr}.journey-card{grid-template-columns:auto 1fr;padding:16px}.card-action{grid-column:1/-1;width:100%;min-height:48px}.create-row{grid-template-columns:1fr}.legacy-link .v-btn{width:100%}}
</style>
