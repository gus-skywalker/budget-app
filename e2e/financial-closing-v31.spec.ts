import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Runtime = { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }
type Closing = { id: string; currentVersion: { versionNumber: number } }
type PayoutDecision = { id: string; status: string; revision: number; issuedObligationCount: number }
type MarginDecision = { id: string; status: string; revision: number; issuedObligationCount: number; marginSnapshot: number }
type OperationalObligation = { id: string; domain: string; originType: string; principalAmount: number }
type MaterializedLot = { publicationId: string; reviewId: string; status: string; active: boolean; mutable: boolean; itemCount: number; additionTotal: number; reversalTotal: number; netImpact: number }

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing/runtime/state.json'), 'utf8')) as Runtime
const fixture = join(process.cwd(), 'e2e/fixtures/closing-v31-happy.xlsx')
const secondLotFixture = join(process.cwd(), 'e2e/fixtures/closing-v31-second-lot.xlsx')
const expectedResults = JSON.parse(readFileSync(join(process.cwd(), 'e2e/fixtures/expected-results.json'), 'utf8')) as { scenarios: Record<string, { itemCount: number; additionTotalCents: number; reversalTotalCents: number; netImpactCents: number }> }

function headers(state: Runtime) {
  return { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId }
}

async function apiJson<T>(request: APIRequestContext, state: Runtime, method: 'get'|'post'|'put', path: string, data?: unknown): Promise<T> {
  const response = await request[method](`http://127.0.0.1:${state.apiPort}/api${path}`, { headers: headers(state), data })
  expect(response.ok(), `${method.toUpperCase()} ${path}: ${response.status()} ${await response.text()}`).toBeTruthy()
  return response.status() === 204 ? undefined as T : await response.json() as T
}

