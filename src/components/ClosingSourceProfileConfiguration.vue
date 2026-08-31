<template>
  <section class="source-configuration" aria-labelledby="source-configuration-title">
    <div class="source-configuration__heading">
      <div><p class="eyebrow">Configurar fonte</p><h2 id="source-configuration-title">{{ sheet.sheetName }}</h2></div>
      <v-btn variant="text" :disabled="saving" @click="emit('cancel')">Voltar para as fontes</v-btn>
    </div>
    <p>Esta etapa salva a estrutura reutilizável da fonte. O arquivo já selecionado continua somente nesta sessão; nenhuma linha ou valor é importado agora.</p>

    <div v-if="headers.length" class="header-list" aria-label="Cabeçalhos encontrados"><strong>Campos encontrados</strong><span v-for="header in headers" :key="header">{{ header }}</span></div>

    <div class="form-grid">
      <v-text-field v-model="sourceName" label="Nome da fonte" />
      <v-text-field v-model="sourceKey" label="Chave estável da fonte" hint="Será reutilizada nas próximas competências deste workspace." persistent-hint />
      <v-select v-model="decimalSeparator" :items="decimalOptions" label="Separador decimal" />
    </div>

    <section class="mapping-section" aria-labelledby="mapping-title">
      <h3 id="mapping-title">Confirme os campos essenciais</h3>
      <p>As sugestões vêm dos títulos desta aba. Nenhuma posição de coluna é salva ou deduzida.</p>
      <div class="form-grid">
        <v-select v-model="itemKeyColumns" :items="headers" label="Identidade do item" multiple chips />
        <v-select v-model="externalReferenceColumn" :items="optionalHeaders" label="Referência externa" />
        <v-select v-model="amountColumn" :items="headers" label="Valor" />
        <v-select v-model="occurredOnColumn" :items="headers" label="Data de competência" hint="Não há preenchimento automático de data." persistent-hint />
        <v-select v-model="participantColumn" :items="headers" label="Participante ou beneficiário" hint="A revisão posterior permite associar grupos explicitamente." persistent-hint />
      </div>
      <p v-if="mappingWarning" class="warning" role="alert">{{ mappingWarning }}</p>
    </section>

    <details class="advanced"><summary>Formato monetário e referências repetidas</summary>
      <div class="form-grid">
        <v-select v-model="groupingSeparator" :items="groupingOptions" label="Separador de milhar" />
        <v-text-field v-model="currencyPrefix" label="Prefixo monetário esperado" placeholder="Ex.: R$" />
        <v-text-field v-model="currencySuffix" label="Sufixo monetário esperado" />
        <v-checkbox v-model="normalizeCommonSpaces" label="Normalizar espaços comuns" hide-details />
        <v-select v-model="multiplicityPolicy" :items="multiplicityOptions" label="Referências repetidas" />
        <v-text-field v-if="multiplicityPolicy === 'PRESERVE_LEGITIMATE_MULTIPLICITY'" v-model="multiplicityJustification" label="Como as ocorrências foram verificadas?" />
      </div>
    </details>

    <alert-strip v-if="errorMessage" variant="info" :description="errorMessage" />
    <div class="source-configuration__actions"><v-btn color="primary" :disabled="!readyToSave" :loading="saving" @click="save">Salvar fonte e perfil</v-btn></div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AlertStrip from '@/components/AlertStrip.vue'
import FinancialClosingService, { type AssistedImportProfileDetail, type FinancialClosing, type WorkbookSheetInventory } from '@/services/FinancialClosingService'

