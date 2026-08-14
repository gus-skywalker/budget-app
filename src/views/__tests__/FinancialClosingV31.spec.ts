import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import FinancialClosingPanelView from '@/views/FinancialClosingPanelView.vue'
import FinancialClosingImportWizardView from '@/views/FinancialClosingImportWizardView.vue'

const { serviceMock, routerPush, routerReplace, routeState, userStore } = vi.hoisted(() => ({
  routerPush: vi.fn(), routerReplace: vi.fn(), routeState: { params: {} as Record<string,string>, query: {} as Record<string,string> },
  userStore: { getTenantRole: 'ROLE_OWNER', getUser: { id: 'owner-1' } },
  serviceMock: {
    list: vi.fn(), createOrGet: vi.fn(), latestWorkbookReview: vi.fn(), workbookReviewProgress: vi.fn(),
    workbookReview: vi.fn(), workbookReviewInventory: vi.fn(), initiateWorkbookReview: vi.fn(), confirmWorkbookSensitiveIntent: vi.fn(), workbookInventory: vi.fn(),
    participants: vi.fn(), prepareWorkbookReview: vi.fn(), preflightWorkbookReview: vi.fn(), publishWorkbookReview: vi.fn(), abandonWorkbookReview: vi.fn(),
    importReadiness: vi.fn(), deductionReadiness: vi.fn(), payoutDecisions: vi.fn(), grantSensitiveAccess: vi.fn(), importProfile: vi.fn(), upsertSource: vi.fn(), createImportProfile: vi.fn(), sources: vi.fn(), productivityDeductions: vi.fn(), upsertProductivityDeduction: vi.fn(), resolveDeductionSource: vi.fn(),
  },
}))
vi.mock('@/services/FinancialClosingService',()=>({default:serviceMock}))
vi.mock('vue-router',()=>({useRoute:()=>routeState,useRouter:()=>({push:routerPush,replace:routerReplace})}))
vi.mock('@/plugins/userStore',()=>({useUserStore:()=>userStore}))
class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver=ResizeObserverMock as any
const vuetify=createVuetify({components,directives});const flush=async()=>{await Promise.resolve();await new Promise(resolve=>setTimeout(resolve,0));await Promise.resolve()}
const closing={id:'closing-1',workspaceId:'workspace-1',closingKey:'DEFAULT',periodMonth:8,periodYear:2026,currency:'BRL',workflowStatus:'DRAFT',settlementStatus:'NOT_ISSUED',currentVersion:{id:'version-1',versionNumber:1,versionStatus:'EDITABLE',inputRevision:1,calculatedRevision:null,calculationCurrent:false}}
const materialized={id:'review-1',status:'DRAFT',revision:1,selectedSourceCount:1,preflightHmac:null,stagingExpiresAt:'2026-08-19T12:00:00Z',reviewExpiresAt:'2026-09-11T12:00:00Z',publicationId:null,sources:[{id:'source-review-1',guidedReviewSessionId:'guided-1',sourceKey:'KNOWN_SOURCE',status:'MATERIALIZED',revision:2,candidateCount:2,additionTotal:120,reversalTotal:20}]}
const preflightReview={...materialized,status:'PREFLIGHT_READY',revision:2,preflightHmac:'opaque-preflight'}
const publishedReview={...preflightReview,status:'PUBLISHED',revision:3,publicationId:'publication-1',sources:preflightReview.sources.map(source=>({...source,status:'PUBLISHED'}))}