async function prepareCompetence(request: APIRequestContext, state: Runtime, month: number, participantReview = false,
                                 includeProfile = true, includeSource = true,
                                 attributionMethod = 'DIRECT_ATTRIBUTION', defaultPoolKey?: string) {
  const closingKey = includeProfile ? 'DEFAULT' : `CONFIG_${Date.now()}`
  const closing = await apiJson<Closing>(request, state, 'post', '/financial-closings', {
    periodMonth: month, periodYear: 2026, closingKey, currency: 'BRL',
  })
  const version = closing.currentVersion.versionNumber
  const source = includeSource ? await apiJson<{ id: string; sourceKey: string }>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/sources`, {
    sourceKey: 'V31_SOURCE', displayName: 'Fonte sintética V31',
  }) : undefined
  const participant = await apiJson<{ id: string }>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/participants`, {
    participantKey: `PARTICIPANT_${month}`, displayName: participantReview ? 'PARTICIPANT' : `Participante sintético ${month}`, active: true,
  })
  await apiJson<void>(request, state, 'put', `/financial-closings/${closing.id}/sensitive-access-grants`, { userId: 'demo-owner', confirmed: true })
  if (source) await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/source-retentions`, {
    sourceKey: source.sourceKey, displayName: 'Sem dedução nesta fonte', percentage: 0, justification: 'Regra sintética explícita para o E2E V31',
  })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/participant-scores`, {
    participantId: participant.id, score: 85, justification: 'Pontuação sintética explícita para o E2E V34',
  })
  if (includeProfile && source) await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/import-profiles`, {
    profileKey: 'V31_HAPPY_PATH', displayName: 'Perfil sintético V31', sourceKey: source.sourceKey,
    config: {
      format: 'XLSX', expectedSheet: 'V31_SOURCE', itemKeyColumn: 'reference', itemKeyColumns: ['reference'],
      amountColumn: 'amount', occurredOnColumn: 'date', externalReferenceColumn: 'reference',
      participantColumn: attributionMethod === 'UNDISTRIBUTED_POOL' ? null : 'responsible',
      participantMappings: attributionMethod === 'UNDISTRIBUTED_POOL' || participantReview ? {} : { PARTICIPANT: participant.id },
      positiveDirection: 'ADDITION', negativeAsReversal: true,
      ignoreTotalsAndFormulas: true, defaultAttributionMethod: attributionMethod, defaultPoolKey, decimalSeparator: 'DOT',
      headerSignature: ['reference', 'amount', 'date', 'responsible'], multiplicityPolicy: 'REQUIRES_UNIQUE_EXTERNAL_IDENTITY',
      monetaryFormat: { groupingSeparator: 'NONE', prefix: null, suffix: null, normalizeSpaces: true },
    },
  })
  return closing
}

async function authenticate(page: Page, state: Runtime) {
  await page.addInitScript(({ token, workspaceId, workspaceName }) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      token, auth: true,
      user: { id: 'demo-owner', username: 'Operador V31', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] },
      currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default',
    }))
  }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName })
}

async function closeCookieNotice(page: Page) {
  const dialog = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Recusar' }).click()
}

async function completeJourney(page: Page, closing: Closing, participantReview = false) {
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await expect(page.getByRole('main', { name: 'Etapas do fechamento' })).toBeVisible()
  for (const label of ['Base editável', 'Regras do cálculo', 'Resultado calculado e revisão', 'Decisão']) await expect(page.getByText(label, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/new$`))
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/[0-9a-f-]+$`))
  await expect(page.getByRole('heading', { name: /Escolha as fontes que entram neste lote|Confirmar substituição de/ })).toBeVisible()
  await expect(page.getByText('V31_SOURCE', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Revisar fontes deste lote' }).click()
  if (participantReview) {
    await page.getByLabel('Sim, esta coluna identifica o participante ou beneficiário da apuração').check()
    await page.getByRole('button', { name: 'Criar participante com este nome' }).click()
    await expect(page.getByText('Associado a PARTICIPANT', { exact: true })).toBeVisible()
  }
  await expect(page.getByText('Fonte pronta para o lote', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Preparar lote completo' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/[0-9a-f-]+$`))
  await expect(page.getByRole('heading', { name: 'Fontes preparadas' })).toBeVisible()
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Conferir importação' }).click()
  await expect(page.getByRole('heading', { name: 'Materializar fontes' })).toBeVisible()
  await page.getByLabel('Confirmo que estas fontes entram na revisão do cálculo').check()
  await page.getByRole('button', { name: 'Materializar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Lote adicionado à base editável' })).toBeVisible()
  await page.getByRole('button', { name: 'Voltar ao painel' }).click()
  await expect(page.getByText('Base editável', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ver itens' })).toBeVisible()
  await expect(page.getByText('Ações sobre todas as fontes deste arquivo')).toBeVisible()
  await expect(page.getByText('Impacto líquido R$ 200,00', { exact: true })).toBeVisible()
}

async function materializeAdditionalLot(page: Page, fixturePath: string, startFromPanel = true) {
  if (startFromPanel) await page.getByRole('button', { name: 'Preparar novo lote' }).click()
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixturePath)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: /Escolha as fontes que entram neste lote|Confirmar substituição de/ })).toBeVisible()
  const includeExisting = page.getByRole('button', { name: 'Incluir novos itens neste lote' })
  if (await includeExisting.isVisible()) await includeExisting.click()
  await page.getByRole('button', { name: 'Revisar fontes deste lote' }).click()
  await expect(page.getByText('Fonte pronta para o lote', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Preparar lote completo' }).click()
  await expect(page.getByRole('heading', { name: 'Fontes preparadas' })).toBeVisible()
  await page.getByRole('button', { name: 'Conferir importação' }).click()
  await expect(page.getByRole('heading', { name: 'Materializar fontes' })).toBeVisible()
  await page.getByLabel('Confirmo que estas fontes entram na revisão do cálculo').check()
  await page.getByRole('button', { name: 'Materializar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Lote adicionado à base editável' })).toBeVisible()
  await page.getByRole('button', { name: 'Voltar ao painel' }).click()
}