const props=defineProps<{ closing: FinancialClosing; sheet: WorkbookSheetInventory }>()
const emit=defineEmits<{ saved: [profileId: string]; cancel: [] }>()
const saving=ref(false),errorMessage=ref('')
const sourceKey=ref(props.sheet.suggestedSourceKey),sourceName=ref(props.sheet.sheetName),profileKey=ref(`${props.sheet.suggestedSourceKey}_TABULAR`)
const itemKeyColumns=ref<string[]>([]),externalReferenceColumn=ref(''),amountColumn=ref(''),occurredOnColumn=ref(''),participantColumn=ref('')
const decimalSeparator=ref<'DOT'|'COMMA'>('COMMA'),groupingSeparator=ref<'NONE'|'DOT'|'COMMA'|'SPACE'|'NBSP'>('NONE'),currencyPrefix=ref(''),currencySuffix=ref(''),normalizeCommonSpaces=ref(true),multiplicityPolicy=ref<'REQUIRES_UNIQUE_EXTERNAL_IDENTITY'|'PRESERVE_LEGITIMATE_MULTIPLICITY'>('REQUIRES_UNIQUE_EXTERNAL_IDENTITY'),multiplicityJustification=ref('')
const headers=computed(()=>props.sheet.headers||[]);const optionalHeaders=computed(()=>[{title:'Não existe nesta fonte',value:''},...headers.value.map(header=>({title:header,value:header}))])
const decimalOptions=[{title:'Vírgula (1.234,56)',value:'COMMA'},{title:'Ponto (1,234.56)',value:'DOT'}]
const groupingOptions=[{title:'Sem agrupamento',value:'NONE'},{title:'Ponto',value:'DOT'},{title:'Vírgula',value:'COMMA'},{title:'Espaço',value:'SPACE'}]
const multiplicityOptions=[{title:'Exigir referência externa única',value:'REQUIRES_UNIQUE_EXTERNAL_IDENTITY'},{title:'Preservar ocorrências distintas revisadas',value:'PRESERVE_LEGITIMATE_MULTIPLICITY'}]
const mappingWarning=computed(()=>{if(!itemKeyColumns.value.length||!amountColumn.value||!occurredOnColumn.value||!participantColumn.value)return 'Escolha identidade, valor, data e participante antes de salvar.';if(itemKeyColumns.value.length===1&&!externalReferenceColumn.value)return 'Uma identidade simples exige referência externa explícita.';return ''})
const readyToSave=computed(()=>Boolean(sourceKey.value.trim()&&sourceName.value.trim()&&!mappingWarning.value&&(multiplicityPolicy.value!=='PRESERVE_LEGITIMATE_MULTIPLICITY'||multiplicityJustification.value.trim())))
function applyProfile(profile:AssistedImportProfileDetail){profileKey.value=profile.profileKey;sourceKey.value=profile.sourceKey;const config=profile.config;itemKeyColumns.value=config.itemKeyColumns?.length?[...config.itemKeyColumns]:config.itemKeyColumn?[config.itemKeyColumn]:[];externalReferenceColumn.value=config.externalReferenceColumn||'';amountColumn.value=config.amountColumn||'';occurredOnColumn.value=config.occurredOnColumn||'';participantColumn.value=config.participantColumn||'';decimalSeparator.value=config.decimalSeparator;groupingSeparator.value=config.monetaryFormat?.groupingSeparator||'NONE';currencyPrefix.value=config.monetaryFormat?.currencyPrefix||'';currencySuffix.value=config.monetaryFormat?.currencySuffix||'';normalizeCommonSpaces.value=config.monetaryFormat?.normalizeCommonSpaces!==false;multiplicityPolicy.value=config.multiplicityPolicy||'REQUIRES_UNIQUE_EXTERNAL_IDENTITY';multiplicityJustification.value=config.multiplicityJustification||''}
async function loadExisting(){if(!props.sheet.recommendedProfileId)return;try{applyProfile((await FinancialClosingService.importProfile(props.closing,props.sheet.recommendedProfileId)).data)}catch{errorMessage.value='Não foi possível carregar o perfil atual. Revise os campos antes de salvar uma nova versão.'}}
async function save(){if(!readyToSave.value)return;saving.value=true;errorMessage.value='';try{const normalizedKey=sourceKey.value.trim();const displayName=sourceName.value.trim();await FinancialClosingService.upsertSource(props.closing,normalizedKey,displayName);const profile=await FinancialClosingService.createImportProfile(props.closing,{profileKey:profileKey.value.trim()||`${normalizedKey}_TABULAR`,displayName:`${displayName} · perfil tabular`,sourceKey:normalizedKey,config:{format:'XLSX',expectedSheet:props.sheet.sheetName,itemKeyColumn:itemKeyColumns.value[0],itemKeyColumns:itemKeyColumns.value.length>1?itemKeyColumns.value:undefined,amountColumn:amountColumn.value,occurredOnColumn:occurredOnColumn.value,externalReferenceColumn:externalReferenceColumn.value,participantColumn:participantColumn.value,participantMappings:{},positiveDirection:'ADDITION',negativeAsReversal:true,ignoreTotalsAndFormulas:true,defaultAttributionMethod:'DIRECT_ATTRIBUTION',decimalSeparator:decimalSeparator.value,monetaryFormat:{groupingSeparator:groupingSeparator.value,currencyPrefix:currencyPrefix.value.trim()||undefined,currencySuffix:currencySuffix.value.trim()||undefined,normalizeCommonSpaces:normalizeCommonSpaces.value},headerSignature:headers.value,multiplicityPolicy:multiplicityPolicy.value,multiplicityJustification:multiplicityPolicy.value==='PRESERVE_LEGITIMATE_MULTIPLICITY'?multiplicityJustification.value.trim():undefined}});emit('saved',profile.data.id)}catch{errorMessage.value='Não foi possível salvar a fonte e o perfil. Revise a chave e os campos obrigatórios.'}finally{saving.value=false}}
onMounted(()=>void loadExisting())
</script>

<style scoped>
.source-configuration{display:grid;gap:18px}.source-configuration__heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.source-configuration h2,.source-configuration h3{margin:3px 0 8px}.source-configuration>p,.mapping-section>p{margin:0;color:var(--cb-text-muted,#667085)}.eyebrow{margin:0;text-transform:uppercase;letter-spacing:.08em;font-size:.72rem;color:var(--cb-text-muted,#667085)}.header-list{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:12px;background:#f7f8fb;border-radius:10px}.header-list span{font-size:.8rem;padding:3px 7px;border-radius:999px;background:white}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mapping-section{display:grid;gap:10px;padding-top:14px;border-top:1px solid #e5e7eb}.advanced{padding:12px;border-radius:10px;background:#f7f8fb}.advanced summary{cursor:pointer;font-weight:600}.advanced .form-grid{margin-top:14px}.warning{margin:0;color:#b42318}.source-configuration__actions{display:flex;justify-content:flex-end}@media(max-width:600px){.source-configuration__heading{flex-direction:column}.form-grid{grid-template-columns:1fr}.source-configuration__actions .v-btn{width:100%;min-height:48px}}
</style>
