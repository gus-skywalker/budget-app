import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import GuidedTabularImportReview from '@/components/GuidedTabularImportReview.vue'

const { serviceMock }=vi.hoisted(()=>({serviceMock:{startGuidedImportReview:vi.fn(),saveGuidedReviewDecision:vi.fn(),confirmGuidedImportReview:vi.fn()}}))
vi.mock('@/services/FinancialClosingService',()=>({default:serviceMock}))
class ResizeObserverMock{observe(){} unobserve(){} disconnect(){}}
globalThis.ResizeObserver=ResizeObserverMock as any
const vuetify=createVuetify({components,directives})
const flush=async()=>{await Promise.resolve();await new Promise(resolve=>setTimeout(resolve,0));await Promise.resolve()}
const closing:any={id:'closing-1',workspaceId:'workspace-1',closingKey:'DEFAULT',periodMonth:8,periodYear:2026,currency:'BRL',workflowStatus:'DRAFT',settlementStatus:'NOT_ISSUED',currentVersion:{id:'version-1',versionNumber:1,versionStatus:'EDITABLE',inputRevision:1,calculatedRevision:null,calculationCurrent:false}}
const review={reviewId:'review-1',reviewSourceId:'review-source-1',status:'OPEN',revision:0,detailed:true,readyForConfirmation:false,alreadyConfirmed:false,summary:{rowsRead:4,structurallyIgnored:1,importableRows:4,correctedRows:0,excludedRows:0,participantGroups:2,participantOccurrences:4,repetitionGroups:1,repetitionOccurrences:2,importableTotal:170},participants:[{decisionKey:'P-1',sourceLabel:'ANA DEMO',occurrenceCount:3,suggestions:[{participantId:'participant-1',displayName:'Ana Demo',confidence:100}],resolution:'PENDING',participantId:null,blocking:true},{decisionKey:'P-2',sourceLabel:'BRUNO DEMO',occurrenceCount:1,suggestions:[],resolution:'PENDING',participantId:null,blocking:true}],repetitions:[{decisionKey:'M-1',occurrenceCount:2,aggregateAmount:150}],pendingRows:[{decisionKey:'R-1',rowNumber:4,issueType:'AMOUNT_NOT_INTERPRETABLE',resolution:'PENDING',canCorrect:true,canExclude:true},{decisionKey:'R-2',rowNumber:5,issueType:'MISSING_DATE',resolution:'PENDING',canCorrect:true,canExclude:true}],dateAlternatives:[],repetitionsAccepted:false,repetitionReasonCode:null,blockingReasons:['Há pendências de valor, data ou identidade que precisam ser resolvidas']}

