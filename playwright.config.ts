import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Chromium',       use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox',        use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit',         use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome',  use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari',  use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
  },
});
