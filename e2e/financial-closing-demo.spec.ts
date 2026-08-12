import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing-demo/runtime/state.json'), 'utf8')) as { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }

async function typeLikeUser(locator: import('@playwright/test').Locator, value: string) {
  await locator.click()
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await locator.pressSequentially(value)
}

test('keeps the previous operation available while V31 is homologated', async ({ page }) => {
  const state = runtime()
  await page.addInitScript(({ token, workspaceId, workspaceName }) => {
    sessionStorage.setItem('userStore', JSON.stringify({ token, auth: true, user: { id: 'demo-owner', username: 'Operador de demonstração', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] }, currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default' }))
  }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName })
  await page.goto('/planning/financial-closings/legacy')
  const cookieDialog = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await cookieDialog.isVisible()) await cookieDialog.getByRole('button', { name: 'Recusar' }).click()
  await expect(page.getByText('Nenhuma apuração encontrada')).toBeVisible()
  await page.getByRole('button', { name: 'Iniciar apuração' }).click()
  await page.getByText('Prefiro configurar fontes manualmente').click()
  await page.getByRole('button', { name: 'Abrir configuração manual' }).click()
  await expect(page.getByText('Configure as fontes e participantes')).toBeVisible()

  const sourceForm = page.locator('form').filter({ hasText: 'Fonte' })
  await typeLikeUser(sourceForm.locator('.v-text-field').filter({ hasText: 'Chave canônica' }).locator('input'), 'BP_PAULISTA')
  await typeLikeUser(sourceForm.locator('.v-text-field').filter({ hasText: 'Nome de exibição' }).locator('input'), 'Repasse BP Paulista — demonstração')
  await sourceForm.getByRole('button', { name: 'Adicionar fonte' }).click()
  await page.getByText('Fontes configuradas', { exact: true }).click()
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
  await page.getByText('Participantes configurados', { exact: true }).click()
  await expect(page.getByText('Daniel Demo').last()).toBeVisible()
  await page.getByRole('button', { name: 'Continuar para importar fonte' }).click()
  await expect(page.getByRole('heading', { name: 'Importar planilha' })).toBeVisible()
  await expect(page.getByText('Revisar ou publicar uma nova versão do perfil')).toBeVisible()
  await expect(page.getByText('Modo técnico legado')).toBeVisible()
})
