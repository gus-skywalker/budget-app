import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Runtime = { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }
type Closing = { id: string; currentVersion: { versionNumber: number } }

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing-demo/runtime/state.json'), 'utf8')) as Runtime
const fixture = join(process.cwd(), 'e2e/fixtures/closing-v31-happy.xlsx')

function headers(state: Runtime) {
  return { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId }
}

async function apiJson<T>(request: APIRequestContext, state: Runtime, method: 'get'|'post'|'put', path: string, data?: unknown): Promise<T> {
  const response = await request[method](`http://127.0.0.1:${state.apiPort}/api${path}`, { headers: headers(state), data })
  expect(response.ok(), `${method.toUpperCase()} ${path}: ${response.status()} ${await response.text()}`).toBeTruthy()
  return response.status() === 204 ? undefined as T : await response.json() as T
}

async function prepareCompetence(request: APIRequestContext, state: Runtime, month: number, participantReview = false, includeProfile = true, includeSource = true) {
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
      amountColumn: 'amount', occurredOnColumn: 'date', externalReferenceColumn: 'reference', participantColumn: 'responsible',
      participantMappings: participantReview ? {} : { PARTICIPANT: participant.id }, positiveDirection: 'ADDITION', negativeAsReversal: true,
      ignoreTotalsAndFormulas: true, defaultAttributionMethod: 'DIRECT_ATTRIBUTION', decimalSeparator: 'DOT',
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
  for (const label of ['Dados de origem', 'Regras do cálculo', 'Resultado', 'Decisão']) await expect(page.getByText(label, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/nova$`))
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Confira o que entra neste lote' })).toBeVisible()
  await expect(page.getByText('V31_SOURCE', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Resolver fontes selecionadas' }).click()
  if (participantReview) {
    await page.getByLabel('Sim, esta coluna identifica o participante ou beneficiário da apuração').check()
    await page.getByRole('button', { name: /PARTICIPANT · 100%/ }).click()
  }
  await expect(page.getByText('Fonte pronta para o lote', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Preparar lote completo' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/[0-9a-f-]+$`))
  await expect(page.getByRole('heading', { name: 'Fontes preparadas' })).toBeVisible()
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Conferir importação' }).click()
  await expect(page.getByRole('heading', { name: 'Publicar lote' })).toBeVisible()
  await page.getByLabel('Confirmo a publicação financeira deste lote').check()
  await page.getByRole('button', { name: 'Confirmar lote' }).click()
  await expect(page.getByRole('heading', { name: 'Lote publicado' })).toBeVisible()
  await page.getByRole('button', { name: 'Voltar ao painel' }).click()
  await expect(page.getByRole('heading', { name: 'Lote publicado' })).toBeVisible()
}

async function completeRulesAndResult(page: Page, closing: Closing) {
  await page.getByRole('button', { name: 'Revisar regras' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/rules$`))
  await expect(page.getByRole('heading', { name: 'Revise cada fonte antes de calcular' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar regras desta fonte' }).click()
  await page.getByLabel('Por que esta incidência está correta?').fill('Regra sintética conferida para a demonstração automatizada')
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await expect(page.getByText('Regras confirmadas', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar para o resultado' }).click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/results$`))
  await expect(page.getByRole('heading', { name: 'Prévia pronta para calcular' })).toBeVisible()
  await page.getByRole('button', { name: 'Calcular resultado' }).click()
  await expect(page.getByRole('heading', { name: 'Cálculo atual' })).toBeVisible()
  await expect(page.getByText('Produtividade Bruta', { exact: true })).toBeVisible()
  await expect(page.getByText('Produtividade Líquida', { exact: true })).toBeVisible()
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
}

test.describe.configure({ mode: 'serial' })

test('V31 publishes the happy path from the panel on desktop', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 9)
  await authenticate(page, state)
  await completeJourney(page, closing)
  await completeRulesAndResult(page, closing)
})

test('V31 follows the same path at 360 px without horizontal tables', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 10)
  await page.setViewportSize({ width: 360, height: 800 })
  await authenticate(page, state)
  await completeJourney(page, closing)
  await completeRulesAndResult(page, closing)
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
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/nova$`))
  await expect(page.getByText('Configurar fonte', { exact: true })).toBeVisible()
  await expect(page.locator('input[type="file"]')).toHaveCount(0)
})

test('V31 resumes an inventoried workbook after returning to the panel in the same browser session', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 2)
  await authenticate(page, state)
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Confira o que entra neste lote' })).toBeVisible()
  await page.getByRole('button', { name: 'Salvar e sair' }).click()
  await expect(page.getByText('Arquivo pronto para continuar', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar importação' }).click()
  await expect(page.getByRole('heading', { name: 'Confira o que entra neste lote' })).toBeVisible()
  await expect(page.locator('input[type="file"]')).toHaveCount(0)
})

test('redirects the retired Portuguese import URL to the canonical English route', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 1)
  await authenticate(page, state)
  await page.goto(`/apuracoes/${closing.id}/importacoes/nova`)
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/imports/nova$`))
  await expect(page.getByRole('heading', { name: 'Selecione o workbook' })).toBeVisible()
})
