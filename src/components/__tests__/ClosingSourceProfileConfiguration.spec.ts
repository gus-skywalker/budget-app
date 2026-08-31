import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ClosingSourceProfileConfiguration from '@/components/ClosingSourceProfileConfiguration.vue'

const { serviceMock }=vi.hoisted(()=>({serviceMock:{upsertSource:vi.fn(),createImportProfile:vi.fn(),importProfile:vi.fn()}}))
vi.mock('@/services/FinancialClosingService',()=>({default:serviceMock}))
class ResizeObserverMock{observe(){} unobserve(){} disconnect(){}}
globalThis.ResizeObserver=ResizeObserverMock as any
const vuetify=createVuetify({components,directives});const flush=async()=>{await Promise.resolve();await new Promise(resolve=>setTimeout(resolve,0));await Promise.resolve()}
const closing:any={id:'closing-1',workspaceId:'workspace-1',closingKey:'DEFAULT',periodMonth:8,periodYear:2026,currency:'BRL',workflowStatus:'DRAFT',settlementStatus:'NOT_ISSUED',currentVersion:{id:'version-1',versionNumber:1,versionStatus:'EDITABLE',inputRevision:1,calculatedRevision:null,calculationCurrent:false}}
const sheet:any={sheetName:'Source one',classification:'SUPPORT_REVIEW',suggestedSourceKey:'SOURCE_ONE',nonEmptyDataRows:2,detail:'Needs configuration',selectionStatus:'REVIEW_REQUIRED',headers:['reference','amount','date','responsible'],mappingSuggestion:{itemKeyColumn:'reference',externalReferenceColumn:'reference',amountColumn:'amount',occurredOnColumn:'date',participantColumn:'responsible',identityCandidateColumns:['reference'],ambiguousFields:[]}}

describe('ClosingSourceProfileConfiguration',()=>{
  beforeEach(()=>{vi.clearAllMocks();serviceMock.upsertSource.mockResolvedValue({data:{id:'source-1'}});serviceMock.createImportProfile.mockResolvedValue({data:{id:'profile-1'}})})
  it('saves the canonical source and versioned profile without receiving workbook bytes',async()=>{
    const wrapper=mount(ClosingSourceProfileConfiguration,{props:{closing,sheet},global:{plugins:[vuetify],stubs:{AlertStrip:true}}});await flush()
    ;(wrapper.vm as any).itemKeyColumns=['reference'];(wrapper.vm as any).externalReferenceColumn='reference';(wrapper.vm as any).amountColumn='amount';(wrapper.vm as any).occurredOnColumn='date';(wrapper.vm as any).participantColumn='responsible'
    await (wrapper.vm as any).save()
    expect(serviceMock.upsertSource).toHaveBeenCalledWith(closing,'SOURCE_ONE','Source one')
    expect(serviceMock.createImportProfile).toHaveBeenCalledWith(closing,expect.objectContaining({sourceKey:'SOURCE_ONE',config:expect.objectContaining({expectedSheet:'Source one',headerSignature:['reference','amount','date','responsible']})}))
    expect(wrapper.emitted('saved')?.[0]).toEqual(['profile-1'])
  })
})
