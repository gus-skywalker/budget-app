import { defineConfig } from '@playwright/test'
import entry from './playwright.decision-entry.config'

// Guided decisions only: isolated Vite server and synthetic API, no closing setup.
export default defineConfig({
  ...entry,
  testMatch: ['decision-entry.spec.ts', 'decision-journey.spec.ts'],
  outputDir: 'test-results/decision-journey',
})
