import { defineConfig, devices } from '@playwright/test';

/**
 * Capture configuration is intentionally separate from the regression suite.
 * It writes release screenshots after an explicit local database seed.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    screenshot: 'only-on-failure',
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
