import { test, expect } from '@playwright/test';

test('Project search, skill filters and closed teams work', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page).toHaveTitle('Projects · StudyHive');
  await expect(page.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('searchbox', { name: 'Search projects' }).fill('campus');
  await page.getByRole('combobox', { name: 'Filter by skill' }).selectOption('Data analysis');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Green Campus', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Filter by project type' }).selectOption('Hackathon');
  await expect(page.getByRole('heading', { name: 'No projects found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  await page.getByRole('checkbox', { name: 'Open roles' }).uncheck();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: 'View Campus Map', exact: true }).click();
  await expect(page.getByText('This team is full and isn’t accepting new requests.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request to join' })).toHaveCount(0);
});

test('Project detail validates requests and remembers a preview submission', async ({ page }) => {
  await page.goto('/#projects');
  await page.getByRole('button', { name: 'View Campus Connect', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Campus Connect', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Meet the team' })).toBeVisible();
  await page.getByLabel('Your role').selectOption('UI designer');
  await page.getByLabel('Introduce yourself').fill('   ');
  await page.getByRole('button', { name: 'Request to join' }).click();
  await expect(page.getByRole('alert')).toContainText('short introduction');
  await page.getByLabel('Introduce yourself').fill('I enjoy designing clear interfaces and would love to help.');
  await page.getByRole('button', { name: 'Request to join' }).click();
  await expect(page.getByRole('status')).toContainText('Request saved in preview');
  await page.getByRole('button', { name: 'Back to projects' }).click();
  await page.getByRole('button', { name: 'View Campus Connect', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Request to join' })).toHaveCount(0);
});

test('Create project adds a usable preview project', async ({ page }) => {
  await page.goto('/#projects');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await page.getByLabel('Project name', { exact: true }).fill('Book Exchange');
  await page.getByLabel('One-line summary').fill('Help students share their books.');
  await page.getByLabel('The idea', { exact: true }).fill('Build a friendly place to exchange textbooks on campus.');
  await page.getByLabel('Who are you looking for?').fill('Designer');
  await page.getByLabel('Skills needed').fill('Figma, UI design');
  await page.getByRole('button', { name: 'Create preview project' }).click();
  await expect(page.getByRole('heading', { name: 'Book Exchange', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to projects' }).click();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('searchbox', { name: 'Search projects' }).fill('book');
  await expect(page.getByRole('article')).toHaveCount(1);
});

test('Project references fit desktop and mobile', async ({ page }) => {
  await page.goto('/#projects');
  await page.screenshot({ path: `test-results/projects-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.getByRole('button', { name: 'View Campus Connect', exact: true }).click();
  await page.screenshot({ path: `test-results/project-detail-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Back to projects' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
