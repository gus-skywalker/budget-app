import { expect, test } from '@playwright/test'
import { createSign } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type Runtime = { apiPort: number; workspaceId: string; workspaceName: string; accessToken: string }
const runtime = () => JSON.parse(readFileSync(join(process.cwd(), 'test-results/financial-closing/runtime/state.json'), 'utf8')) as Runtime
const syntheticToken = (claims: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'financial-closing-demo', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const payload = Buffer.from(JSON.stringify({ iss: 'cobudget-demo', iat: now, exp: now + 3600, ...claims })).toString('base64url')
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  const key = readFileSync(join(process.cwd(), 'test-results/financial-closing/runtime/demo-private.pem'), 'utf8')
  return `${unsigned}.${signer.sign(key).toString('base64url')}`
}

for (const viewport of [
  { name: 'desktop-light', width: 1440, height: 960, theme: 'light' },
  { name: 'mobile-dark', width: 360, height: 800, theme: 'dark' },
] as const) {
  test(`opens all six settings tabs with an authenticated synthetic owner on ${viewport.name}`, async ({ page }) => {
    const state = runtime()
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.addInitScript(({ token, workspaceId, workspaceName, theme }) => {
      sessionStorage.setItem('userStore', JSON.stringify({
        token, auth: true,
        user: { id: 'demo-owner', username: 'Operador de homologação', language: 'PT', userRoles: ['ROLE_ADMIN'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_OWNER' }] },
        currentWorkspaceId: workspaceId, tenantRole: 'ROLE_OWNER', language: 'PT', appVoice: 'default', preferredTheme: theme,
      }))
    }, { token: state.accessToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName, theme: viewport.theme })
    await page.goto('/settings?tab=profile')
    const notice = page.getByRole('alertdialog', { name: 'Aviso' })
    if (await notice.isVisible()) await notice.getByRole('button', { name: 'Recusar' }).click()
    const securityNotice = page.getByRole('button', { name: 'Dispensar informativo de segurança' })
    if (await securityNotice.isVisible()) await securityNotice.click()

    for (const [tab, label] of [
      ['profile', 'Perfil'], ['security', 'Segurança'], ['preferences', 'Preferências'],
      ['workspace', 'Espaço'], ['connections', 'Conexões'], ['subscription', 'Assinatura'],
    ] as const) {
      await page.getByRole('tab', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`[?&]tab=${tab}(?:&|$)`))
      await expect(page.locator('.v-window-item--active')).toBeVisible()
      await expect.poll(() => page.locator('.v-window').evaluate(element =>
        element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length,
      )).toBe(0)
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
      if (viewport.name === 'mobile-dark') await page.screenshot({ path: test.info().outputPath(`settings-${tab}.png`), fullPage: true })
    }
  })
}

test('honors a real read-only workspace membership across settings and activity', async ({ page, request }) => {
  const state = runtime()
  const base = `http://127.0.0.1:${state.apiPort}/api`
  const email = 'ev16-viewer@example.test'
  const ownerToken = syntheticToken({
    sub: 'demo-owner', user_id: 'demo-owner', user_email: 'owner@example.test', email_verified: true,
    user_fullname: 'Operador de demonstração', userRoles: ['ROLE_ADMIN'], groups: ['ROLE_ADMIN'],
    tenantRole: 'ROLE_OWNER', workspaceId: state.workspaceId,
  })
  const invitation = await request.post(`${base}/workspaces/${state.workspaceId}/invites`, {
    headers: { Authorization: `Bearer ${ownerToken}`, 'X-Workspace-Id': state.workspaceId },
    data: { email, tenantRole: 'ROLE_VIEWER' },
  })
  expect(invitation.status()).toBe(201)
  const invite = await invitation.json() as { inviteToken: string; emailDispatchStatus: string }
  expect(invite.emailDispatchStatus).toBe('ACCEPTED_BY_PROVIDER')

  const viewerToken = syntheticToken({
    sub: 'ev16-viewer', user_id: 'ev16-viewer', user_email: email, email_verified: true,
    user_fullname: 'Pessoa somente leitura', userRoles: ['ROLE_USER'], groups: ['ROLE_USER'],
    tenantRole: 'ROLE_VIEWER', workspaceId: state.workspaceId,
  })
  const acceptance = await request.post(`${base}/invites/accept?token=${encodeURIComponent(invite.inviteToken)}`, {
    headers: { Authorization: `Bearer ${viewerToken}` },
  })
  expect(acceptance.status()).toBe(200)
  expect((await acceptance.json() as { membershipMaterialized: boolean }).membershipMaterialized).toBe(true)

  await page.setViewportSize({ width: 360, height: 800 })
  await page.addInitScript(({ token, workspaceId, workspaceName, emailAddress }) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      token, auth: true,
      user: { id: 'ev16-viewer', email: emailAddress, username: 'Pessoa somente leitura', language: 'PT', userRoles: ['ROLE_USER'], workspaces: [{ workspaceId, workspaceName, role: 'ROLE_VIEWER' }] },
      currentWorkspaceId: workspaceId, tenantRole: 'ROLE_VIEWER', language: 'PT', appVoice: 'default', preferredTheme: 'dark',
    }))
  }, { token: viewerToken, workspaceId: state.workspaceId, workspaceName: state.workspaceName, emailAddress: email })
  await page.goto('/settings?tab=workspace')
  const notice = page.getByRole('alertdialog', { name: 'Aviso' })
  if (await notice.isVisible()) await notice.getByRole('button', { name: 'Recusar' }).click()
  const securityNotice = page.getByRole('button', { name: 'Dispensar informativo de segurança' })
  if (await securityNotice.isVisible()) await securityNotice.click()

  await expect(page.getByText('Seu acesso permite visualizar os membros e sair do espaço.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar convite' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Salvar alterações' })).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: /Nome do espaço/ })).not.toBeEditable()
  await expect(page.getByRole('textbox', { name: /Descrição do espaço/ })).not.toBeEditable()
  await expect(page.getByText('Visualizador', { exact: true }).first()).toBeVisible()
  const workspaceHeader = page.locator('.workspace-settings .cb-card__header').first()
  const titleBox = await workspaceHeader.locator('h3').boundingBox()
  const descriptionBox = await workspaceHeader.locator('p').boundingBox()
  expect(titleBox && descriptionBox && descriptionBox.y >= titleBox.y + titleBox.height).toBe(true)
  expect(await workspaceHeader.locator('p').evaluate(element => getComputedStyle(element).color)).toBe('rgb(203, 213, 225)')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  await page.screenshot({ path: test.info().outputPath('settings-viewer-dark.png'), fullPage: true })

  await page.goto('/activity')
  await expect(page.getByRole('heading', { name: /Atividade/ })).toBeVisible()
  await expect(page.getByText('Não foi possível carregar', { exact: false })).toHaveCount(0)
})
