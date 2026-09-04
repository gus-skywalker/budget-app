import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Runtime = { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }
type Closing = { id: string; currentVersion: { versionNumber: number } }
type Source = { id: string; sourceKey: string }
type Participant = { id: string; displayName: string }
type Summary = {
  grossProductivityAmount: number; deductionAmount: number; closingAdjustmentAmount: number; netProductivityAmount: number
  participantPayouts: Array<{ participantId: string; productivityAmount: number; tmReserveAmount: number; tiReserveAmount: number; valueReceivableAmount: number }>
}
type Memory = { deductionApplications: Array<{ percentage: number; baseAmount: number; deductionAmount: number; allocations: Array<{ deductionAmount: number }> }>; participantAdjustments: Array<{ participantId: string; direction: string; amount: number; incidenceStage: string; justification: string }> }

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing/runtime/state.json'), 'utf8')) as Runtime
const fixture = join(process.cwd(), 'e2e/fixtures/closing-v31-happy.xlsx')
const expected = JSON.parse(readFileSync(join(process.cwd(), 'e2e/fixtures/expected-results.json'), 'utf8')).scenarios['rules-homologation'] as Record<string, number>
const cents = (value: number) => Math.round(value * 100)

function headers(state: Runtime) {
  return { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId }
}

async function apiJson<T>(request: APIRequestContext, state: Runtime, method: 'get' | 'post' | 'put', path: string, data?: unknown): Promise<T> {
  const response = await request[method](`http://127.0.0.1:${state.apiPort}/api${path}`, { headers: headers(state), data })
  expect(response.ok(), `${method.toUpperCase()} ${path}: ${response.status()} ${await response.text()}`).toBeTruthy()
  return response.status() === 204 ? undefined as T : await response.json() as T
}

async function authenticate(page: Page, state: Runtime) {
  await page.addInitScript(({ token, workspaceId, workspaceName }) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      token, auth: true,
      user: { id: 'demo-owner', username: 'Operador de homologação', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] },
      currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default',
    }))
  }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName })
}

async function closeCookieNotice(page: Page) {
  const dialog = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Recusar' }).click()
}

async function prepare(request: APIRequestContext, state: Runtime): Promise<{ closing: Closing; source: Source; participant: Participant }> {
  const closing = await apiJson<Closing>(request, state, 'post', '/financial-closings', { periodMonth: 6, periodYear: 2026, closingKey: `HOMOLOG_RULES_${Date.now()}`, currency: 'BRL' })
  const version = closing.currentVersion.versionNumber
  // The fixture has an explicit source-sheet signature. Keeping the source key
  // aligned with it proves the guided profile selection rather than bypassing it.
  const source = await apiJson<Source>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/sources`, { sourceKey: 'V31_SOURCE', displayName: 'Fonte sanitizada de incidências' })
  const participant = await apiJson<Participant>(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/participants`, { participantKey: 'HOMOLOG_PARTICIPANT', displayName: 'Participante sanitizado', active: true })
  await apiJson<void>(request, state, 'put', `/financial-closings/${closing.id}/sensitive-access-grants`, { userId: 'demo-owner', confirmed: true })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/source-retentions`, {
    sourceKey: source.sourceKey, displayName: 'Sem dedução inicial nesta fonte', percentage: 0,
    justification: 'Declaração sintética explícita antes da regra de homologação',
  })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/participant-scores`, { participantId: participant.id, score: 85, justification: 'Pontuação sintética de homologação' })
  await apiJson(request, state, 'post', `/financial-closings/${closing.id}/versions/${version}/import-profiles`, {
    profileKey: 'HOMOLOG_RULES_XLSX', displayName: 'Perfil sanitizado de incidências', sourceKey: source.sourceKey,
    config: { format: 'XLSX', expectedSheet: 'V31_SOURCE', itemKeyColumn: 'reference', itemKeyColumns: ['reference'], amountColumn: 'amount', occurredOnColumn: 'date', externalReferenceColumn: 'reference', participantColumn: 'responsible', participantMappings: { PARTICIPANT: participant.id }, positiveDirection: 'ADDITION', negativeAsReversal: true, ignoreTotalsAndFormulas: true, defaultAttributionMethod: 'DIRECT_ATTRIBUTION', decimalSeparator: 'DOT', headerSignature: ['reference', 'amount', 'date', 'responsible'], multiplicityPolicy: 'REQUIRES_UNIQUE_EXTERNAL_IDENTITY', monetaryFormat: { groupingSeparator: 'NONE', prefix: null, suffix: null, normalizeSpaces: true } },
  })
  return { closing, source, participant }
}

