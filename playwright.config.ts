import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1536, height: 1024 }, browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
