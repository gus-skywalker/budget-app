<template>
  <div class="cb-page"><div class="cb-container history">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="back">Voltar ao painel</v-btn>
    <div v-if="loading" class="cb-empty-state" role="status"><v-progress-circular indeterminate /><p>Carregando publicação…</p></div>
    <alert-strip v-else-if="error" variant="info" :description="error" />
    <section v-else-if="review && progress" class="cb-card">
      <p class="eyebrow">Histórico de publicação</p><h1>Publicação do lote</h1>
      <v-chip :color="progress.contributingPublication ? 'success' : 'warning'" variant="tonal">{{ progress.contributingPublication ? 'Contribui para a competência' : 'Publicação sem itens' }}</v-chip>
      <p v-if="progress.contributingPublication">Este lote é somente leitura. Seus itens publicados continuam disponíveis para o cálculo da competência.</p>
      <p v-else>Este fato histórico não possui itens publicados e não libera regras ou cálculo. Ele não impede uma nova revisão para as fontes pendentes.</p>
      <dl><div><dt>Fontes selecionadas</dt><dd>{{ review.selectedSourceCount }}</dd></div><div><dt>Itens publicados</dt><dd>{{ progress.publishableItemCount ?? review.sources.reduce((total, source) => total + source.candidateCount, 0) }}</dd></div><div><dt>Estado</dt><dd>{{ review.status }}</dd></div></dl>
      <h2>Fontes deste lote</h2><ul><li v-for="source in review.sources" :key="source.id"><strong>{{ source.sourceKey }}</strong><span>{{ source.candidateCount }} item(ns)</span></li></ul>
      <v-btn color="primary" @click="back">Continuar na competência</v-btn>
    </section>
  </div></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlertStrip from '@/components/AlertStrip.vue'
import FinancialClosingService,{ type WorkbookReview,type WorkbookReviewProgress } from '@/services/FinancialClosingService'
const route=useRoute(),router=useRouter(),review=ref<WorkbookReview|null>(null),progress=ref<WorkbookReviewProgress|null>(null),loading=ref(true),error=ref('')
function back(){router.push({name:'planning-financial-closings',query:{closingId:String(route.params.closingId)}})}
onMounted(async()=>{try{const id=String(route.params.closingId),reviewId=String(route.params.reviewId);[review.value,progress.value]=[(await FinancialClosingService.workbookReview(id,reviewId)).data,(await FinancialClosingService.workbookReviewProgress(id,reviewId)).data]}catch{error.value='Não foi possível consultar este histórico de publicação.'}finally{loading.value=false}})
</script>
<style scoped>
.history{max-width:860px;padding-top:32px}.history h1{margin:8px 0 16px}.history h2{margin-top:26px}.history p{color:var(--cb-text-muted,#667085);max-width:680px}.history dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:24px 0}.history dl div{background:var(--cb-surface-soft,#f6f7fb);padding:14px;border-radius:10px}.history dt{font-size:.78rem;color:var(--cb-text-muted,#667085)}.history dd{margin:6px 0 0;font-weight:700}.history ul{padding:0;list-style:none}.history li{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--cb-border,#e4e7ec)}@media(max-width:700px){.history dl{grid-template-columns:1fr}.history li{gap:12px;flex-direction:column}}
</style>
