import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false,
  use: { viewport: { width: 1536, height: 1024 }, browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL },
  projects: [
    { name: 'preview', testIgnore: ['**/registration-api.spec.ts', '**/profile-api.spec.ts'], use: { baseURL: 'http://127.0.0.1:5183' } },
    { name: 'registration-api', testMatch: ['**/registration-api.spec.ts', '**/profile-api.spec.ts'], use: { baseURL: 'http://127.0.0.1:5184' } },
  ],
  webServer: [
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183 --strictPort', url: 'http://127.0.0.1:5183', env: { VITE_API_BASE_URL: '' }, reuseExistingServer: false },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5184 --strictPort', url: 'http://127.0.0.1:5184', env: { VITE_API_BASE_URL: 'http://127.0.0.1:8000' }, reuseExistingServer: false },
  ],
});
