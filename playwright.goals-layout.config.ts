import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'goals-layout.spec.ts',
  outputDir: 'test-results/goals-layout',
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5189', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5189 --strictPort',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5189/fixture-api' },
  },
})
