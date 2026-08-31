import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing-demo/runtime/state.json'), 'utf8')) as { workspaceId: string; workspaceName: string; accessToken: string }

test('keeps the legacy operation isolated from the canonical guided journey', async ({ page }) => {
  const state = runtime()
  await page.addInitScript(({ token, workspaceId, workspaceName }) => {
    sessionStorage.setItem('userStore', JSON.stringify({ token, auth: true, user: { id: 'demo-owner', username: 'Demo operator', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] }, currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default' }))
  }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName })
  await page.goto('/planning/financial-closings')
  const cookieDialog = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await cookieDialog.isVisible()) await cookieDialog.getByRole('button', { name: 'Recusar' }).click()
  await expect(page.getByRole('heading', { name: 'Apuração de resultados' })).toBeVisible()
  await expect(page.getByText('Abrir operação completa anterior')).toHaveCount(0)
})
