import { expect, test, type Page, type Locator } from '@playwright/test'

// Synthetic fixtures: no bank data, credentials or real financial commands.
async function journeyFixture(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript(theme => {
    sessionStorage.setItem('userStore', JSON.stringify({ auth: true, token: null,
      user: { id: 'fixture-user', username: 'Pessoa de teste', language: 'PT', workspaces: [{ workspaceId: 'fixture-workspace', workspaceName: 'Meu espaço de teste', role: 'ROLE_OWNER' }] },
      currentWorkspaceId: 'fixture-workspace', tenantRole: 'ROLE_OWNER', language: 'PT', preferredTheme: theme,
    }))
  }, theme)
  const writes: { path: string; body: any }[] = []
  const plan = { id: 'fixture-budget', periodMonth: 10, periodYear: 2026, totalIncome: 3000, totalExpense: 2000, net: 1000, lines: [] }
  const result = { sourceType: 'BUDGET_BASED', scenarioName: 'Mudança de teste', months: 6,
    currentBalance: 1000, baselineMonthlyNet: 1000, scenarioMonthlyImpact: -100,
    projectedFinalBalance: 6400, decisionStatus: 'STABLE', firstRiskMonth: null, availableForGoals: 0,
    impactedGoalsCount: 0, forecast: [], impactedGoalNames: [], projection: [],
  }
  let saved: any = null
  let decision: any = null
  await page.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== 'http://127.0.0.1:5187') return route.abort()
    if (!url.pathname.startsWith('/fixture-api')) return route.continue()
    const path = url.pathname
    if (request.method() !== 'GET') {
      writes.push({ path, body: request.postData() ? request.postDataJSON() : null })
      if (path.endsWith('/scenarios/simulate')) return route.fulfill({ json: result })
      if (path.endsWith('/scenarios/save')) {
        saved = { ...result, ...request.postDataJSON(), id: 'journey-saved', lines: [] }
        return route.fulfill({ json: saved })
      }
      if (path.endsWith('/decisions/from-scenario/journey-saved')) {
        decision = { id: 'journey-decision', scenarioId: saved.id, title: saved.name, status: 'OPEN', approveVotes: 0, rejectVotes: 0, canCurrentUserApply: false, applyBlockedReason: 'Bloqueio sintético de homologação', comments: [], votes: [] }
        return route.fulfill({ json: decision })
      }
      throw new Error(`Unexpected synthetic write: ${request.method()} ${path}`)
    }
    const data = path.endsWith('/billing/access') ? { capabilities: { advancedScenariosEnabled: true, collaborationEnabled: true }, hasPremiumAccess: true }
      : path.endsWith('/budgets/current') ? plan
      : path.endsWith('/scenarios') ? saved ? [saved] : []
      : path.endsWith('/decisions') ? decision ? [decision] : []
      : path.endsWith('/unread-count') ? { unreadCount: 0 }
      : path.endsWith('/workspaces/fixture-workspace') ? { workspaceId: 'fixture-workspace', workspaceName: 'Meu espaço de teste', role: 'ROLE_OWNER' }
      : []
    return route.fulfill({ json: data })
  })
  return { writes }
}

async function enterPremises(page: Page) {
  await page.goto('/planning/decide')
  await page.locator('.security-notice__close').click()
  const intent = page.locator('[data-intent="monthly-change"]')
  await intent.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/planning\/scenarios\/new/)
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'O que vai mudar?' })).toBeFocused()
}

