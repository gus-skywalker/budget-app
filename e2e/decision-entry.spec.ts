import { expect, test, type Page } from '@playwright/test'

for (const theme of ['light', 'dark'] as const) {
  test(`ED-04: guided expense reduction, review and preview only (${theme})`, async ({ page }, info) => {
    await fixture(page, theme)
    await page.setViewportSize({ width: theme === 'light' ? 360 : 1440, height: 1000 })
    const plan = { id: 'fixture-budget', periodMonth: 9, periodYear: 2026, totalIncome: 3000, totalExpense: 2000, net: 1000, lines: [] }
    await page.route('**/fixture-api/budgets/current**', route => route.fulfill({ json: plan }))
    const writes: { path: string; body: any }[] = []
    await page.route('**/fixture-api/scenarios**', async route => {
      if (route.request().method() !== 'GET') writes.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() })
      return route.fulfill({ json: { sourceType: 'BUDGET_BASED', scenarioName: 'Assinatura', months: 6,
        currentBalance: 1000, baselineMonthlyNet: 1000, scenarioMonthlyImpact: 100,
        projectedFinalBalance: 6600, decisionStatus: 'STABLE', availableForGoals: 0, impactedGoalsCount: 0,
        forecast: [], impactedGoalNames: [] } })
    })
    await page.goto('/planning/scenarios/new?guided=1&intent=monthly-change')
    await expect(page.getByText('Passo 1 de 3')).toBeVisible()
    await page.locator('.security-notice__close').click()
    await page.getByRole('button', { name: 'Próximo', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'O que vai mudar?' })).toBeFocused()
    await expect(page.getByText('Passo 2 de 3')).toBeVisible()
    await expect(page.locator('.template-grid')).toHaveCount(0)
    const card = page.locator('.scenario-change-card')
    const choose = async (label: string, value: string | number) => {
      await card.getByRole('combobox', { name: label, exact: true }).press('ArrowDown')
      const list = page.getByRole('listbox', { name: `${label}-list`, exact: true })
      await expect(list).toBeVisible()
      const option = typeof value === 'number' ? list.getByRole('option').nth(value) : list.getByRole('option', { name: value, exact: true })
      await option.click()
      await expect(list).toBeHidden()
    }
    await card.getByRole('textbox', { name: 'Dê um nome à mudança (opcional)' }).fill('Assinatura')
    await choose('Que tipo de mudança é essa?', 'Reduzir um gasto')
    await card.getByRole('spinbutton', { name: 'Qual é o valor por mês?' }).fill('100')
    await choose('Isso acontece uma vez ou todo mês?', 'Todo mês, por um período')
    await choose('Em que mês começa?', 2)
    await choose('Qual é o último mês?', 2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: info.outputPath(`premises-${theme}.png`), fullPage: true, animations: 'disabled' })
    await page.getByRole('button', { name: 'Próximo', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Confira antes de testar' })).toBeFocused()
    await expect(page.getByText('Passo 3 de 3')).toBeVisible()
    await expect(page.locator('.review-changes')).toContainText('Reduzir um gasto')
    await expect(page.locator('.review-changes')).toContainText('100,00')
    await expect(page.locator('.review-changes')).toContainText('Todo mês, por um período')
    await expect(page.getByRole('button', { name: 'Próximo', exact: true })).toHaveCount(0)
    expect(writes).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: info.outputPath(`review-${theme}.png`), fullPage: true, animations: 'disabled' })
    await page.getByRole('button', { name: 'Ver o impacto', exact: true }).click()
    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0].path).toBe('/fixture-api/scenarios/simulate')
    expect(writes[0].body.deltas).toEqual([{ label: 'Assinatura', type: 'EXPENSE_REDUCTION', temporalType: 'FIXED_PERIOD', amount: 100, startMonthOffset: 2, endMonthOffset: 4 }])
    await expect(page).toHaveURL(/planning\/scenarios\/preview\?simulatedAt=/)
  })
}

