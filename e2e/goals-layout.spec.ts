import { expect, test, type Page } from '@playwright/test'

async function openSyntheticGoals(page: Page, theme: 'light' | 'dark', initialScreenshotPath: string) {
  await page.addInitScript((preferredTheme) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      auth: true, token: null,
      user: { id: 'goals-layout-user', username: 'Pessoa de teste', language: 'PT',
        workspaces: [{ workspaceId: 'goals-layout-workspace', workspaceName: 'Metas isoladas', role: 'ROLE_OWNER' }] },
      currentWorkspaceId: 'goals-layout-workspace', tenantRole: 'ROLE_OWNER', language: 'PT', preferredTheme,
    }))
  }, theme)

  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://127.0.0.1:5189') return route.abort()
    if (!url.pathname.startsWith('/fixture-api')) return route.continue()

    if (url.pathname === '/fixture-api/financial-goals/suggest-goals') {
      return route.fulfill({ json: [
        { name: 'Emergency fund', targetAmount: 10000, suggestedContributionAmount: 350,
          monthsRemaining: 14, deadline: '2028-01-01', category: 'emergency_fund' },
        { name: 'Travel fund', targetAmount: 5000, suggestedContributionAmount: 500,
          monthsRemaining: 10, deadline: '2027-09-01', category: 'travel' },
        { name: 'Laptop upgrade', targetAmount: 7000, suggestedContributionAmount: 600,
          monthsRemaining: 12, deadline: '2027-11-01', category: 'technology' },
      ] })
    }
    if (url.pathname === '/fixture-api/financial-goals') return route.fulfill({ json: [{
      id: 'synthetic-goal', name: 'Entrada para carro', targetAmount: 50000,
      progress: 0, remainingAmount: 50000, monthsRemaining: 25,
      suggestedContributionAmount: 2000, deadline: '2028-11-02', paceStatus: 'AHEAD',
      insightMessage: 'Há espaço para manter esta meta no ritmo informado.',
    }] })
    if (url.pathname === '/fixture-api/dashboard/overview') {
      return route.fulfill({ json: { totalIncome: 3000, totalExpense: 2000 } })
    }
    if (url.pathname === '/fixture-api/billing/access') {
      return route.fulfill({ json: { capabilities: { aiEnabled: false } } })
    }
    return route.fulfill({ json: [] })
  })

  await page.goto('/planning/goals')
  await expect(page.locator('.goal-list')).toBeVisible()
  await expect(page.locator('.goal-item__details--context')).not.toHaveAttribute('open', '')
  await expect(page.locator('.goal-ideas-toggle')).toBeVisible()
  await page.locator('.goal-ideas-toggle').click()
  await expect(page.locator('#goal-ideas-content')).toBeVisible()
  await expect(page.locator('.goal-ideas-choice')).toBeVisible()
  await expect(page.locator('.suggestions-card')).toHaveCount(0)
  await page.screenshot({ path: initialScreenshotPath, fullPage: true })
  await page.locator('.goal-ideas-choice__option').nth(1).click()
  await page.locator('.goal-suggestions-action').click()
  await expect(page.locator('.suggestion-item')).toHaveCount(1)
  await expect(page.locator('.suggestion-name')).toHaveText('Reserva de emergência')
  await page.locator('.goal-more-suggestions').click()
  await expect(page.locator('.suggestion-item')).toHaveCount(3)
  await page.locator('.goal-more-suggestions').click()
  await expect(page.locator('.suggestion-item')).toHaveCount(1)
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test(`${theme} Goals ideas align at ${width}px without overflow`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 })
      await openSyntheticGoals(page, theme, testInfo.outputPath(`${theme}-${width}-choice.png`))

      const layout = await page.evaluate(() => {
        const selectors = ['.goal-list', '.goal-ideas-toggle', '.suggestions-card', '.goal-ideas-tip']
        const boxes = selectors.map((selector) => {
          const element = document.querySelector<HTMLElement>(selector)
          if (!element) throw new Error(`Missing ${selector}`)
          const box = element.getBoundingClientRect()
          return { left: box.left, right: box.right }
        })
        const grid = document.querySelector<HTMLElement>('.suggestions-grid')
        const suggestion = document.querySelector<HTMLElement>('.suggestion-item')
        if (!grid || !suggestion) throw new Error('Missing suggested goal')
        return { boxes, scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
          suggestionWidth: suggestion.getBoundingClientRect().width, gridWidth: grid.getBoundingClientRect().width }
      })
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth)
      expect(layout.boxes.every((box) => box.left >= 0 && box.right <= layout.viewportWidth)).toBe(true)
      expect(Math.max(...layout.boxes.map((box) => box.left)) - Math.min(...layout.boxes.map((box) => box.left))).toBeLessThan(1)
      expect(Math.max(...layout.boxes.map((box) => box.right)) - Math.min(...layout.boxes.map((box) => box.right))).toBeLessThan(1)
      expect(layout.suggestionWidth).toBeGreaterThan(layout.gridWidth * 0.95)

      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), fullPage: true })
      await page.locator('.goal-ideas-back').click()
      await expect(page.locator('.suggestions-card')).toHaveCount(0)
      await page.locator('.goal-ideas-choice__option').first().click()
      await expect(page.locator('.goal-template-section')).toBeVisible()
      await expect(page.locator('.goal-template-card')).toHaveCount(4)
    })
  }
}