async function calculateWithoutPublishing(page: Page, closing: Closing) {
  await page.getByRole('button', { name: /Revisar regras|Ver regras/ }).first().click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/rules$`))
  const confirmRules = page.getByRole('button', { name: 'Confirmar regras desta fonte' })
  if (await confirmRules.isVisible()) {
    await confirmRules.click()
    await page.getByLabel('Por que esta incidência está correta?').fill('Base sintética revisada antes do cálculo automatizado')
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Continuar para o resultado' }).click()
  await expect(page.getByRole('heading', { name: 'Prévia pronta para calcular' })).toBeVisible()
  await page.getByRole('button', { name: 'Calcular resultado' }).click()
  await expect(page.getByRole('heading', { name: 'Cálculo atual' })).toBeVisible()
}

async function completeRulesAndCalculation(page: Page, closing: Closing) {
  await page.getByRole('button', { name: /Revisar deduções|Ver regras/ }).first().click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/rules$`))
  await expect(page.getByRole('heading', { name: 'Revise cada fonte antes de calcular' })).toBeVisible()
  const confirmRules = page.getByRole('button', { name: 'Confirmar regras desta fonte' })
  if (await confirmRules.isVisible()) {
    await confirmRules.click()
    await page.getByLabel('Por que esta incidência está correta?').fill('Regra sintética conferida para a demonstração automatizada')
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(page.getByText('Regras confirmadas', { exact: true })).toBeVisible()
  } else {
    await expect(page.getByText('1 de 1 fontes prontas', { exact: true })).toBeVisible()
  }
  await page.getByRole('button', { name: 'Continuar para o resultado' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/results$`))
  await expect(page.getByRole('heading', { name: 'Prévia pronta para calcular' })).toBeVisible()
  await page.getByRole('button', { name: 'Calcular resultado' }).click()
  await expect(page.getByRole('heading', { name: 'Cálculo atual' })).toBeVisible()
  await expect(page.getByText('Valor bruto das fontes', { exact: true })).toBeVisible()
  await expect(page.getByText('Produtividade Líquida', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Publicar cálculo revisado' })).toBeVisible()
  await page.getByLabel('Confirmo a publicação financeira deste cálculo').check()
  await page.getByRole('button', { name: 'Publicar financeiramente' }).click()
  await expect(page.getByRole('button', { name: 'Continuar para decisão' })).toBeVisible()
}

async function completeRulesAndResult(page: Page, request: APIRequestContext, state: Runtime, closing: Closing) {
  await completeRulesAndCalculation(page, closing)
  const obligationsBefore = await apiJson<OperationalObligation[]>(request, state, 'get', '/financial-closings/obligations')
  const productivityBefore = obligationsBefore.filter(value => value.domain === 'PRODUCTIVITY').length
  await page.getByRole('button', { name: 'Continuar para decisão' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/decisions$`))
  await expect(page.getByRole('heading', { name: 'Revise antes de criar a proposta' })).toBeVisible()
  await page.getByRole('button', { name: 'Criar proposta' }).click()
  await expect(page.getByRole('heading', { name: 'Proposta preparada' })).toBeVisible()
  await page.getByRole('button', { name: 'Enviar para autorização' }).click()
  await expect(page.getByRole('heading', { name: 'Proposta em autorização' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cobertura pendente' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar cobertura' }).click()
  const coverageDialog = page.getByRole('dialog')
  await coverageDialog.getByRole('textbox', { name: /Justificativa/ }).fill('Entradas sintéticas conferidas na demonstração E2E')
  await coverageDialog.getByLabel('Referência da evidência protegida').fill('e2e:synthetic-coverage')
  await coverageDialog.getByLabel('Confirmo que revisei integralmente as entradas deste cálculo.').check()
  await coverageDialog.getByRole('button', { name: 'Confirmar cobertura', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Cobertura confirmada' })).toBeVisible()
  await page.getByLabel('Justificativa da aprovação').fill('Aprovação sintética final da jornada E2E')
  const approvalRequest = page.waitForRequest(value => value.method() === 'POST' && /\/payout-decisions\/[^/]+\/approve$/.test(new URL(value.url()).pathname))
  await page.getByRole('button', { name: 'Aprovar e emitir obrigações' }).click()
  const capturedApproval = await approvalRequest
  const approvalPayload = capturedApproval.postDataJSON() as { expectedRevision: number; justification: string; idempotencyKey: string }
  await expect(page.getByRole('heading', { name: 'Decisão aprovada' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Histórico preservado' })).toBeVisible()

  let approved: PayoutDecision | undefined
  await expect.poll(async () => {
    const decisions = await apiJson<PayoutDecision[]>(request, state, 'get', `/financial-closings/${closing.id}/payout-decisions`)
    approved = decisions.find(value => value.status === 'APPROVED')
    return approved?.issuedObligationCount ?? 0
  }, { message: 'the approved payout line must be provisioned exactly once' }).toBe(1)
  if (!approved) throw new Error('approved payout decision was not found')

  const replay = await apiJson<PayoutDecision>(request, state, 'post', `/financial-closings/${closing.id}/payout-decisions/${approved.id}/approve`, approvalPayload)
  expect(replay.id).toBe(approved.id)
  const obligations = await apiJson<OperationalObligation[]>(request, state, 'get', '/financial-closings/obligations')
  const productivity = obligations.filter(value => value.domain === 'PRODUCTIVITY')
  expect(productivity).toHaveLength(productivityBefore + 1)
  expect(productivity.filter(value => value.principalAmount === 170)).toHaveLength(productivityBefore + 1)
}

test.describe.configure({ mode: 'serial' })

test('manages multiple editable lots, invalidates stale calculation and separates final publication history', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 3)
  await authenticate(page, state)
  await completeJourney(page, closing)
  await materializeAdditionalLot(page, secondLotFixture)

  const version = closing.currentVersion.versionNumber
  let lots = await apiJson<MaterializedLot[]>(request, state, 'get', `/financial-closings/${closing.id}/versions/${version}/lots`)
  expect(lots.filter(lot => lot.active)).toHaveLength(2)
  const first = expectedResults.scenarios['closing-v31-happy.xlsx']
  const second = expectedResults.scenarios['closing-v31-second-lot.xlsx']
  expect(lots.map(lot => Math.round(lot.additionTotal * 100)).sort((a,b)=>a-b)).toEqual([second.additionTotalCents, first.additionTotalCents].sort((a,b)=>a-b))
  expect(lots.map(lot => Math.round(lot.reversalTotal * 100)).sort((a,b)=>a-b)).toEqual([second.reversalTotalCents, first.reversalTotalCents].sort((a,b)=>a-b))
  await expect(page.locator('.lot')).toHaveCount(2)

  await calculateWithoutPublishing(page, closing)
  await page.getByRole('button', { name: 'Voltar para a competência' }).click()
  const secondLotCard = page.locator('.lot').filter({ hasText: 'Impacto líquido R$ 50,00' })
  page.once('dialog', dialog => dialog.accept())
  await secondLotCard.getByRole('button', { name: 'Retirar esta fonte' }).click()
  await expect(page.getByText(/A base foi alterada após o cálculo da revisão/)).toBeVisible()
  lots = await apiJson<MaterializedLot[]>(request, state, 'get', `/financial-closings/${closing.id}/versions/${version}/lots`)
  expect(lots.filter(lot => lot.active)).toHaveLength(1)
  expect(lots.filter(lot => lot.status === 'CANCELLED')).toHaveLength(1)

  const firstLotCard = page.locator('.lot').filter({ hasText: 'Impacto líquido R$ 200,00' })
  page.once('dialog', dialog => dialog.accept())
  await firstLotCard.getByRole('button', { name: 'Substituir esta fonte' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/new`))
  await materializeAdditionalLot(page, secondLotFixture, false)
  lots = await apiJson<MaterializedLot[]>(request, state, 'get', `/financial-closings/${closing.id}/versions/${version}/lots`)
  expect(lots.filter(lot => lot.active)).toHaveLength(1)
  expect(lots.filter(lot => lot.status === 'CANCELLED')).toHaveLength(2)

  await calculateWithoutPublishing(page, closing)
  await expect(page.getByText('Reversões', { exact: true })).toBeVisible()
  await expect(page.getByText('R$ 25,00', { exact: true }).first()).toBeVisible()
  await page.getByLabel('Confirmo a publicação financeira deste cálculo').check()
  await page.getByRole('button', { name: 'Publicar financeiramente' }).click()
  await expect(page.getByRole('button', { name: 'Continuar para decisão' })).toBeVisible()
  await page.getByRole('button', { name: 'Voltar para a competência' }).click()
  await expect(page.getByText('Resultado publicado financeiramente', { exact: true })).toBeVisible()
  await expect(page.getByText('Incluído em publicação financeira', { exact: false })).toBeVisible()
  await page.getByText(/Histórico de lotes retirados ou substituídos/).click()
  await expect(page.getByText('Esses lotes não participam do cálculo atual e permanecem somente para auditoria.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ver histórico' }).first()).toBeVisible()

  const operations = await apiJson<{ timeline: Array<{ type: string; status: string }> }>(request, state, 'get', `/financial-closings/${closing.id}/operations`)
  expect(operations.timeline.some(event => event.type === 'SOURCE_LOT' && event.status === 'CANCELLED')).toBeTruthy()
  expect(operations.timeline.some(event => event.type === 'FINANCIAL_PUBLICATION')).toBeTruthy()
})

test('V31 publishes the happy path from the panel on desktop', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 9)
  await authenticate(page, state)
  await completeJourney(page, closing)
  await completeRulesAndResult(page, request, state, closing)
})

test('provisions a Margin expense separately from Productivity through the public BFF', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 8, false, true, true, 'UNDISTRIBUTED_POOL', 'MARGIN_DEMO')
  await authenticate(page, state)
  await completeJourney(page, closing)
  await completeRulesAndCalculation(page, closing)
  const obligationsBefore = await apiJson<OperationalObligation[]>(request, state, 'get', '/financial-closings/obligations')
  const marginBefore = obligationsBefore.filter(value => value.domain === 'MARGIN').length

  const created = await apiJson<MarginDecision>(request, state, 'post', `/financial-closings/${closing.id}/margin-decisions`, {
    versionNumber: 1,
    poolKey: 'MARGIN_DEMO',
    allocations: [{
      type: 'EXPENSE_COMMITMENT', amount: 60, purpose: 'Despesa sintética da Margem', dueDate: '2026-09-30',
      categoryKey: 'OPERATIONS',
      beneficiary: { type: 'EXTERNAL_CREDITOR', displayName: 'Fornecedor sintético', externalReference: 'DEMO_VENDOR' },
      beneficiaries: null, evidenceReference: null,
    }],
  })
  expect(created.marginSnapshot).toBe(200)
  const submitted = await apiJson<MarginDecision>(request, state, 'post', `/financial-closings/${closing.id}/margin-decisions/${created.id}/submit`, {
    expectedRevision: created.revision,
  })
  const approval = { expectedRevision: submitted.revision, justification: 'Margem sintética aprovada no E2E', idempotencyKey: `margin-e2e:${closing.id}` }
  const approved = await apiJson<MarginDecision>(request, state, 'post', `/financial-closings/${closing.id}/margin-decisions/${created.id}/approve`, approval)
  expect(approved.status).toBe('APPROVED')

  await expect.poll(async () => {
    const decisions = await apiJson<MarginDecision[]>(request, state, 'get', `/financial-closings/${closing.id}/margin-decisions`)
    return decisions.find(value => value.id === created.id)?.issuedObligationCount ?? 0
  }, { message: 'the approved Margin expense must be provisioned exactly once' }).toBe(1)
  const replay = await apiJson<MarginDecision>(request, state, 'post', `/financial-closings/${closing.id}/margin-decisions/${created.id}/approve`, approval)
  expect(replay.id).toBe(created.id)
  const obligations = await apiJson<OperationalObligation[]>(request, state, 'get', '/financial-closings/obligations')
  const margin = obligations.filter(value => value.domain === 'MARGIN')
  expect(margin).toHaveLength(marginBefore + 1)
  expect(margin.filter(value => value.principalAmount === 60)).toHaveLength(1)
})

test('V31 follows the same path at 360 px without horizontal tables', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 10)
  await page.setViewportSize({ width: 360, height: 800 })
  await authenticate(page, state)
  await completeJourney(page, closing)
  await completeRulesAndResult(page, request, state, closing)
  await expect(page.locator('table')).toHaveCount(0)
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 360)
})

test('V32 resolves an unknown participant explicitly before the atomic workbook publication', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 11, true)
  await authenticate(page, state)
  await completeJourney(page, closing, true)
})

test('V31 keeps source configuration inside the guided wizard', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 12, false, false, false)
  await authenticate(page, state)
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await page.getByRole('button', { name: 'Configurar fonte e perfil' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/[0-9a-f-]+$`))
  await expect(page.getByText('Configurar fonte', { exact: true })).toBeVisible()
  await expect(page.locator('input[type="file"]')).toHaveCount(0)
})

test('V31 resumes a persisted inventoried review after returning to the panel', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 2)
  await authenticate(page, state)
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Escolha as fontes que entram neste lote' })).toBeVisible()
  await page.getByRole('button', { name: 'Salvar e sair' }).click()
  await expect(page.getByText('Revisão em andamento', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Retomar revisão' }).first().click()
  await page.getByLabel('Entendo que acessarei dados protegidos desta importação').check()
  await page.getByRole('button', { name: 'Retomar revisão' }).click()
  await expect(page.getByRole('heading', { name: 'Selecione novamente o mesmo workbook' })).toBeVisible()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await expect(page.getByRole('heading', { name: 'Escolha as fontes que entram neste lote' })).toBeVisible()
})

test('redirects the retired Portuguese import URL to the canonical English route', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 1)
  await authenticate(page, state)
  await page.goto(`/apuracoes/${closing.id}/importacoes/nova`)
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/new$`))
  await expect(page.getByRole('heading', { name: 'Selecione o workbook' })).toBeVisible()
})
