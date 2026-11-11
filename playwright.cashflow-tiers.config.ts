import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'cashflow-tiers.spec.ts',
  outputDir: 'test-results/cashflow-tiers',
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5190', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5190 --strictPort',
    url: 'http://127.0.0.1:5190',
    reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5190/fixture-api' },
  },
})
