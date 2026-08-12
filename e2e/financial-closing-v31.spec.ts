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

async function prepareCompetence(request: APIRequestContext, state: Runtime, month: number) {
  const closing = await apiJson<Closing>(request, state, 'post', '/financial-closings', {
    periodMonth: month, periodYear: 2026, closingKey: 'DEFAULT', currency: 'BRL',
  })
  const version = closing.currentVersion.versionNumber
  const source = await apiJson<{ id: string; sourceKey: string }>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/sources`, {
    sourceKey: 'V31_SOURCE', displayName: 'Fonte sintética V31',
  })
  const participant = await apiJson<{ id: string }>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/participants`, {
    participantKey: `PARTICIPANT_${month}`, displayName: `Participante sintético ${month}`, active: true,
  })
  await apiJson<void>(request, state, 'put', `/financial-closings/${closing.id}/sensitive-access-grants`, { userId: 'demo-owner', confirmed: true })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/source-retentions`, {
    sourceKey: source.sourceKey, displayName: 'Sem dedução nesta fonte', percentage: 0, justification: 'Regra sintética explícita para o E2E V31',
  })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/import-profiles`, {
    profileKey: 'V31_HAPPY_PATH', displayName: 'Perfil sintético V31', sourceKey: source.sourceKey,
    config: {
      format: 'XLSX', expectedSheet: 'V31_SOURCE', itemKeyColumn: 'reference', itemKeyColumns: ['reference'],
      amountColumn: 'amount', occurredOnColumn: 'date', externalReferenceColumn: 'reference', participantColumn: 'responsible',
      participantMappings: { PARTICIPANT: participant.id }, positiveDirection: 'ADDITION', negativeAsReversal: true,
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

async function completeJourney(page: Page, closing: Closing) {
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await expect(page.getByRole('main', { name: 'Etapas do fechamento' })).toBeVisible()
  for (const label of ['Dados de origem', 'Regras do cálculo', 'Resultado', 'Decisão']) await expect(page.getByText(label, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await expect(page).toHaveURL(new RegExp(`/apuracoes/${closing.id}/importacoes/nova$`))
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Confira o que será preparado' })).toBeVisible()
  await expect(page.getByText('V31_SOURCE', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Preparar fontes reconhecidas' }).click()
  await expect(page).toHaveURL(new RegExp(`/apuracoes/${closing.id}/importacoes/[0-9a-f-]+$`))
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

test.describe.configure({ mode: 'serial' })

test('V31 publishes the happy path from the panel on desktop', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 9)
  await authenticate(page, state)
  await completeJourney(page, closing)
})

test('V31 follows the same path at 360 px without horizontal tables', async ({ page, request }) => {
  const state = runtime()
  const closing = await prepareCompetence(request, state, 10)
  await page.setViewportSize({ width: 360, height: 800 })
  await authenticate(page, state)
  await completeJourney(page, closing)
  await expect(page.locator('table')).toHaveCount(0)
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 360)
})
