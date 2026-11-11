import { expect, test, type Page } from '@playwright/test'

type FixtureState = { summaryFails?: boolean; comparisonFails?: boolean; conflict?: boolean }

async function fixture(page: Page, role: 'ROLE_OWNER' | 'ROLE_VIEWER', state: FixtureState, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript(({ role, theme }) => {
    sessionStorage.setItem('userStore', JSON.stringify({
      auth: true, token: null,
      user: { id: 'ev08-user', username: 'Pessoa de teste', language: 'PT',
        workspaces: [{ workspaceId: 'ev08-workspace', workspaceName: 'EV-08 isolado', role }] },
      currentWorkspaceId: 'ev08-workspace', tenantRole: role, language: 'PT', preferredTheme: theme,
    }))
  }, { role, theme })

  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://127.0.0.1:5188') return route.abort()
    if (!url.pathname.startsWith('/fixture-api')) return route.continue()
    const path = url.pathname
    if (path === '/fixture-api/dashboard') {
      return state.summaryFails
        ? route.fulfill({ status: 503, json: { message: 'summary offline' } })
        : route.fulfill({ json: { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0,
          monthlyForecastIncome: 0, monthlyForecastExpenses: 0, topCategories: [] } })
    }
    if (path === '/fixture-api/dashboard/chart') return route.fulfill({ json: { labels: [], datasets: [] } })
    if (path === '/fixture-api/budgets/comparison') {
      return state.comparisonFails
        ? route.fulfill({ status: 503, json: { message: 'comparison offline' } })
        : route.fulfill({ json: { summary: { plannedNet: 1000, actualNet: 0,
          actualIncome: 0, actualExpense: 0, netDelta: -1000 }, lines: [] } })
    }
    if (path === '/fixture-api/billing/access') {
      return route.fulfill({ json: { hasPremiumAccess: true,
        capabilities: { connectedFinanceEnabled: true, advancedCashflowEnabled: false, aiEnabled: false } } })
    }
    if (path === '/fixture-api/open-finance/reconciliation/conflicts') {
      return route.fulfill({ json: state.conflict ? [{ id: 'synthetic-conflict' }] : [] })
    }
    if (path === '/fixture-api/workspaces/ev08-workspace') {
      return route.fulfill({ json: { workspaceId: 'ev08-workspace', workspaceName: 'EV-08 isolado', role } })
    }
    return route.fulfill({ json: [] })
  })
}