test('ED-04: editing preserves percentage, duration and hidden plan changes', async ({ page }, info) => {
  await fixture(page, 'light')
  await page.setViewportSize({ width: 360, height: 1000 })
  const saved = { id: 'saved-premises', budgetId: 'fixture-budget', name: 'Economizar', sourceType: 'BUDGET_BASED', months: 9,
    deltas: [{ label: 'Redução', type: 'PERCENT_EXPENSE_REDUCTION', temporalType: 'FIXED_PERIOD', amount: 10, percentage: 10, startMonthOffset: 1, endMonthOffset: 3 }],
    lines: [{ id: 'line', category: 'Casa', type: 'EXPENSE', originalAmount: 500, adjustedAmount: 400, delta: -100 }] }
  await page.route('**/fixture-api/budgets/current**', route => route.fulfill({ json: { id: 'fixture-budget', periodMonth: 9, periodYear: 2026, lines: [], totalIncome: 2000, totalExpense: 500, net: 1500 } }))
  const writes: any[] = []
  await page.route('**/fixture-api/scenarios**', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [saved] })
    writes.push(route.request().postDataJSON())
    return route.fulfill({ json: { scenarioName: saved.name, sourceType: 'BUDGET_BASED', months: 9, forecast: [], impactedGoalNames: [], scenarioMonthlyImpact: 150 } })
  })
  await page.goto('/planning/scenarios/saved-premises/edit')
  await expect(page.getByRole('heading', { name: 'Ajustar este teste' })).toBeVisible()
  await page.locator('.security-notice__close').click()
  await expect(page.getByRole('spinbutton', { name: 'Qual é a porcentagem?' })).toHaveValue('10')
  await expect(page.getByRole('combobox', { name: 'Que tipo de mudança é essa?', exact: true })).toHaveValue('Reduzir um gasto')
  const details = page.locator('.scenario-advanced')
  await details.locator('summary').first().click()
  await expect(page.getByRole('textbox', { name: 'Nome deste teste' })).toHaveValue('Economizar')
  await expect(page.getByRole('spinbutton', { name: 'Quantos meses você quer visualizar?' })).toHaveValue('9')
  await details.getByText('Testar outros valores do plano', { exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Valor para Casa' }).fill('350')
  await details.locator('summary').first().click()
  await page.getByText('Confira antes de testar', { exact: true }).click()
  await expect(page.locator('.delta-summary').first()).toContainText('10%')
  await expect(page.locator('.delta-summary').last()).toContainText('Aumenta a sobra mensal do plano')
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: info.outputPath('editor-percentage-light.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Ver o impacto', exact: true }).click()
  await expect.poll(() => writes.length).toBe(1)
  expect(writes[0]).toMatchObject({ id: saved.id, months: 9, deltas: [saved.deltas[0], { label: 'Baseline adjustment: Casa', type: 'MONTHLY_INCOME', amount: 150, startMonthOffset: 0 }], lineAdjustments: [{ category: 'Casa', type: 'EXPENSE', adjustedAmount: 350 }] })
})

function contrast(a: string, b: string) {
  const luminance = (color: string) => {
    const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
      const channel = value / 255
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
    })
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
  }
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + .05) / (values[1] + .05)
}

