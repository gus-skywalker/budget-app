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
const review={reviewId:'review-1',status:'OPEN',revision:0,detailed:true,readyForConfirmation:false,alreadyConfirmed:false,summary:{rowsRead:4,structurallyIgnored:1,importableRows:4,correctedRows:0,excludedRows:0,participantGroups:2,participantOccurrences:4,repetitionGroups:1,repetitionOccurrences:2,importableTotal:170},participants:[{decisionKey:'P-1',sourceLabel:'ANA DEMO',occurrenceCount:3,suggestions:[{participantId:'participant-1',displayName:'Ana Demo',confidence:100}],resolution:'PENDING',participantId:null,blocking:true},{decisionKey:'P-2',sourceLabel:'BRUNO DEMO',occurrenceCount:1,suggestions:[],resolution:'PENDING',participantId:null,blocking:true}],repetitions:[{decisionKey:'M-1',occurrenceCount:2,aggregateAmount:150}],pendingRows:[{decisionKey:'R-1',rowNumber:4,issueType:'AMOUNT_NOT_INTERPRETABLE',resolution:'PENDING',canCorrect:true,canExclude:true},{decisionKey:'R-2',rowNumber:5,issueType:'MISSING_DATE',resolution:'PENDING',canCorrect:true,canExclude:true}],dateAlternatives:[],repetitionsAccepted:false,repetitionReasonCode:null,blockingReasons:['Há pendências de valor, data ou identidade que precisam ser resolvidas']}

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
    expect(serviceMock.saveGuidedReviewDecision).toHaveBeenCalledWith(closing,'review-1',expect.objectContaining({action:'LINK_PARTICIPANT',participantId:'participant-1'}))
  })

  it('uses business language for repetitions and keeps one explicit final confirmation',async()=>{
    const ready={...structuredClone(review),status:'READY',readyForConfirmation:true,blockingReasons:[],participants:[],pendingRows:[],repetitionsAccepted:true,summary:{...review.summary,correctedRows:1,excludedRows:1}}
    serviceMock.startGuidedImportReview.mockResolvedValue({data:ready})
    const wrapper=mount(GuidedTabularImportReview,{props:{closing,file:new File(['synthetic'],'synthetic.xlsx'),profileId:'profile-1',sensitiveAccessConfirmed:true,participants:[]},global:{plugins:[vuetify]}})
    await (wrapper.vm as any).openReview();await flush()
    expect(wrapper.text()).toContain('Revisar referências repetidas')
    expect(wrapper.text()).not.toContain('multiplicidade')
    expect(wrapper.text()).not.toContain('idempotência')
    expect(wrapper.text()).toContain('Confirmo que estes valores entrarão nesta apuração')
    ;(wrapper.vm as any).financialConfirmation=true
    await (wrapper.vm as any).confirmReview()
    expect(serviceMock.confirmGuidedImportReview).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('confirmed')).toHaveLength(1)
  })
})
