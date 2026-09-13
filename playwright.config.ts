import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false,
  use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL },
  projects: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
  ].flatMap(viewport => [
    { name: 'preview-' + viewport.width + 'x' + viewport.height, testIgnore: ['**/*-api.spec.ts'], use: { viewport, baseURL: 'http://127.0.0.1:5183' } },
    { name: 'api-' + viewport.width + 'x' + viewport.height, testMatch: ['**/*-api.spec.ts'], use: { viewport, baseURL: 'http://127.0.0.1:5184' } },
  ]),
  webServer: [
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183 --strictPort', url: 'http://127.0.0.1:5183', env: { VITE_API_BASE_URL: '' }, reuseExistingServer: false },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5184 --strictPort', url: 'http://127.0.0.1:5184', env: { VITE_API_BASE_URL: process.env.STUDYHIVE_BACKEND_TEST ? 'http://127.0.0.1:18765' : 'http://127.0.0.1:8000' }, reuseExistingServer: false },
  ],
});
