import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Runtime = { workspaceId: string; workspaceName: string; accessToken: string }

const runtime = () => JSON.parse(
  readFileSync(join(process.cwd(), 'test-results/financial-closing/runtime/state.json'), 'utf8'),
) as Runtime

test('cria uma competência exclusivamente pela interface pública', async ({ page }) => {
  const { workspaceId, workspaceName, accessToken } = runtime()
  await page.addInitScript(({ token, id, name }) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      token,
      auth: true,
      user: {
        id: 'demo-owner', username: 'Operador de UI', language: 'PT', userRoles: ['ROLE_ADMIN'],
        workspaces: [{ workspaceId: id, workspaceName: name, role: 'ROLE_OWNER' }],
      },
      currentWorkspaceId: id, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default',
    }))
  }, { token: accessToken, id: workspaceId, name: workspaceName })

  await page.goto('/planning/financial-closings')
  const cookieNotice = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await cookieNotice.isVisible()) await cookieNotice.getByRole('button', { name: 'Recusar' }).click()

  await expect(page.getByRole('heading', { name: 'Apuração de resultados' })).toBeVisible()
  await page.getByRole('button', { name: 'Abrir ou criar competência' }).click()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: '07' }).click()
  await page.getByRole('spinbutton', { name: 'Ano Ano' }).fill('2026')
  await page.getByRole('button', { name: 'Criar competência', exact: true }).click()

  await expect(page.getByRole('region', { name: 'Competência atual' })).toContainText('07/2026')
  await expect(page.getByRole('main', { name: 'Etapas do fechamento' })).toBeVisible()
  await expect(page.getByText('Base editável', { exact: true })).toBeVisible()
  await expect(page).not.toHaveURL(/:8081/)
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).join(','))).toBe('')
})
