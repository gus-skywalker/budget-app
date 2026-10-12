import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'ev08-dashboard.spec.ts',
  outputDir: 'test-results/ev08-dashboard',
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5188', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5188 --strictPort',
    url: 'http://127.0.0.1:5188', reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5188/fixture-api' },
  },
})