async function fixture(page: Page, theme: 'light' | 'dark', role = 'ROLE_OWNER') {
  await page.addInitScript(({ theme, role }) => {
    sessionStorage.setItem('userStore', JSON.stringify({ auth: true, token: null,
      user: { id: 'fixture-user', username: 'Pessoa de teste', language: 'PT', workspaces: [{ workspaceId: 'fixture-workspace', workspaceName: 'Meu espaço de teste', role }] },
      currentWorkspaceId: 'fixture-workspace', tenantRole: role, language: 'PT', preferredTheme: theme,
    }))
  }, { theme, role })
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://127.0.0.1:5187') return route.abort()
    if (!url.pathname.startsWith('/fixture-api')) return route.continue()
    const path = url.pathname
    const data = path.endsWith('/billing/access')
      ? { capabilities: { advancedScenariosEnabled: true, collaborationEnabled: true, advancedToolsEnabled: true }, hasPremiumAccess: true }
      : path.includes('/unread-count') ? { unreadCount: 0 }
      : path.endsWith('/workspaces/fixture-workspace') ? { workspaceId: 'fixture-workspace', workspaceName: 'Meu espaço de teste', role }
      : []
    return route.fulfill({ json: data })
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [1440, 360]) {
    test(`${theme} ${width}: direct entry, layout, keyboard and palette`, async ({ page }, info) => {
      await fixture(page, theme)
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('/planning/decide')
      await expect(page.getByRole('heading', { name: 'O que você quer decidir?' })).toBeVisible()
      const card = page.locator('[data-intent="payment-options"]')
      await expect(card).toHaveAttribute('aria-disabled', 'false')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const palette = await page.locator('.decision-start').evaluate(el => {
        const style = getComputedStyle(el)
        return { background: style.backgroundColor, accent: style.getPropertyValue('--journey-action').trim(), primary: style.getPropertyValue('--cb-primary').trim() }
      })
      expect(palette.background).toBe(theme === 'light' ? 'rgb(250, 251, 247)' : 'rgb(14, 17, 23)')
      expect(palette.accent).toBe(theme === 'light' ? '#10cc83' : '#e8693e')
      expect(palette.primary).toBe(theme === 'light' ? '#b6551f' : '#e8693e')
      // The existing dismissible security notice is outside this ticket's styling.
      await page.locator('.security-notice__close').click()
      const samples = await page.locator('.decision-start').evaluate(root => {
        const base = getComputedStyle(root).backgroundColor
        return ['.cb-page-header__title', '.cb-page-header__meta', '.intent-card__description', '.intent-card--featured .intent-card__action', '.decision-start__eyebrow'].map(selector => {
          const element = root.querySelector(selector)!
          const style = getComputedStyle(element)
          let background = style.backgroundColor
          let parent = element.parentElement
          while (background === 'rgba(0, 0, 0, 0)' && parent && parent !== root) {
            background = getComputedStyle(parent).backgroundColor
            parent = parent.parentElement
          }
          return { selector, color: style.color, background: background === 'rgba(0, 0, 0, 0)' ? base : background }
        })
      })
      for (const sample of samples) expect(contrast(sample.color, sample.background), sample.selector).toBeGreaterThanOrEqual(4.5)
      await info.attach('contrast-samples', { body: JSON.stringify(samples.map(sample => ({ ...sample, ratio: contrast(sample.color, sample.background) })), null, 2), contentType: 'application/json' })
      await page.screenshot({ path: info.outputPath(`entry-${theme}-${width}.png`), fullPage: true })
      const first = page.locator('[data-intent="monthly-change"]')
      await first.focus()
      await expect(first).toBeFocused()
      const focus = await first.evaluate(el => ({ outline: getComputedStyle(el).outlineColor, width: getComputedStyle(el).outlineWidth, background: getComputedStyle(el).backgroundColor }))
      expect(focus.width).toBe('3px')
      expect(contrast(focus.outline, focus.background)).toBeGreaterThanOrEqual(3)
      await page.keyboard.press('Tab')
      await expect(card).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/planning\/scenarios\/debt\/new\?guided=1&intent=payment-options/)
    })
  }
}

test('entry links, read-only paths and absence of financial writes', async ({ page }) => {
  await fixture(page, 'light', 'ROLE_VIEWER')
  const writes: string[] = []
  page.on('request', request => { if (request.method() !== 'GET' && request.url().includes('/fixture-api')) writes.push(request.url()) })
  await page.goto('/planning/scenarios')
  await page.getByRole('button', { name: 'Começar uma decisão' }).first().click()
  await expect(page).toHaveURL(/planning\/decide$/)
  await expect(page.getByRole('status')).toContainText('acesso de leitura')
  const disabled = page.locator('[data-intent="monthly-change"]')
  await disabled.click({ force: true })
  await expect(page).toHaveURL(/planning\/decide$/)
  await page.locator('[data-intent="organize-month"]').click()
  await expect(page).toHaveURL(/planning\/budget$/)
  await page.goto('/decisions')
  await page.getByRole('link', { name: 'Começar uma decisão' }).click()
  await expect(page).toHaveURL(/planning\/decide$/)
  expect(writes).toEqual([])
})

