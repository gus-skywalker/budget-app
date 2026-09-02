import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 120_000,
  globalSetup: './e2e/financial-closing-demo.setup.ts',
  outputDir: 'test-results/financial-closing',
  use: {
    baseURL: `http://127.0.0.1:${process.env.CLOSING_E2E_APP_PORT ?? 5173}`,
    viewport: { width: 1440, height: 960 },
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium-demo', use: { browserName: 'chromium' } }],
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/financial-closing', open: 'never' }],
    ['junit', { outputFile: 'test-results/financial-closing/junit.xml' }],
  ],
})
