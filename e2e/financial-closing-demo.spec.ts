import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing-demo/runtime/state.json'), 'utf8')) as { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }

async function choose(page: import('@playwright/test').Page, label: string, option: string) {
  const control = page.locator('.v-select').filter({ hasText: label }).first()
  await control.click()
  await page.getByRole('option', { name: option, exact: true }).last().click()
}

async function typeLikeUser(locator: import('@playwright/test').Locator, value: string) {
  await locator.click()
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await locator.pressSequentially(value)
}

test('records the real assisted-import journey with synthetic data only', async ({ page, request }) => {
  const state = runtime()
  await page.addInitScript(({ token, workspaceId, workspaceName }) => {
    sessionStorage.setItem('userStore', JSON.stringify({ token, auth: true, user: { id: 'demo-owner', username: 'Operador de demonstração', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] }, currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default' }))
  }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName })
  await page.goto('/planning/financial-closings')
  const cookieDialog = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await cookieDialog.isVisible()) await cookieDialog.getByRole('button', { name: 'Recusar' }).click()
  await expect(page.getByText('Nenhuma apuração encontrada')).toBeVisible()
  await page.getByRole('button', { name: 'Iniciar apuração' }).click()
  await expect(page.getByText('Configure as fontes e participantes')).toBeVisible()

  const sourceForm = page.locator('form').filter({ hasText: 'Fonte' })
  await typeLikeUser(sourceForm.locator('.v-text-field').filter({ hasText: 'Chave canônica' }).locator('input'), 'BP_PAULISTA')
  await typeLikeUser(sourceForm.locator('.v-text-field').filter({ hasText: 'Nome de exibição' }).locator('input'), 'Repasse BP Paulista — demonstração')
  await sourceForm.getByRole('button', { name: 'Adicionar fonte' }).click()
  await page.getByText('Fontes configuradas (use o ID na planilha)').click()
  await expect(page.getByText('Repasse BP Paulista — demonstração').last()).toBeVisible()

  const participantForm = page.locator('form').filter({ hasText: 'Participante' })
  await expect(participantForm).toHaveCount(1)
  const participantKey = participantForm.locator('.v-text-field').filter({ hasText: 'Chave canônica' }).locator('input')
  const participantName = participantForm.locator('.v-text-field').filter({ hasText: 'Nome de exibição' }).locator('input')
  for (const [key, name] of [['ANA_DEMO', 'Ana Demo'], ['BRUNO_DEMO', 'Bruno Demo'], ['CARLA_DEMO', 'Carla Demo'], ['DANIEL_DEMO', 'Daniel Demo']]) {
    await typeLikeUser(participantName, name)
    await expect(participantName).toHaveValue(name)
    await typeLikeUser(participantKey, key)
    await expect(participantKey).toHaveValue(key)
    await participantForm.getByRole('button', { name: 'Adicionar participante' }).click()
  }
  await page.getByText('Participantes configurados (use o ID na planilha)').click()
  await expect(page.getByText('Daniel Demo').last()).toBeVisible()

  const closingsResponse = await request.get(`http://127.0.0.1:${state.apiPort}/api/financial-closings`, {
    headers: { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId },
  })
  expect(closingsResponse.status()).toBe(200)
  const closings = await closingsResponse.json() as Array<{ id: string }>
  const closingId = closings[0]?.id
  expect(closingId).toBeTruthy()
  const grantResponse = await request.put(
    `http://127.0.0.1:${state.apiPort}/api/financial-closings/${closingId}/sensitive-access-grants`,
    { headers: { Authorization: `Bearer ${state.accessToken}`, 'X-Workspace-Id': state.workspaceId }, data: { userId: 'demo-owner' } },
  )
  expect(grantResponse.status(), await grantResponse.text()).toBe(204)

  await page.getByText('Mapeamento explícito de colunas').click()
  await page.getByLabel('Chave do item *').fill('referencia')
  await page.getByLabel('Valor *').fill('valor')
  await page.getByLabel('Data *').fill('data')
  await page.getByLabel('Referência externa').fill('referencia')
  await page.getByLabel('Participante como aparece no arquivo (perfil)').fill('executor')
  await page.getByText('Mapear manualmente ou salvar perfil').click()
  await page.getByLabel('Chave do perfil').fill('REPASSE_BP_PAULISTA')
  await page.getByLabel('Nome do perfil').fill('Repasse BP Paulista')
  await choose(page, 'Fonte da competência', 'Repasse BP Paulista — demonstração')
  for (const [external, participant] of [['ANA_DEMO', 'Ana Demo'], ['BRUNO_DEMO', 'Bruno Demo'], ['CARLA_DEMO', 'Carla Demo']]) {
    await page.getByLabel('Participante como aparece no arquivo').first().fill(external)
    await choose(page, 'Participante canônico', participant)
    await page.getByRole('button', { name: 'Adicionar mapeamento' }).click()
  }
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByText('Perfil salvo como nova versão')).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles(join(process.cwd(), 'e2e/fixtures/repasse-bp-paulista-demo.csv'))
  await page.getByRole('button', { name: 'Validar com perfil' }).click()
  await expect(page.getByText('UNMAPPED_PARTICIPANT')).toBeVisible()
  await expect(page.getByText('3 ignorada(s)')).toBeVisible()
  await expect(page.getByText('O perfil encontrou exceções')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar com perfil' })).toBeDisabled()

  await page.getByLabel('Participante como aparece no arquivo').first().fill('DANIEL_DEMO')
  await choose(page, 'Participante canônico', 'Daniel Demo')
  await page.getByRole('button', { name: 'Adicionar mapeamento' }).click()
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await page.getByRole('button', { name: 'Validar com perfil' }).click()
  await expect(page.getByText('Arquivo válido para este perfil')).toBeVisible()
  await expect(page.getByText('adições R$ 375,00')).toBeVisible()
  await expect(page.getByText('reversões R$ 30,00')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar com perfil' }).click()
  await expect(page.getByText('Confirmada', { exact: true })).toBeVisible({ timeout: 20_000 })
  await page.getByRole('button', { name: 'Recalcular' }).click()
  await expect(page.getByText('Produtividade Líquida')).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Produtividade Líquida' }).getByRole('strong')).toHaveText('R$ 345,00')
  await page.getByRole('heading', { name: 'Linha do tempo', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByText('Planilha importada', { exact: true })).toBeVisible()
  await expect(page.getByText('Cálculo da apuração', { exact: true })).toBeVisible()
  await page.getByRole('heading', { name: 'Cobertura bancária' }).scrollIntoViewIfNeeded()
  await expect(page.getByText('Conciliação de entrada', { exact: true })).toBeVisible()

  await page.getByRole('heading', { name: 'Importar planilha' }).scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Confirmar com perfil' }).click()
  await expect(page.getByText('resultado original foi reutilizado')).toBeVisible()
  await expect(page.getByText('Conciliação de entrada', { exact: true })).toBeVisible()
})
