import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  globalSetup: './e2e/financial-closing-demo.setup.ts',
  outputDir: 'test-results/financial-closing-demo',
  use: {
    baseURL: 'http://127.0.0.1:5176',
    viewport: { width: 1440, height: 960 },
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium-demo', use: { browserName: 'chromium' } }],
  reporter: [['list']],
})