describe('GuidedTabularImportReview',()=>{
  beforeEach(()=>{vi.clearAllMocks();serviceMock.startGuidedImportReview.mockResolvedValue({data:structuredClone(review)});serviceMock.saveGuidedReviewDecision.mockResolvedValue({data:{reviewId:'review-1',revision:1,replayed:false}});serviceMock.confirmGuidedImportReview.mockResolvedValue({data:{id:'import-1',batchId:'batch-1',batchKey:'guided',rowCount:4,additionTotal:170,reversalTotal:0,replayed:false}})})
  it('separates participant groups from occurrences and never applies a suggestion automatically',async()=>{
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[{id:'participant-1',participantKey:'ANA',displayName:'Ana Demo',active:true}]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    expect(wrapper.text()).toContain('esta coluna identifica o participante')
    ;(wrapper.vm as any).participantColumnConfirmed=true;await flush()
    expect(wrapper.text()).toContain('2 grupo(s)')
    expect(wrapper.text()).toContain('4 ocorrência(s)')
    expect(wrapper.text()).toContain('Sugestões para sua revisão')
    expect(serviceMock.saveGuidedReviewDecision).not.toHaveBeenCalled()
    await (wrapper.vm as any).linkParticipant('P-1','participant-1')
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledWith(closing,'review-1',expect.objectContaining({reviewSourceId:'review-source-1',action:'LINK_PARTICIPANT',participantId:'participant-1'}))
  })

  it('shows the current association and makes a later change explicit',async()=>{
    const associated=structuredClone(review)
    associated.participants[0]={...associated.participants[0],resolution:'LINK_PARTICIPANT',participantId:'participant-1',blocking:false} as any
    serviceMock.startGuidedImportReview.mockResolvedValue({data:associated})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[{id:'participant-1',participantKey:'ANA',displayName:'Ana Demo',active:true}]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();(wrapper.vm as any).participantColumnConfirmed=true;await flush()
    expect(wrapper.text()).toContain('Associado a Ana Demo')
    expect(wrapper.text()).toContain('Alterar associação')
    expect((wrapper.vm as any).participantSelections['P-1']).toBe('participant-1')
  })

  it('uses business language for repetitions and keeps one explicit final confirmation',async()=>{
    const ready={...structuredClone(review),status:'READY',readyForConfirmation:true,blockingReasons:[],participants:[],pendingRows:[],repetitionsAccepted:true,summary:{...review.summary,correctedRows:1,excludedRows:1}}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:ready})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    expect(wrapper.text()).toContain('Revisar referências repetidas')
    expect(wrapper.text()).not.toContain('multiplicidade')
    expect(wrapper.text()).not.toContain('idempotência')
    expect(wrapper.text()).toContain('Confirmo o efeito financeiro')
    ;(wrapper.vm as any).financialConfirmation=true
    await (wrapper.vm as any).confirmReview()
    expect(serviceMock.confirmGuidedImportReview).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('confirmed')).toHaveLength(1)
  })

  it('prepares a source for workbook staging without exposing the legacy per-source financial confirmation',async()=>{
    const ready={...structuredClone(review),status:'READY',readyForConfirmation:true,blockingReasons:[],participants:[],pendingRows:[],repetitions:[],repetitionsAccepted:true}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:ready})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[],autoStart:true,preparationOnly:true},global:{plugins:[vuetify]}})
    await flush()
    expect(wrapper.text()).toContain('Fonte pronta para o lote')
    expect(wrapper.text()).toContain('confirmação financeira será única')
    expect(wrapper.text()).not.toContain('Confirmo o efeito financeiro')
    expect(wrapper.emitted('prepared')).toHaveLength(1)
    expect(serviceMock.confirmGuidedImportReview).not.toHaveBeenCalled()
  })

  it('treats the detected monetary format as a transient choice until the user explicitly saves it',async()=>{
    const monetaryReview={...structuredClone(review),participants:[],repetitions:[],pendingRows:[],dateAlternatives:[],monetaryFormat:{decisionKey:'F-1',decimalSeparator:'COMMA',format:{groupingSeparator:'DOT',currencyPrefix:'R$',currencySuffix:null,normalizeCommonSpaces:true},confidence:'HIGH',observedValues:10,nativeNumericValues:0,textualValues:10,acceptedValues:10,rejectedValues:0,reasonCodes:['TEXT_FORMAT_HIGH_COVERAGE'],nativeNumericCanonical:false,requiresDecision:true,selected:false,savedAsProfile:false},blockingReasons:['Confirme o formato monetário sugerido antes de revisar as demais pendências']}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:monetaryReview})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    expect(wrapper.text()).toContain('Conferir o formato dos valores')
    expect(wrapper.text()).toContain('Confiança alta')
    expect(wrapper.text()).toContain('10 de 10 valor(es) reconhecido(s)')
    expect(wrapper.text()).toContain('Usar somente neste lote')
    expect(wrapper.text()).toContain('Salvar como padrão desta fonte')

    await (wrapper.vm as any).useMonetaryFormat(false);await flush()
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledWith(closing,'review-1',expect.objectContaining({action:'USE_MONETARY_FORMAT',saveAsProfile:false}))
    expect(wrapper.emitted('profileUpdated')).toBeUndefined()
  })

  it('explains that native XLSX numbers are canonical and saves a profile only by explicit action',async()=>{
    const monetaryReview={...structuredClone(review),participants:[],repetitions:[],pendingRows:[],dateAlternatives:[],monetaryFormat:{decisionKey:'F-2',decimalSeparator:'COMMA',format:{groupingSeparator:'DOT',currencyPrefix:'R$',currencySuffix:null,normalizeCommonSpaces:true},confidence:'HIGH',observedValues:10,nativeNumericValues:10,textualValues:0,acceptedValues:10,rejectedValues:0,reasonCodes:['XLSX_NUMERIC_VALUE_IS_CANONICAL'],nativeNumericCanonical:true,requiresDecision:false,selected:false,savedAsProfile:false},blockingReasons:[]}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:monetaryReview})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    expect(wrapper.text()).toContain('Os valores numéricos do Excel são usados diretamente')

    await (wrapper.vm as any).useMonetaryFormat(true);await flush()
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledWith(closing,'review-1',expect.objectContaining({action:'USE_MONETARY_FORMAT',saveAsProfile:true}))
    expect(wrapper.emitted('profileUpdated')).toHaveLength(1)
  })

  it('revalidates an exclusion immediately and shows its audited success state',async()=>{
    const pending={...structuredClone(review),participants:[],repetitions:[],summary:{...review.summary,participantGroups:0,participantOccurrences:0,repetitionGroups:0,repetitionOccurrences:0,importableRows:3},blockingReasons:['Há uma data ausente que precisa ser resolvida']}
    const excluded={...structuredClone(pending),pendingRows:[{...pending.pendingRows[1],resolution:'EXCLUDE_ROW'}],summary:{...pending.summary,excludedRows:1},readyForConfirmation:true,status:'READY',blockingReasons:[]}
    serviceMock.startGuidedImportReview.mockResolvedValueOnce({data:pending}).mockResolvedValueOnce({data:pending}).mockResolvedValueOnce({data:excluded})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    ;(wrapper.vm as any).rowJustifications['R-2']='Linha incompleta revisada pelo operador'
    await (wrapper.vm as any).excludeRow(pending.pendingRows[1]);await flush()

    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledWith(closing,'review-1',expect.objectContaining({action:'EXCLUDE_ROW',justification:'Linha incompleta revisada pelo operador'}))
    expect(serviceMock.startGuidedImportReview).toHaveBeenCalledTimes(3)
    expect(wrapper.text()).toContain('Exclusão confirmada e auditada para este lote')
    expect(wrapper.text()).toContain('Linha 5 excluída deste lote com auditoria')
  })

  it('starts the review automatically when a selected file and profile are ready',async()=>{
    mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[],autoStart:true},global:{plugins:[vuetify]}})
    await flush()
    expect(serviceMock.startGuidedImportReview).toHaveBeenCalledTimes(1)
  })

  it('refreshes a stale workbook revision without replaying the human decision automatically',async()=>{
    const initial={...structuredClone(review),revision:3}
    const refreshed={...structuredClone(review),revision:7}
    serviceMock.startGuidedImportReview.mockResolvedValueOnce({data:initial}).mockResolvedValueOnce({data:initial}).mockResolvedValueOnce({data:refreshed}).mockResolvedValueOnce({data:refreshed})
    serviceMock.saveGuidedReviewDecision.mockRejectedValueOnce({response:{status:409}}).mockResolvedValueOnce({data:{reviewId:'review-1',revision:8,replayed:false}})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[{id:'participant-1',participantKey:'ANA',displayName:'Ana Demo',active:true}]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()

    await (wrapper.vm as any).linkParticipant('P-1','participant-1');await flush()
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledTimes(1)
    expect(serviceMock.startGuidedImportReview).toHaveBeenCalledTimes(3)
    expect(wrapper.text()).toContain('A revisão foi atualizada. Repita somente a decisão')

    await (wrapper.vm as any).linkParticipant('P-1','participant-1');await flush()
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenLastCalledWith(closing,'review-1',expect.objectContaining({expectedRevision:7,action:'LINK_PARTICIPANT'}))
  })

  it('turns a missing participant column blocker into a direct profile-edit action',async()=>{
    const missingColumn={...structuredClone(review),participants:[],repetitions:[],pendingRows:[],blockingReasons:['O perfil usa atribuição direta, mas não informa a coluna que identifica o participante. Publique uma nova versão do perfil com essa coluna antes de continuar']}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:missingColumn})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    const action=wrapper.findAll('button').find(button=>button.text().includes('Corrigir coluna do participante'))
    expect(action).toBeTruthy()
    await action!.trigger('click')
    expect(wrapper.emitted('editProfileRequested')).toHaveLength(1)
  })

  it('navigates from an aggregate blocker to the participant decision section',async()=>{
    const scrollIntoView=vi.fn()
    Element.prototype.scrollIntoView=scrollIntoView
    const participantBlocker={...structuredClone(review),blockingReasons:['Há beneficiários ainda sem associação explícita']}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:participantBlocker})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    const action=wrapper.findAll('button').find(button=>button.text().includes('Revisar participantes'))
    expect(action).toBeTruthy()
    await action!.trigger('click')
    expect(scrollIntoView).toHaveBeenCalledWith({behavior:'smooth',block:'center'})
  })
})
