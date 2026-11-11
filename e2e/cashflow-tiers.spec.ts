import { expect, test, type Page } from '@playwright/test'

type Tier = 'FREE' | 'STARTER' | 'TEAM'

async function openCashflow(page: Page, tier: Tier, theme: 'light' | 'dark') {
  const calls = { projection: 0, advanced: 0 }
  await page.addInitScript((preferredTheme) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      auth: true, token: null,
      user: { id: 'cashflow-test-user', username: 'Pessoa de teste', language: 'PT',
        workspaces: [{ workspaceId: 'cashflow-test-workspace', workspaceName: 'Fluxo isolado', role: 'ROLE_OWNER' }] },
      currentWorkspaceId: 'cashflow-test-workspace', tenantRole: 'ROLE_OWNER', language: 'PT', preferredTheme,
    }))
  }, theme)

  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://127.0.0.1:5190') return route.abort()
    if (!url.pathname.startsWith('/fixture-api')) return route.continue()

    if (url.pathname === '/fixture-api/billing/access') {
      return route.fulfill({ json: { capabilities: {
        planningIntelligenceEnabled: tier !== 'FREE',
        advancedCashflowEnabled: tier === 'TEAM',
        aiEnabled: tier !== 'FREE',
        advancedToolsEnabled: false,
      } } })
    }
    if (url.pathname === '/fixture-api/transactions/summary') {
      return route.fulfill({ json: {
        currency: 'BRL', incomeAmount: 3000, expenseAmount: 2000, netAmount: 1000,
        incomeTransactionCount: 1, expenseTransactionCount: 1,
      } })
    }
    if (url.pathname === '/fixture-api/cashflow/projection') {
      calls.projection++
      return route.fulfill({ json: {
        historyFrom: '2026-09-01', historyThrough: '2026-10-31',
        historicalNetAmount: 1000, averageMonthlyNet: 500, decisionStatus: 'STABLE',
        forecast: [{ month: '2026-11', predictedIncome: 3000, predictedExpenses: 2000,
          projectedBalance: 2000, status: 'surplus' }],
      } })
    }
    if (url.pathname === '/fixture-api/ai/cashflow-insights') {
      calls.advanced++
      return route.fulfill({ json: {
        currentBalance: 1000, averageMonthlyBalance: 500, decisionStatus: 'STABLE',
        primaryDriver: 'As entradas superam as saídas.', recommendedAction: 'Revise o valor reservado.',
        availableForGoals: 700, requiredMonthlyAdjustment: 0, goalsAtRiskCount: 0, goalsOnTrackCount: 1,
        insights: ['Os dados do período mostram uma margem positiva.'],
        forecast: [{ month: '2026-11', predictedIncome: 3000, predictedExpenses: 2000,
          projectedBalance: 2000, status: 'surplus' }],
      } })
    }
    if (url.pathname === '/fixture-api/ai/predictions/monthly-expenses') {
      return route.fulfill({ json: { predictions: [], totalPredicted: 0 } })
    }
    return route.fulfill({ json: [] })
  })

  await page.goto('/cashflow')
  await expect(page.locator('.cashflow-basic__metrics')).toBeVisible()
  await expect(page.locator('.cf-card .ai-card')).toBeVisible()
  return calls
}

for (const tier of ['FREE', 'STARTER', 'TEAM'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [390, 1280]) {
      test(`${tier} cashflow at ${width}px in ${theme} mode`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 })
        const calls = await openCashflow(page, tier, theme)

        if (tier === 'FREE') {
          await expect(page.locator('.cf-card .locked-state')).toBeVisible()
          await expect(page.locator('.cf-card .ai-form')).toHaveCount(0)
          expect(calls.projection).toBe(0)
          expect(calls.advanced).toBe(0)
        } else {
          await expect(page.locator('.cf-card .ai-form')).toBeVisible()
          await page.locator('.cf-card .ai-form button[type="submit"]').click()
          await expect(page.locator('.cf-card .results')).toBeVisible()
          await expect(page.locator('.cf-card .decision-cards')).toHaveCount(tier === 'TEAM' ? 1 : 0)
          await expect(page.locator('.cashflow-team-teaser')).toHaveCount(tier === 'STARTER' ? 1 : 0)
          expect(calls.projection).toBe(tier === 'STARTER' ? 1 : 0)
          expect(calls.advanced).toBe(tier === 'TEAM' ? 1 : 0)
        }

        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          card: document.querySelector('.cf-card')?.getBoundingClientRect().toJSON(),
        }))
        expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth)
        expect(layout.card).toBeTruthy()
        expect(layout.card!.left).toBeGreaterThanOrEqual(0)
        expect(layout.card!.right).toBeLessThanOrEqual(layout.viewportWidth)
        await page.screenshot({ path: testInfo.outputPath(`${tier.toLowerCase()}-${theme}-${width}.png`), fullPage: true })
      })
    }
  }
}