async function contrast(locator: Locator) {
  return locator.evaluate(element => {
    const rgb = (value: string) => (value.match(/[\d.]+/g) || []).map(Number)
    const blend = (front: number[], back: number[]) => front.slice(0, 3).map((v, i) => v * (front[3] ?? 1) + back[i] * (1 - (front[3] ?? 1)))
    const luminance = (color: number[]) => color.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
    const ancestors: Element[] = []
    for (let el: Element | null = element; el; el = el.parentElement) ancestors.unshift(el)
    let background = [255, 255, 255]
    for (const el of ancestors) background = blend(rgb(getComputedStyle(el).backgroundColor), background)
    const foreground = blend(rgb(getComputedStyle(element).color), background)
    const [a, b] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    return { ratio: (a + 0.05) / (b + 0.05), foreground, background }
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [360, 1440]) {
    test(`ED-07: intention to saved decision, focus and contrast ${theme}/${width}`, async ({ page }, info) => {
      const { writes } = await journeyFixture(page, theme)
      await page.setViewportSize({ width, height: 1000 })
      await enterPremises(page)
      const card = page.locator('.scenario-change-card')
      await card.getByRole('textbox', { name: 'Dê um nome à mudança (opcional)' }).fill('Curso de teste')
      await card.getByRole('spinbutton', { name: 'Qual é o valor por mês?' }).fill('100')
      await page.getByText('Mais opções: nome, período e valores do plano', { exact: true }).click()
      await page.getByRole('textbox', { name: /Nome deste teste/ }).fill('Homologação ED-07')
      await page.getByRole('button', { name: 'Próximo', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Confira antes de testar' })).toBeFocused()
      await page.getByRole('button', { name: 'Voltar', exact: true }).click()
      await expect(card.getByRole('spinbutton', { name: 'Qual é o valor por mês?' })).toHaveValue('100')
      await page.getByRole('button', { name: 'Próximo', exact: true }).click()
      const simulate = page.getByRole('button', { name: 'Ver o impacto', exact: true })
      await simulate.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/preview\?simulatedAt=/)
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      expect(writes.map(w => w.path)).toEqual(['/fixture-api/scenarios/simulate'])
      expect(writes[0].body.deltas).toEqual([{ label: 'Curso de teste', type: 'MONTHLY_EXPENSE', temporalType: 'ONGOING', amount: 100, startMonthOffset: 0 }])
      const evidence = page.getByTestId('result-evidence')
      await evidence.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(evidence).toHaveAttribute('open', '')
      await page.keyboard.press('Enter')
      const save = page.getByRole('button', { name: 'Salvar simulação', exact: true })
      const measured = await contrast(save)
      await info.attach('primary-contrast.json', { body: JSON.stringify(measured), contentType: 'application/json' })
      console.log(`ED-07 contrast ${theme}/${width}: ${measured.ratio.toFixed(2)}:1`)
      expect(measured.ratio).toBeGreaterThanOrEqual(4.5)
      await save.click()
      await expect(page).toHaveURL(/journey-saved$/)
      expect(writes.filter(w => w.path.endsWith('/save'))).toHaveLength(1)
      expect(writes.some(w => w.path.includes('/decisions/'))).toBe(false)
      await page.getByRole('button', { name: 'Criar decisão', exact: true }).click()
      await expect(page).toHaveURL(/\/decisions\?scenarios=journey-saved/)
      await expect(page.getByText('Decisão em aberto', { exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Homologação ED-07', exact: true })).toBeVisible()
      await expect(page.locator('.cb-decision-card__blocked-hint')).toHaveText('Bloqueio sintético de homologação')
      await expect(page.getByRole('button', { name: 'Aplicar ao plano', exact: true })).toBeDisabled()
      expect(writes.filter(w => w.path.includes('/from-scenario/'))).toHaveLength(1)
      expect(writes.some(w => w.path.endsWith('/apply'))).toBe(false)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.screenshot({ path: info.outputPath(`journey-${theme}-${width}.png`), fullPage: true, animations: 'disabled' })
    })
  }
}

test('ED-07: refreshing the guided draft preserves entered premises', async ({ page }) => {
  await journeyFixture(page, 'light')
  await enterPremises(page)
  const amount = page.getByRole('spinbutton', { name: 'Qual é o valor por mês?' })
  await amount.fill('137')
  await page.reload()
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  await expect(amount).toHaveValue('137')
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  await page.getByRole('button', { name: 'Ver o impacto', exact: true }).click()
  await expect(page).toHaveURL(/\/preview\?simulatedAt=/)
  await page.goBack()
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  await expect(amount).toHaveValue('137')
})

test('ED-07: heading and page actions are not covered by app chrome after scrolling', async ({ page }) => {
  await journeyFixture(page, 'light')
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/decisions')
  await page.locator('.security-notice__close').click()
  const title = page.getByRole('heading', { level: 1 })
  await title.evaluate(el => el.scrollIntoView({ block: 'start' }))
  expect(await title.evaluate(el => {
    const box = el.getBoundingClientRect()
    const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
    return top === el || el.contains(top)
  })).toBe(true)
})

test('ED-07: no-change explanation and simulation error are associated with the action', async ({ page }) => {
  const { writes } = await journeyFixture(page, 'light')
  await enterPremises(page)
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  const simulate = page.getByRole('button', { name: 'Ver o impacto', exact: true })
  await expect(simulate).toBeDisabled()
  await expect(simulate).toHaveAttribute('aria-describedby', 'scenario-no-changes')
  await expect(page.locator('#scenario-no-changes')).toBeVisible()
  await page.getByRole('button', { name: 'Voltar', exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Qual é o valor por mês?' }).fill('100')
  await page.getByRole('button', { name: 'Próximo', exact: true }).click()
  await page.route('**/fixture-api/scenarios/simulate', route => route.fulfill({ status: 503, json: { message: 'Synthetic error' } }))
  await simulate.click()
  await expect(page.locator('#scenario-simulation-error')).toHaveAttribute('role', 'alert')
  await expect(simulate).toHaveAttribute('aria-describedby', 'scenario-simulation-error')
  await expect(simulate).toBeEnabled()
  expect(writes).toEqual([])
})