async function materialize(page: Page, closing: Closing) {
  await page.goto(`/planning/financial-closings?closingId=${closing.id}`)
  await closeCookieNotice(page)
  await page.getByRole('button', { name: 'Importar workbook' }).click()
  await page.getByLabel('Entendo que acessarei dados protegidos nesta leitura').check()
  await page.locator('input[type="file"]').setInputFiles(fixture)
  await page.getByRole('button', { name: 'Identificar fontes' }).click()
  await expect(page.getByRole('heading', { name: 'Escolha as fontes que entram neste lote' })).toBeVisible()
  await expect(page.getByText('V31_SOURCE', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Revisar fontes deste lote' })).toBeEnabled()
  await page.getByRole('button', { name: 'Revisar fontes deste lote' }).click()
  await expect(page.getByText('Fonte pronta para o lote', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Preparar lote completo' }).click()
  await page.getByRole('button', { name: 'Conferir importação' }).click()
  await page.getByLabel('Confirmo que estas fontes entram na revisão do cálculo').check()
  await page.getByRole('button', { name: 'Materializar fontes' }).click()
  await page.getByRole('button', { name: 'Voltar ao painel' }).click()
}

async function chooseOption(page: Page, label: string, option: string) {
  const field = page.getByText(label, { exact: true }).locator('xpath=ancestor::*[contains(@class,"v-input")][1]')
  await field.getByRole('combobox').first().click()
  await page.locator('.v-overlay-container').getByText(option, { exact: true }).click()
  await page.keyboard.press('Escape')
}

test('homologates deduction, adjustment, reserves and receivable in exact cents through the public UI', async ({ page, request }) => {
  const state = runtime()
  const { closing, participant } = await prepare(request, state)
  await authenticate(page, state)
  await materialize(page, closing)

  await page.getByRole('button', { name: /Revisar regras|Ver regras/ }).first().click()
  await expect(page).toHaveURL(new RegExp(`/financial-closings/${closing.id}/rules$`))

  await page.getByLabel('Nome da dedução').fill('Imposto sintético da fonte')
  await page.getByLabel('Percentual').first().fill('13.33')
  await page.getByLabel('Justificativa da revisão').first().fill('Incidência sanitizada conferida para homologação')
  await page.getByRole('button', { name: 'Adicionar regra' }).click()
  await expect(page.getByText('Imposto sintético da fonte', { exact: true })).toBeVisible()

  await chooseOption(page, 'Participante', 'Participante sanitizado')
  await chooseOption(page, 'Efeito no valor', 'Desconto')
  await page.getByRole('spinbutton', { name: 'Valor Valor' }).fill('1.34')
  await page.getByLabel('Justificativa do ajuste').fill('Ajuste sanitizado posterior às deduções')
  await page.getByRole('button', { name: 'Adicionar ajuste individual' }).click()

  await page.getByLabel('Nome da regra').fill('TM sintética')
  await page.getByLabel('Percentual da PL').fill('10')
  await page.getByLabel('Justificativa da revisão').last().fill('Reserva TM sanitizada')
  await page.getByRole('button', { name: 'Adicionar reserva opcional' }).click()
  await chooseOption(page, 'Tipo de reserva', 'TI')
  await page.getByLabel('Nome da regra').fill('TI sintética')
  await page.getByLabel('Percentual da PL').fill('5')
  await page.getByLabel('Justificativa da revisão').last().fill('Reserva TI sanitizada')
  await page.getByRole('button', { name: 'Adicionar reserva opcional' }).click()

  await page.getByRole('button', { name: 'Confirmar regras desta fonte' }).click()
  await page.getByLabel('Por que esta incidência está correta?').fill('Deduções e ajustes sanitizados conferidos em centavos')
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await page.getByRole('button', { name: 'Continuar para o resultado' }).click()
  await page.getByRole('button', { name: 'Calcular resultado' }).click()
  await expect(page.getByRole('heading', { name: 'Cálculo atual' })).toBeVisible()
  await expect(page.getByText('R$ 172,00', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('R$ 146,20', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Ajuste sanitizado posterior às deduções', { exact: true })).toBeVisible()
  await expect(page.getByText('−R$ 1,34', { exact: true })).toBeVisible()

  const version = closing.currentVersion.versionNumber
  const summary = await apiJson<Summary>(request, state, 'get', `/financial-closings/${closing.id}/versions/${version}/summary`)
  expect(cents(summary.grossProductivityAmount)).toBe(expected.sourceGrossCents)
  expect(cents(summary.deductionAmount)).toBe(expected.sourceDeductionCents)
  expect(cents(summary.closingAdjustmentAmount)).toBe(expected.closingAdjustmentCents)
  expect(cents(summary.netProductivityAmount)).toBe(expected.productivityCents)
  const payout = summary.participantPayouts.find(value => value.participantId === participant.id)
  expect(payout).toBeDefined()
  expect(cents(payout!.productivityAmount)).toBe(expected.productivityCents)
  expect(cents(payout!.tmReserveAmount)).toBe(expected.tmReserveCents)
  expect(cents(payout!.tiReserveAmount)).toBe(expected.tiReserveCents)
  expect(cents(payout!.valueReceivableAmount)).toBe(expected.valueReceivableCents)

  const memory = await apiJson<Memory>(request, state, 'get', `/financial-closings/${closing.id}/versions/${version}/calculation-memory`)
  expect(memory.deductionApplications).toHaveLength(1)
  expect(memory.deductionApplications[0].percentage).toBe(13.33)
  expect(cents(memory.deductionApplications[0].baseAmount)).toBe(expected.sourceGrossCents)
  expect(cents(memory.deductionApplications[0].deductionAmount)).toBe(expected.sourceDeductionCents)
  expect(cents(memory.deductionApplications[0].allocations[0].deductionAmount)).toBe(expected.sourceDeductionCents)
  expect(memory.participantAdjustments).toEqual([expect.objectContaining({ participantId: participant.id, direction: 'DECREASE', incidenceStage: 'AFTER_DEDUCTIONS', justification: 'Ajuste sanitizado posterior às deduções' })])
  expect(cents(memory.participantAdjustments[0].amount)).toBe(Math.abs(expected.participantAdjustmentCents))

  await page.getByLabel('Confirmo a publicação financeira deste cálculo').check()
  await page.getByRole('button', { name: 'Publicar financeiramente' }).click()
  await expect(page.getByRole('button', { name: 'Continuar para decisão' })).toBeVisible()
})