test('ED-03: prepare a manual plan and explicitly return to the original simulation', async ({ page }, info) => {
  await fixture(page, 'light')
  let active = false
  const commands: string[] = []
  const plan = { id: 'fixture-budget', workspaceId: 'fixture-workspace', status: 'ACTIVE',
    periodMonth: 9, periodYear: 2026, totalIncome: 1200, totalExpense: 0, net: 1200,
    lines: [{ id: 'fixture-line', category: 'Manual net baseline', type: 'INCOME', plannedAmount: 1200 }] }
  await page.route('**/fixture-api/budgets**', async route => {
    const path = new URL(route.request().url()).pathname
    if (route.request().method() === 'POST') {
      commands.push(path)
      if (path.endsWith('/activate')) active = true
      return route.fulfill({ json: plan })
    }
    if (path.endsWith('/current')) return active ? route.fulfill({ json: plan }) : route.fulfill({ status: 204 })
    if (path.endsWith('/suggestions')) return route.fulfill({ json: { lines: [] } })
    return route.fulfill({ json: active ? [plan] : [] })
  })
  await page.goto('/planning/decide')
  await page.locator('[data-intent="monthly-change"]').click()
  await expect(page.getByText('Não é preciso conectar uma conta bancária.', { exact: false })).toBeVisible()
  const sessionId = await page.evaluate(() => JSON.parse(sessionStorage.getItem('planning-decision-session-v1')!).sessionId)
  await page.getByRole('button', { name: 'Preparar meu plano' }).click()
  await expect(page).toHaveURL(/planning\/budget\?guided=1&intent=monthly-change&returnTo=planning-scenarios-new/)
  await page.locator('.security-notice__close').click()
  await page.screenshot({ path: info.outputPath('prepare-manual-plan.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Criar manualmente' }).first().click()
  await page.locator('input[type="number"]').first().fill('1200')
  expect(commands).toEqual([])
  await page.getByRole('button', { name: 'Ativar baseline rápido' }).click()
  await expect(page.getByRole('button', { name: 'Continuar minha simulação' })).toBeVisible()
  await expect(page.locator('.v-navigation-drawer--temporary')).toHaveAttribute('inert', '')
  await expect(page.locator('.v-navigation-drawer__scrim')).toHaveCount(0)
  await page.screenshot({ path: info.outputPath('continue-simulation.png'), fullPage: true, animations: 'disabled' })
  expect(commands).toEqual(['/fixture-api/budgets', '/fixture-api/budgets/fixture-budget/lines', '/fixture-api/budgets/fixture-budget/activate'])
  await expect(page).toHaveURL(/planning\/budget/)
  await page.getByRole('button', { name: 'Continuar minha simulação' }).click()
  await expect(page).toHaveURL(/planning\/scenarios\/new\?guided=1&intent=monthly-change&resume=1/)
  await expect(page.getByText('Ponto de partida: plano de 9/2026.')).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('planning-decision-session-v1')!).sessionId)).toBe(sessionId)
})

test('ED-03: failed budget request can be retried without claiming there is no plan', async ({ page }) => {
  await fixture(page, 'dark')
  let failing = true
  await page.route('**/fixture-api/budgets/current*', route => failing
    ? route.fulfill({ status: 500, json: { message: 'fixture failure' } }) : route.fulfill({ status: 204 }))
  await page.goto('/planning/scenarios/new?guided=1&intent=custom')
  await expect(page.getByText('Não conseguimos carregar seu plano mensal.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preparar meu plano' })).toHaveCount(0)
  failing = false
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('button', { name: 'Preparar meu plano' })).toBeVisible()
})