test('summary failure does not erase the plan and retry recovers without a financial write', async ({ page }) => {
  const state: FixtureState = { summaryFails: true }
  await fixture(page, 'ROLE_OWNER', state)
  await page.setViewportSize({ width: 360, height: 800 })
  const writes: string[] = []
  page.on('request', request => {
    if (request.method() !== 'GET' && request.url().includes('/fixture-api')) writes.push(request.url())
  })
  await page.goto('/dashboard')
  await expect(page.locator('.dashboard-hero [role="alert"]')).toBeVisible()
  await expect(page.locator('.dashboard-comparison')).toContainText('R$ 1.000,00')
  state.summaryFails = false
  await page.locator('.dashboard-hero button').click()
  await expect(page.locator('.dashboard-hero [role="alert"]')).toHaveCount(0)
  await expect(page.locator('.dashboard-hero')).toContainText('R$ 1.000,00')
  expect(writes).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('comparison failure remains distinct from no plan and recovers independently', async ({ page }) => {
  const state: FixtureState = { comparisonFails: true }
  await fixture(page, 'ROLE_OWNER', state)
  await page.goto('/dashboard')
  await expect(page.locator('.dashboard-comparison [role="alert"]')).toBeVisible()
  await expect(page.locator('.dashboard-hero button')).toBeVisible()
  await expect(page.locator('.dashboard-comparison')).not.toContainText('Montar plano do mês')
  state.comparisonFails = false
  await page.locator('.dashboard-hero button').click()
  await expect(page.locator('.dashboard-comparison [role="alert"]')).toHaveCount(0)
  await expect(page.locator('.dashboard-comparison')).toContainText('R$ 1.000,00')
})

test('read-only attention routes to a safe destination and keeps the alert textual', async ({ page }) => {
  await fixture(page, 'ROLE_VIEWER', { conflict: true })
  await page.setViewportSize({ width: 360, height: 800 })
  const writes: string[] = []
  page.on('request', request => {
    if (request.method() !== 'GET' && request.url().includes('/fixture-api')) writes.push(request.url())
  })
  await page.goto('/dashboard')
  await expect(page.locator('.dashboard-attention')).toContainText('1')
  await expect(page.locator('.dashboard-hero')).toContainText('atenção')
  await page.locator('.dashboard-hero a').click()
  await expect(page).toHaveURL(/\/transactions$/)
  expect(writes).toEqual([])
})

test('dark mobile keeps conditional error and alert readable without overlap', async ({ page }) => {
  await fixture(page, 'ROLE_VIEWER', { comparisonFails: true, conflict: true }, 'dark')
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/dashboard')
  await expect(page.locator('.v-theme--dark').first()).toBeVisible()
  await expect(page.locator('.dashboard-comparison [role="alert"]')).toBeVisible()
  await expect(page.locator('.dashboard-attention')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const boxes = await page.locator('.dashboard-comparison [role="alert"], .dashboard-attention').evaluateAll((elements) =>
    elements.map((element) => ({ left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right })))
  expect(boxes.every((box) => box.left >= 0 && box.right <= 360)).toBe(true)
})

test('conditional error and attention retain keyboard focus and sampled text contrast in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await fixture(page, 'ROLE_VIEWER', { comparisonFails: true, conflict: true }, theme)
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/dashboard')
    await expect(page.locator('.dashboard-comparison [role="alert"]')).toBeVisible()
    await expect(page.locator('.dashboard-attention')).toBeVisible()

    const contrast = await page.evaluate(() => {
      const parseColor = (color: string) => {
        const values = color.match(/[\d.]+/g)?.map(Number) ?? []
        if (values.length < 3) throw new Error(`Unsupported color: ${color}`)
        return { rgb: values.slice(0, 3), alpha: values[3] ?? 1 }
      }
      const ratio = (foreground: number[], background: number[]) => {
        const channels = (values: number[]) => {
          return values.map(value => {
            const channel = value / 255
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          })
        }
        const luminance = (color: number[]) => channels(color).reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)
        const [bright, dim] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
        return (bright + 0.05) / (dim + 0.05)
      }
      return ['.dashboard-hero [role="alert"]', '.dashboard-comparison [role="alert"]', '.dashboard-attention h2', '.dashboard-attention p'].map(selector => {
        const element = document.querySelector<HTMLElement>(selector)
        if (!element) throw new Error(`Missing ${selector}`)
        const textColor = parseColor(getComputedStyle(element).color).rgb
        const layers = []
        let parent: HTMLElement | null = element
        while (parent) {
          layers.push(parseColor(getComputedStyle(parent).backgroundColor))
          parent = parent.parentElement
        }
        const backgroundColor = layers.reverse().reduce((base, layer) => layer.rgb.map((value, index) => value * layer.alpha + base[index] * (1 - layer.alpha)), [255, 255, 255])
        return { selector, ratio: ratio(textColor, backgroundColor) }
      })
    })
    expect(contrast.every(sample => sample.ratio >= 4.5), JSON.stringify({ theme, contrast })).toBe(true)

    const retry = page.locator('.dashboard-hero button')
    for (let index = 0; index < 20 && !(await retry.evaluate(element => element === document.activeElement)); index++) {
      await page.keyboard.press('Tab')
    }
    await expect(retry).toBeFocused()
    expect(await retry.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  }
})

test('the five EV pages use the decision visual language only in light mode', async ({ page }, testInfo) => {
  await fixture(page, 'ROLE_OWNER', {})
  await page.setViewportSize({ width: 360, height: 800 })
  for (const path of ['/dashboard', '/transactions', '/planning/budget', '/planning/goals', '/insights']) {
    await page.goto(path)
    const securityNoticeClose = page.locator('.security-notice__close')
    if (await securityNoticeClose.isVisible()) await securityNoticeClose.click()
    const root = page.locator('.experience-page')
    await expect(root).toBeVisible()
    await expect(root.locator('.cb-page-header__title')).toBeVisible()
    const visual = await root.evaluate(element => ({
      background: getComputedStyle(element).backgroundColor,
      primary: getComputedStyle(element).getPropertyValue('--cb-primary').trim(),
      titleSize: Number.parseFloat(getComputedStyle(element.querySelector('.cb-page-header__title')!).fontSize),
      width: document.documentElement.scrollWidth,
    }))
    expect(visual.background).toBe('rgb(250, 251, 247)')
    expect(visual.primary).toBe('#10cc83')
    expect(visual.titleSize).toBeGreaterThanOrEqual(32)
    expect(visual.width).toBeLessThanOrEqual(360)
    await page.screenshot({ path: testInfo.outputPath(`light-${path.replaceAll('/', '-') || 'home'}.png`) })
  }
  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/dashboard')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`light-dashboard-${width}.png`) })
  }
})

test('the dashboard preserves the existing dark palette', async ({ page }) => {
  await fixture(page, 'ROLE_OWNER', {}, 'dark')
  await page.goto('/dashboard')
  const visual = await page.locator('.experience-page').evaluate(element => ({
    background: getComputedStyle(element).backgroundColor,
    primary: getComputedStyle(element).getPropertyValue('--cb-primary').trim(),
  }))
  expect(visual.primary).toBe('#e8693e')
  expect(visual.background).not.toBe('rgb(250, 251, 247)')
})
