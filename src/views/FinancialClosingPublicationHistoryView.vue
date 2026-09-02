<template>
  <div class="cb-page"><div class="cb-container history">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="back">Voltar ao painel</v-btn>
    <div v-if="loading" class="cb-empty-state" role="status"><v-progress-circular indeterminate /><p>Carregando lote da base…</p></div>
    <alert-strip v-else-if="error" variant="info" :description="error" />
    <section v-else-if="review && progress" class="cb-card">
      <p class="eyebrow">Gestão da base editável</p><h1>{{ selectedSourceKey ? `Fonte ${selectedSourceKey}` : 'Lote materializado' }}</h1>
      <v-chip :color="progress.contributingPublication ? 'success' : 'warning'" variant="tonal">{{ progress.contributingPublication ? 'Contribui para a competência' : 'Lote sem itens ativos' }}</v-chip>
      <p v-if="progress.contributingPublication">{{ selectedSourceKey ? 'Este é o detalhe de uma fonte da base editável. As demais fontes do lote permanecem independentes desta ação.' : 'Este é o detalhe de um único lote. Enquanto a publicação financeira não foi confirmada, ele ainda pode ser retirado da competência e seu histórico será preservado.' }}</p>
      <p v-else>Este fato histórico não possui itens ativos na base e não libera regras ou cálculo. Ele não impede uma nova revisão para as fontes pendentes.</p>
      <dl><div><dt>{{ selectedSourceKey ? 'Fonte selecionada' : 'Fontes neste lote' }}</dt><dd>{{ selectedSourceKey || review.selectedSourceCount }}</dd></div><div><dt>Fontes ativas na competência</dt><dd>{{ publishedCompetenceSources.length }}</dd></div><div><dt>{{ selectedSourceKey ? 'Itens desta fonte' : 'Itens deste lote' }}</dt><dd>{{ displayedItemCount }}</dd></div></dl>
      <h2>{{ selectedSourceKey ? 'Conteúdo desta fonte' : 'Fontes deste lote' }}</h2><ul><li v-for="source in displayedReviewSources" :key="source.id"><strong>{{ source.sourceKey }}</strong><span>{{ source.candidateCount }} item(ns)</span></li></ul>
      <section v-if="otherPublishedCompetenceSources.length" class="competence-sources"><h2>Outras fontes na base de cálculo</h2><p>Elas participam do cálculo, mas não pertencem a este lote.</p><ul><li v-for="source in otherPublishedCompetenceSources" :key="source.sourceId"><strong>{{ source.displayName }}</strong><span>Na base de cálculo</span></li></ul></section>
      <div class="actions"><v-btn color="primary" @click="back">Voltar às fontes da competência</v-btn><v-btn variant="tonal" @click="openRules">{{ selectedSourceKey ? 'Configurar regras desta fonte' : 'Escolher fonte para regras' }}</v-btn><v-btn v-if="canCancelMaterialization" color="error" variant="tonal" :loading="cancelling" @click="cancelMaterialization">{{ selectedSourceKey ? 'Retirar esta fonte da base' : 'Retirar este lote da competência' }}</v-btn></div>
    </section>
  </div></div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlertStrip from '@/components/AlertStrip.vue'
import FinancialClosingService,{ type FinancialClosing,type ImportReadiness,type WorkbookReview,type WorkbookReviewProgress } from '@/services/FinancialClosingService'
const route=useRoute(),router=useRouter(),closing=ref<FinancialClosing|null>(null),review=ref<WorkbookReview|null>(null),progress=ref<WorkbookReviewProgress|null>(null),readiness=ref<ImportReadiness|null>(null),loading=ref(true),cancelling=ref(false),error=ref('')
const publishedCompetenceSources=computed(()=>readiness.value?.sources.filter(source=>(source.sourceStatus||source.status||'').endsWith('_PUBLISHED')||source.status==='IMPORTED')||[])
const selectedSourceKey=computed(()=>readiness.value?.sources.find(source=>source.sourceId===String(route.query.sourceId||''))?.sourceKey||'')
const displayedReviewSources=computed(()=>selectedSourceKey.value?review.value?.sources.filter(source=>source.sourceKey===selectedSourceKey.value)||[]:review.value?.sources||[])
const displayedItemCount=computed(()=>selectedSourceKey.value?displayedReviewSources.value.reduce((total,source)=>total+source.candidateCount,0):progress.value?.publishableItemCount??review.value?.sources.reduce((total,source)=>total+source.candidateCount,0)??0)
const otherPublishedCompetenceSources=computed(()=>publishedCompetenceSources.value.filter(source=>!review.value?.sources.some(item=>item.sourceKey===source.sourceKey)))
const canCancelMaterialization=computed(()=>Boolean(progress.value?.contributingPublication&&!closing.value?.currentVersion.financialPublicationCurrent))
function back(){router.push({name:'planning-financial-closings',query:{closingId:String(route.params.closingId)}})}
function openRules(){router.push({name:'closing-rules',params:{closingId:String(route.params.closingId)},query:selectedSourceKey.value?{sourceId:String(route.query.sourceId)}:undefined})}
async function cancelMaterialization(){if(!closing.value||!review.value)return;const source=selectedSourceKey.value?displayedReviewSources.value[0]:null;const message=source?`Retirar somente ${source.sourceKey} da base editável? As outras fontes deste lote serão preservadas.`:'Retirar este lote da competência? O histórico será preservado, mas seus itens deixarão de compor o próximo cálculo.';if(!window.confirm(message))return;cancelling.value=true;try{if(source)await FinancialClosingService.cancelWorkbookSourceMaterialization(closing.value.id,review.value.id,source.id);else await FinancialClosingService.cancelWorkbookMaterialization(closing.value.id,review.value.id);back()}catch{error.value=source?'Não foi possível retirar esta fonte. Atualize a competência e tente novamente.':'Não foi possível retirar este lote. Atualize a competência e tente novamente.'}finally{cancelling.value=false}}
onMounted(async()=>{try{const id=String(route.params.closingId),reviewId=String(route.params.reviewId);const closings=(await FinancialClosingService.list()).data;closing.value=closings.find(item=>item.id===id)||null;if(!closing.value)throw new Error('closing not found');[review.value,progress.value,readiness.value]=[(await FinancialClosingService.workbookReview(id,reviewId)).data,(await FinancialClosingService.workbookReviewProgress(id,reviewId)).data,(await FinancialClosingService.importReadiness(closing.value)).data]}catch{error.value='Não foi possível consultar este lote da base.'}finally{loading.value=false}})
</script>
<style scoped>
.history{max-width:860px;padding-top:32px}.history h1{margin:8px 0 16px}.history h2{margin-top:26px}.history p{color:var(--cb-text-muted,#667085);max-width:680px}.history dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:24px 0}.history dl div{background:var(--cb-surface-soft,#f6f7fb);padding:14px;border-radius:10px}.history dt{font-size:.78rem;color:var(--cb-text-muted,#667085)}.history dd{margin:6px 0 0;font-weight:700}.history ul{padding:0;list-style:none}.history li{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--cb-border,#e4e7ec)}.competence-sources{margin-top:24px}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}@media(max-width:700px){.history dl{grid-template-columns:1fr}.history li{gap:12px;flex-direction:column}.actions .v-btn{width:100%;min-height:48px}}
</style>
