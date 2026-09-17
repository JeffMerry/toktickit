import { defineConfig, devices } from '@playwright/test';

/**
 * Lab 3 E2E tests deliberately do not start or seed services automatically.
 * The suite mutates local development fixtures, so the documented seed command
 * must be run explicitly against the intended local database before execution.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix server run dev',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm --prefix client run dev -- --host localhost',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
