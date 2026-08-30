import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import FinancialClosingRulesView from '@/views/FinancialClosingRulesView.vue'
import FinancialClosingResultView from '@/views/FinancialClosingResultView.vue'

const { serviceMock, routerPush, routeState }=vi.hoisted(()=>({
  routerPush:vi.fn(),routeState:{params:{closingId:'closing-1'} as Record<string,string>},
  serviceMock:{list:vi.fn(),productivityDeductions:vi.fn(),participants:vi.fn(),deductionReadiness:vi.fn(),previewProductivityDeductions:vi.fn(),resolveDeductionSource:vi.fn(),upsertProductivityDeduction:vi.fn(),upsertParticipantScore:vi.fn(),summary:vi.fn(),memory:vi.fn(),calculate:vi.fn()},
}))
vi.mock('@/services/FinancialClosingService',()=>({default:serviceMock}))
vi.mock('@/plugins/userStore',()=>({useUserStore:()=>({canWrite:true})}))
vi.mock('vue-router',()=>({useRoute:()=>routeState,useRouter:()=>({push:routerPush})}))
class ResizeObserverMock{observe(){}unobserve(){}disconnect(){}}globalThis.ResizeObserver=ResizeObserverMock as any
const vuetify=createVuetify({components,directives});const flush=async()=>{await Promise.resolve();await new Promise(resolve=>setTimeout(resolve,0));await Promise.resolve()}
const closing={id:'closing-1',workspaceId:'workspace-1',closingKey:'DEFAULT',periodMonth:8,periodYear:2026,currency:'BRL',workflowStatus:'DRAFT',settlementStatus:'NOT_ISSUED',currentVersion:{id:'version-1',versionNumber:1,versionStatus:'EDITABLE',inputRevision:4,calculatedRevision:null,calculationCurrent:false}}
const source={sourceId:'source-1',sourceKey:'SOURCE_A',displayName:'Fonte A',status:'REVIEW_REQUIRED',resolutionRevision:0,ruleRevisionIds:[],dependencyCurrent:false,action:'Declare se nenhuma dedução se aplica',detail:'A fonte ainda não possui resolução explícita.'}
const preview={inputRevision:4,calculationSemanticsVersion:'GROSS_TO_NET_V2',grossProductivityAmount:100,deductionAmount:0,netProductivityAmount:100,sources:[{sourceId:'source-1',sourceKey:'SOURCE_A',displayName:'Fonte A',grossProductivityAmount:100,deductionAmount:0,netProductivityAmount:100}],applications:[]}
const stubs={PageHeader:{props:['title'],template:'<header>{{title}}</header>'},AlertStrip:{props:['description'],template:'<div>{{description}}</div>'},VDialog:{props:['modelValue'],template:'<div v-if="modelValue"><slot /></div>'}}

