import { defineConfig } from '@playwright/test'

// ED-02 only: real app, synthetic API fixtures, no financial-closing services.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'decision-entry.spec.ts',
  outputDir: 'test-results/decision-entry',
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5187', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5187 --strictPort',
    url: 'http://127.0.0.1:5187', reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5187/fixture-api' },
  },
})