describe('Financial closing V31 journey',()=>{
  beforeEach(()=>{
    vi.clearAllMocks();sessionStorage.clear();routeState.params={};routeState.query={};serviceMock.list.mockResolvedValue({data:[closing]});serviceMock.participants.mockResolvedValue({data:[]});serviceMock.sources.mockResolvedValue({data:[]});serviceMock.latestWorkbookReview.mockResolvedValue({status:204,data:undefined});serviceMock.importReadiness.mockResolvedValue({data:{sources:[],readyToCalculate:false,blockingSourceKeys:[]}});serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[],readyToCalculate:false,blockingSourceKeys:[]}});serviceMock.productivityDeductions.mockResolvedValue({data:[]});serviceMock.payoutDecisions.mockResolvedValue({data:[]});serviceMock.grantSensitiveAccess.mockResolvedValue({data:{granted:true}});
    serviceMock.workbookInventory.mockResolvedValue({data:{sheets:[{sheetName:'Known source',classification:'FINANCIAL_SOURCE_PROBABLE',suggestedSourceKey:'KNOWN_SOURCE',nonEmptyDataRows:2,detail:'Compatible structure',recommendedProfileId:'profile-1',recommendedProfileName:'Known profile',selectionStatus:'AUTO_SELECTED'},{sheetName:'Needs review',classification:'SUPPORT_REVIEW',suggestedSourceKey:'NEW_SOURCE',nonEmptyDataRows:1,detail:'Needs review',selectionStatus:'REVIEW_REQUIRED'}]}});
    serviceMock.initiateWorkbookReview.mockResolvedValue({data:{review:{...materialized,selectedSourceCount:0,sources:[]},inventory:{sheets:[{sheetName:'Known source',classification:'FINANCIAL_SOURCE_PROBABLE',suggestedSourceKey:'KNOWN_SOURCE',nonEmptyDataRows:2,detail:'Compatible structure',recommendedProfileId:'profile-1',recommendedProfileName:'Known profile',selectionStatus:'AUTO_SELECTED'},{sheetName:'Needs review',classification:'SUPPORT_REVIEW',suggestedSourceKey:'NEW_SOURCE',nonEmptyDataRows:1,detail:'Needs review',selectionStatus:'REVIEW_REQUIRED'}]},sensitiveIntentExpiresAt:'2026-08-12T12:15:00Z',replayed:false}});serviceMock.prepareWorkbookReview.mockResolvedValue({data:materialized});serviceMock.preflightWorkbookReview.mockResolvedValue({data:{reviewId:'review-1',revision:2,status:'PREFLIGHT_READY',preflightHmac:'opaque-preflight',sourceCount:1,itemCount:2,additionTotal:120,reversalTotal:20,deductionGateProjection:[]}});serviceMock.workbookReview.mockResolvedValueOnce({data:preflightReview}).mockResolvedValueOnce({data:publishedReview});serviceMock.workbookReviewInventory.mockResolvedValue({data:{sheets:[]}});serviceMock.publishWorkbookReview.mockResolvedValue({data:{publicationId:'publication-1',reviewId:'review-1',status:'PUBLISHED',idempotencyKey:'key',sourceCount:1,itemCount:2,additionTotal:120,reversalTotal:20,durationMs:10,replayed:false}});serviceMock.abandonWorkbookReview.mockResolvedValue({data:{...materialized,status:'ABANDONED'}})
  })

  it('renders the four-block panel and routes the contextual source action',async()=>{
    const wrapper=mount(FinancialClosingPanelView,{global:{plugins:[vuetify],stubs:{PageHeader:{props:['title'],template:'<header>{{title}}</header>'},AlertStrip:true}}});await flush();await flush();
    expect(wrapper.text()).toContain('Dados de origem');expect(wrapper.text()).toContain('Regras do cálculo');expect(wrapper.text()).toContain('Resultado');expect(wrapper.text()).toContain('Decisão');
    ;(wrapper.vm as any).openImport();expect(routerPush).toHaveBeenCalledWith({name:'closing-import-wizard',params:{closingId:'closing-1',reviewId:'new'}})
  })

  it('recognizes a previously confirmed legacy import and continues through rules',async()=>{
    serviceMock.importReadiness.mockResolvedValue({data:{sources:[{sourceId:'source-1',sourceKey:'KNOWN_SOURCE',displayName:'Known source',status:'IMPORTED',action:'Imported',detail:'confirmed'}],readyToCalculate:true,blockingSourceKeys:[]}})
    const wrapper=mount(FinancialClosingPanelView,{global:{plugins:[vuetify],stubs:{PageHeader:{props:['title'],template:'<header>{{title}}</header>'},AlertStrip:true}}});await flush();await flush();
    expect(wrapper.text()).toContain('Dados de origem publicados');expect(wrapper.text()).toContain('Todas as fontes configuradas possuem itens publicados');
    await (wrapper.vm as any).openImport();expect(routerPush).toHaveBeenCalledWith({name:'closing-rules',params:{closingId:'closing-1'}})
  })

  it('shows confirmed legacy sources even when remaining sources still need import',async()=>{
    serviceMock.importReadiness.mockResolvedValue({data:{sources:[{sourceId:'source-1',sourceKey:'KNOWN_SOURCE',displayName:'Known source',status:'IMPORTED',action:'Imported',detail:'confirmed'},{sourceId:'source-2',sourceKey:'OTHER_SOURCE',displayName:'Other source',status:'READY_TO_IMPORT',action:'Import',detail:'pending'}],readyToCalculate:false,blockingSourceKeys:['OTHER_SOURCE']}})
    const wrapper=mount(FinancialClosingPanelView,{global:{plugins:[vuetify],stubs:{PageHeader:{props:['title'],template:'<header>{{title}}</header>'},AlertStrip:true}}});await flush();await flush();
    expect(wrapper.text()).toContain('Fontes restantes pendentes');expect(wrapper.text()).toContain('Há fontes publicadas e fontes ainda pendentes.')
  })

  it('crosses upload, recognized preparation, preflight and idempotent publication',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'}
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:{props:['description'],template:'<div>{{description}}</div>'}}}});await flush();await flush();
    const file=new File(['synthetic'],'synthetic.xlsx',{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});(wrapper.vm as any).workbookInput=file;(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).inventoryWorkbook();await flush();expect(wrapper.text()).toContain('Known source');expect(wrapper.text()).toContain('Needs review precisa de revisão');(wrapper.vm as any).readyProfileIds=['profile-1'];
    await (wrapper.vm as any).prepareSources();await flush();expect(serviceMock.prepareWorkbookReview).toHaveBeenCalledWith(closing,file,['profile-1'],'review-1');expect(routerReplace).toHaveBeenCalledWith({name:'closing-import-wizard',params:{closingId:'closing-1',reviewId:'review-1'}});expect(wrapper.text()).toContain('staging ainda está invisível ao cálculo');
    await (wrapper.vm as any).runPreflight();await flush();expect(wrapper.text()).toContain('Publicar lote');(wrapper.vm as any).financialConfirmed=true;await (wrapper.vm as any).publish();await flush();expect(wrapper.text()).toContain('Lote publicado');
    const firstKey=serviceMock.publishWorkbookReview.mock.calls[0][2].idempotencyKey;serviceMock.workbookReview.mockResolvedValue({data:publishedReview});(wrapper.vm as any).review=preflightReview;await (wrapper.vm as any).publish();expect(serviceMock.publishWorkbookReview.mock.calls[1][2].idempotencyKey).toBe(firstKey)
  })

  it('configures a source inside the wizard without losing the selected workbook or navigating to legacy',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'}
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:{props:['description'],template:'<div>{{description}}</div>'}}}});await flush();await flush()
    const file=new File(['synthetic'],'synthetic.xlsx');(wrapper.vm as any).workbookInput=file;(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).inventoryWorkbook();await flush()
    const sheet=(wrapper.vm as any).reviewSheets[0];(wrapper.vm as any).configureSheet(sheet);await flush()
    expect(wrapper.text()).toContain('Configurar fonte');expect((wrapper.vm as any).selectedFile).toBe(file);expect(routerPush).not.toHaveBeenCalledWith(expect.objectContaining({name:'planning-financial-closings-legacy'}))
  })

  it('does not retain workbook bytes when the wizard is mounted again',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'}
    const first=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:true}}});await flush();await flush()
    const file=new File(['synthetic'],'synthetic.xlsx');(first.vm as any).workbookInput=file;(first.vm as any).sensitiveConfirmed=true;await (first.vm as any).inventoryWorkbook();await flush()
    const resumed=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:true}}});await flush();await flush()
    expect((resumed.vm as any).selectedFile).toBeNull();expect((resumed.vm as any).sensitiveConfirmed).toBe(false);expect(resumed.text()).toContain('Selecione o workbook')
  })

  it('does not select a compatible source that was already confirmed in this competence',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'};serviceMock.importReadiness.mockResolvedValue({data:{sources:[{sourceId:'source-1',sourceKey:'KNOWN_SOURCE',displayName:'Known source',status:'IMPORTED',action:'Imported',detail:'confirmed'}],readyToCalculate:false,blockingSourceKeys:[]}})
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:true}}});await flush();await flush();(wrapper.vm as any).workbookInput=new File(['synthetic'],'synthetic.xlsx');(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).inventoryWorkbook();await flush()
    expect(wrapper.text()).toContain('Já importadas nesta competência');expect((wrapper.vm as any).selectedSheets).toHaveLength(0)
  })

  it('treats a historical empty publication as non-contributing and starts a fresh review for pending sources',async()=>{
    serviceMock.latestWorkbookReview.mockResolvedValue({status:200,data:{id:'empty-review',status:'PUBLISHED',revision:1,selectedSourceCount:1,materializedSourceCount:1,publishedSourceCount:1,publishableItemCount:0,contributingPublication:false,stagingExpiresAt:'2026-08-19T12:00:00Z',reviewExpiresAt:'2026-09-11T12:00:00Z',stagingExpired:false,reviewExpired:false,publicationId:'empty-publication',pendingCodes:[],nextAction:'VIEW_RESULT'}})
    serviceMock.importReadiness.mockResolvedValue({data:{sources:[{sourceId:'source-1',sourceKey:'KNOWN_SOURCE',displayName:'Known source',status:'READY_TO_IMPORT',action:'Import',detail:'pending'}],readyToCalculate:false,blockingSourceKeys:['KNOWN_SOURCE']}})
    const wrapper=mount(FinancialClosingPanelView,{global:{plugins:[vuetify],stubs:{PageHeader:{props:['title'],template:'<header>{{title}}</header>'},AlertStrip:true}}});await flush();await flush()
    expect(wrapper.text()).toContain('publicação anterior não trouxe itens');expect(wrapper.text()).toContain('Importar workbook');await (wrapper.vm as any).openImport();expect(routerPush).toHaveBeenCalledWith({name:'closing-import-wizard',params:{closingId:'closing-1',reviewId:'new'}});(wrapper.vm as any).openPublicationHistory();expect(routerPush).toHaveBeenCalledWith({name:'closing-publication-history',params:{closingId:'closing-1',reviewId:'empty-review'}})
  })

  it('requires the same workbook before returning to a source that still needs review',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'review-1'};serviceMock.workbookReviewProgress.mockResolvedValue({data:{id:'review-1',status:'DRAFT',revision:1,selectedSourceCount:1,materializedSourceCount:1,publishedSourceCount:0,stagingExpiresAt:'2026-08-19T12:00:00Z',reviewExpiresAt:'2026-09-11T12:00:00Z',stagingExpired:false,reviewExpired:false,publicationId:null,pendingCodes:[],nextAction:'RUN_PREFLIGHT'}});serviceMock.confirmWorkbookSensitiveIntent.mockResolvedValue({data:{expiresAt:'2026-08-12T12:15:00Z'}});serviceMock.workbookReview.mockReset().mockResolvedValue({data:materialized});
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:{props:['description'],template:'<div>{{description}}</div>'}}}});await flush();await flush();expect((wrapper.vm as any).selectedFile).toBeNull();expect(wrapper.text()).toContain('A revisão foi preservada');expect(wrapper.text()).not.toContain('Analisar e iniciar revisão');expect(serviceMock.confirmWorkbookSensitiveIntent).not.toHaveBeenCalled();(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).resumeReview();await flush();expect(wrapper.text()).toContain('Selecione novamente o mesmo workbook');
    serviceMock.preflightWorkbookReview.mockRejectedValue({response:{status:409}});await (wrapper.vm as any).runPreflight();await flush();expect(wrapper.text()).toContain('preparação mudou ou expirou');
    ;(wrapper.vm as any).inventory={sheets:[{sheetName:'Known source',selectionStatus:'AUTO_SELECTED',recommendedProfileId:'profile-1'}]};(wrapper.vm as any).readyProfileIds=['profile-1'];(wrapper.vm as any).workbookInput=new File(['other'],'other.xlsx');serviceMock.prepareWorkbookReview.mockRejectedValue({response:{status:409}});await (wrapper.vm as any).prepareSources();expect((wrapper.vm as any).errorMessage).toContain('não corresponde à revisão retomada')
  })

  it('keeps one task per screen and no mandatory table at 360px',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'};Object.defineProperty(window,'innerWidth',{value:360,configurable:true});const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:true}}});await flush();await flush();expect(wrapper.find('table').exists()).toBe(false);expect(wrapper.find('.sticky-action').exists()).toBe(true);expect(wrapper.text()).toContain('Selecione o workbook')
  })

  it('guides the owner to enable protected access after a forbidden workbook inventory',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'new'};serviceMock.initiateWorkbookReview.mockRejectedValue({response:{status:403}})
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:{props:['description'],template:'<div>{{description}}</div>'}}}});await flush();await flush();
    ;(wrapper.vm as any).workbookInput=new File(['synthetic'],'synthetic.xlsx');(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).inventoryWorkbook();await flush();
    expect(wrapper.text()).toContain('Habilite o acesso protegido deste fechamento');await (wrapper.vm as any).enableOwnerSensitiveAccess();expect(serviceMock.grantSensitiveAccess).toHaveBeenCalledWith(closing,'owner-1',true)
  })

  it('rebuilds expired staging with only the originally selected source set',async()=>{
    routeState.params={closingId:'closing-1',reviewId:'review-1'}
    serviceMock.workbookReviewProgress.mockResolvedValue({data:{id:'review-1',status:'DRAFT',revision:2,selectedSourceCount:1,materializedSourceCount:1,publishedSourceCount:0,stagingExpiresAt:'2026-08-01T00:00:00Z',reviewExpiresAt:'2026-09-11T12:00:00Z',stagingExpired:true,reviewExpired:false,publicationId:null,pendingCodes:['STAGING_EXPIRED'],nextAction:'PREPARE_SOURCES'}})
    serviceMock.confirmWorkbookSensitiveIntent.mockResolvedValue({data:{expiresAt:'2026-08-12T12:15:00Z'}})
    serviceMock.workbookReview.mockReset().mockResolvedValue({data:{...materialized,revision:2,stagingExpiresAt:'2026-08-01T00:00:00Z'}})
    serviceMock.workbookInventory.mockResolvedValue({data:{sheets:[{sheetName:'Known source',classification:'FINANCIAL_SOURCE_PROBABLE',suggestedSourceKey:'KNOWN_SOURCE',nonEmptyDataRows:2,detail:'ok',recommendedProfileId:'profile-1',selectionStatus:'AUTO_SELECTED'},{sheetName:'Other source',classification:'FINANCIAL_SOURCE_PROBABLE',suggestedSourceKey:'OTHER_SOURCE',nonEmptyDataRows:2,detail:'ok',recommendedProfileId:'profile-2',selectionStatus:'AUTO_SELECTED'}]}})
    const wrapper=mount(FinancialClosingImportWizardView,{global:{plugins:[vuetify],stubs:{AlertStrip:{props:['description'],template:'<div>{{description}}</div>'}}}});await flush();await flush();(wrapper.vm as any).sensitiveConfirmed=true;await (wrapper.vm as any).resumeReview();await flush();expect(wrapper.text()).toContain('Selecione novamente o mesmo workbook')
    const file=new File(['same'],'same.xlsx');(wrapper.vm as any).workbookInput=file;await (wrapper.vm as any).recoverStaging();expect(serviceMock.prepareWorkbookReview).toHaveBeenCalledWith(closing,file,['profile-1'],'review-1')
  })
})