describe('Financial closing V33 rules and result journey',()=>{
  beforeEach(()=>{vi.clearAllMocks();serviceMock.list.mockResolvedValue({data:[closing]});serviceMock.productivityDeductions.mockResolvedValue({data:[]});serviceMock.participants.mockResolvedValue({data:[{id:'participant-1',participantKey:'P1',displayName:'Participante 1',active:true}]});serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[source],readyToCalculate:false,blockingSourceKeys:['SOURCE_A']}});serviceMock.previewProductivityDeductions.mockResolvedValue({data:preview});serviceMock.resolveDeductionSource.mockResolvedValue({data:{...source,status:'NO_DEDUCTION_APPLIES',resolutionRevision:1,dependencyCurrent:true}});serviceMock.upsertProductivityDeduction.mockResolvedValue({data:{}});serviceMock.upsertParticipantScore.mockResolvedValue({data:{id:'score-1'}});serviceMock.memory.mockResolvedValue({data:{calculationRunId:'run-1',calculationPolicyVersion:'GROSS_TO_NET_V2',roundingMode:'HALF_UP',intermediateScale:12,items:[],participantAdjustments:[],participantScores:[],residualAmount:0,deductionApplications:[],participantPayouts:[]}})})

  it('requires an explicit per-source resolution and shows only the canonical API preview',async()=>{
    const wrapper=mount(FinancialClosingRulesView,{global:{plugins:[vuetify],stubs}});await flush();await flush();
    expect(wrapper.text()).toContain('Revisão necessária');expect(wrapper.text()).toContain('Produtividade Bruta');expect(wrapper.text()).toContain('R$ 100,00');expect(wrapper.find('table').exists()).toBe(false)
    ;(wrapper.vm as any).resolveSource('NO_DEDUCTION_APPLIES');(wrapper.vm as any).resolutionJustification='Fonte conferida sem incidência';
    serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[{...source,status:'NO_DEDUCTION_APPLIES',resolutionRevision:1,dependencyCurrent:true}],readyToCalculate:true,blockingSourceKeys:[]}})
    await (wrapper.vm as any).confirmResolution();expect(serviceMock.resolveDeductionSource).toHaveBeenCalledWith(closing,{sourceId:'source-1',status:'NO_DEDUCTION_APPLIES',expectedRevision:0,justification:'Fonte conferida sem incidência'})
  })

  it('moves directly to the next unresolved source and does not offer to reconfirm a resolved one',async()=>{
    const resolved={...source,status:'NO_DEDUCTION_APPLIES',resolutionRevision:1,dependencyCurrent:true,detail:'A fonte foi revisada sem dedução.'}
    const pending={...source,sourceId:'source-2',sourceKey:'SOURCE_B',displayName:'Fonte B'}
    serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[resolved,pending],readyToCalculate:false,blockingSourceKeys:['SOURCE_B']}})
    const wrapper=mount(FinancialClosingRulesView,{global:{plugins:[vuetify],stubs}});await flush();await flush()
    expect((wrapper.vm as any).selectedSourceId).toBe('source-2')
    expect(wrapper.text()).toContain('Fonte B')
    expect(wrapper.text()).toContain('Confirmar sem dedução')
    ;(wrapper.vm as any).selectSource('source-1');await flush()
    expect(wrapper.text()).toContain('Esta fonte já foi revisada nesta versão')
    expect(wrapper.findAll('button').map(button=>button.text()).filter(text=>text==='Confirmar sem dedução')).toHaveLength(0)
  })

  it('saves a versioned rule without calculating in the frontend',async()=>{
    const wrapper=mount(FinancialClosingRulesView,{global:{plugins:[vuetify],stubs}});await flush();await flush();const vm=wrapper.vm as any
    vm.form.name='Dedução contratual';vm.form.percentage=10;vm.form.justification='Contrato revisado';await vm.saveRule();
    expect(serviceMock.upsertProductivityDeduction).toHaveBeenCalledWith(closing,expect.objectContaining({sourceId:'source-1',percentage:10,baseReference:'OPENING_GROSS_PRODUCTIVITY',active:true}));expect(serviceMock.calculate).not.toHaveBeenCalled()
  })

  it('calculates only through the canonical endpoint and renders PB, deductions, PL and payout',async()=>{
    serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[{...source,status:'RULE_VALID',resolutionRevision:1,ruleRevisionIds:['rule-revision-1'],dependencyCurrent:true}],readyToCalculate:true,blockingSourceKeys:[]}})
    const calculated={calculationRunId:'run-1',versionNumber:1,inputRevision:4,calculationPolicyVersion:'GROSS_TO_NET_V2',roundingMode:'HALF_UP',intermediateScale:12,grossAmount:100,reversalAmount:0,deductionAmount:10,closingAdjustmentAmount:0,productivityAmount:90,undistributedPoolAmount:0,netRevenueAmount:90,residualAmount:0,reconciliation:{expectedInflowAmount:90,reconciledInflowAmount:0,coveragePercentage:0,divergenceAmount:90,unreconciledItemCount:1},calculatedAt:'2026-08-12T12:00:00Z',sourceProductivity:[{sourceId:'source-1',sourceKey:'SOURCE_A',displayName:'Fonte A',grossAmount:100,reversalAmount:0,retentionAmount:10,eligibleAmount:90,grossProductivityAmount:100,participantAdjustmentAmount:0,netProductivityAmount:90}],grossProductivityAmount:100,netProductivityAmount:90,calculationSemanticsVersion:'GROSS_TO_NET_V2',participantPayouts:[{participantId:'participant-1',productivityAmount:90,reserveAmount:13.5,monthlyCeilingAmount:76.5,appliedScore:85,valueReceivableAmount:76.5,annualBonusEligibleScore:0,undistributedAmount:0,tmReserveAmount:9,tiReserveAmount:4.5,totalExplainedAmount:90}]}
    serviceMock.calculate.mockResolvedValue({data:calculated});const wrapper=mount(FinancialClosingResultView,{global:{plugins:[vuetify],stubs}});await flush();await flush();expect(wrapper.text()).toContain('Prévia pronta para calcular');await (wrapper.vm as any).calculate();await flush();expect(serviceMock.calculate).toHaveBeenCalledWith(closing);expect(wrapper.text()).toContain('Cálculo atual');expect(wrapper.text()).toContain('Valor a Receber');expect(wrapper.text()).toContain('R$ 76,50');expect(wrapper.text()).toContain('Reserva TM · regra opcional');expect(wrapper.text()).toContain('Valor bruto − reversões − deduções da fonte')
  })

  it('keeps aggregate results available when protected calculation memory is denied',async()=>{
    serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[{...source,status:'RULE_VALID',dependencyCurrent:true}],readyToCalculate:true,blockingSourceKeys:[]}})
    serviceMock.list.mockResolvedValue({data:[{...closing,currentVersion:{...closing.currentVersion,calculationCurrent:true,calculatedRevision:4}}]})
    serviceMock.summary.mockResolvedValue({data:{...preview,participantPayouts:[]}})
    serviceMock.memory.mockRejectedValue(new Error('forbidden'))
    const wrapper=mount(FinancialClosingResultView,{global:{plugins:[vuetify],stubs}});await flush();await flush()
    expect(wrapper.text()).toContain('O resumo agregado continua disponível')
    expect(wrapper.text()).toContain('Produtividade Líquida')
  })

  it('uses the remaining PL when rules are absent while preserving the optional mutation flow',async()=>{
    serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[{...source,status:'RULE_VALID',dependencyCurrent:true}],readyToCalculate:true,blockingSourceKeys:[]}})
    serviceMock.list.mockResolvedValue({data:[{...closing,currentVersion:{...closing.currentVersion,calculationCurrent:true,calculatedRevision:4}}]})
    const withoutScore={...preview,sourceProductivity:[],participantPayouts:[{participantId:'participant-1',productivityAmount:100,tmReserveAmount:10,tiReserveAmount:5,undistributedAmount:0,valueReceivableAmount:85,score:null,appliedScore:85,totalExplainedAmount:100}]}
    serviceMock.summary.mockResolvedValue({data:withoutScore});const wrapper=mount(FinancialClosingResultView,{global:{plugins:[vuetify],stubs}});await flush();await flush()
    expect(wrapper.text()).toContain('Ajustar percentual por participante');expect(wrapper.text()).toContain('100% da PL');expect(wrapper.text()).toContain('R$ 85,00');expect(wrapper.text()).toContain('Continuar para decisão')
    const vm=wrapper.vm as any;vm.scoreValues['participant-1']=85;vm.scoreJustifications['participant-1']='Avaliação mensal concluída';await vm.saveScore('participant-1')
    expect(serviceMock.upsertParticipantScore).toHaveBeenCalledWith(expect.objectContaining({id:'closing-1'}),{participantId:'participant-1',score:85,justification:'Avaliação mensal concluída'})
  })

  it('keeps the main result path usable at 360px without a mandatory table',async()=>{
    Object.defineProperty(window,'innerWidth',{value:360,configurable:true});serviceMock.deductionReadiness.mockResolvedValue({data:{sources:[{...source,status:'RULE_VALID',dependencyCurrent:true}],readyToCalculate:true,blockingSourceKeys:[]}});const wrapper=mount(FinancialClosingResultView,{global:{plugins:[vuetify],stubs}});await flush();await flush();expect(wrapper.find('table').exists()).toBe(false);expect(wrapper.find('.sticky-action').exists()).toBe(true)
  })
})
