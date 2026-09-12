import { test, expect } from '@playwright/test';

test('Home connects existing navigation and expands online students without study filters', async ({ page }) => {
  await page.goto('/#home');
  await expect(page).toHaveTitle('Home · StudyHive');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(page.getByText('What do you want to do today?')).toBeVisible();
  await expect(page.getByText('Coming soon', { exact: true })).toHaveCount(1);
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your Activity' })).toBeVisible();
  await page.getByRole('button', { name: 'View all' }).click();
  await expect(page.locator('#home-online-list li')).toHaveCount(4);
  await expect(page.locator('#home-online-list')).toBeVisible();
  await page.getByRole('button', { name: 'Show less' }).click();
  await expect(page.locator('#home-online-list')).toBeHidden();
  await page.screenshot({ path: `test-results/home-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.locator('.home-feature-primary').click();
  await expect(page.getByRole('heading', { name: 'Find a Study Buddy', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
