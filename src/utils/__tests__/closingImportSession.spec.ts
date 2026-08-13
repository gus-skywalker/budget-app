import { afterEach, describe, expect, it } from 'vitest'
import { clearClosingImportSession, readClosingImportSession, rememberClosingImportSession } from '@/utils/closingImportSession'

const scope={workspaceId:'workspace-1',userId:'admin-1',closingId:'closing-1'}

describe('closingImportSession',()=>{
  afterEach(()=>clearClosingImportSession(scope))

  it('keeps the workbook only in memory for the protected 15-minute session',()=>{
    const file=new File(['synthetic'],'source.xlsx')
    const inventory={sheets:[]}
    rememberClosingImportSession(scope,{file,inventory,excludedNames:[],readyProfileIds:[]},1_000)
    expect(readClosingImportSession(scope,1_000+14*60_000)?.sensitiveIntentValid).toBe(true)
    expect(readClosingImportSession(scope,1_000+15*60_000)?.sensitiveIntentValid).toBe(false)
    expect(readClosingImportSession(scope)?.file).toBe(file)
  })
})
