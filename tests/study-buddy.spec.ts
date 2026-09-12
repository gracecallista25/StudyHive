import { test, expect } from '@playwright/test';

test('required course, one-at-a-time ranked results, reversible navigation and mock requests', async ({ page }) => {
  await page.goto('/#study-buddy');
  await expect(page.getByRole('heading', { name: 'Find a Study Buddy', exact: true })).toBeVisible();
  await expect(page.locator('.student-card')).toHaveCount(0);
  await expect(page.getByRole('combobox')).toHaveCount(1);
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.locator('.student-card')).toHaveCount(0);
  await page.getByLabel('Course', { exact: true }).fill('Data Structures');
  await page.getByLabel('Online', { exact: true }).check();
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.locator('.student-card')).toHaveCount(1);
  await expect(page.locator('.student-card')).toContainText('Lin Chen');
  await expect(page.getByText('2 students available to study · 3 matches')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Study Together' }).click();
  await expect(page.getByRole('status')).toHaveText('Study request sent to Lin Chen.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.student-card')).toContainText('Sam Liu');
  await expect(page.locator('.student-card')).toContainText('Currently offline · Available to study');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.student-card')).toContainText('Jo Wang');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Request sent', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Change', exact: true }).click();
  await expect(page.getByLabel('Course', { exact: true })).toHaveValue('Data Structures');
  await page.getByLabel('In person', { exact: true }).check();
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.locator('.student-card')).toContainText('Sam Liu');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('every listed course has students in every study mode', async ({ page }) => {
  await page.goto('/#study-buddy');
  await page.getByLabel('Course', { exact: true }).click();
  const courseNames = await page.getByRole('option').allTextContents();
  expect(courseNames).toHaveLength(13);
  for (const course of courseNames) {
    for (const mode of ['Online', 'In person', 'Either']) {
      await page.getByLabel('Course', { exact: true }).fill(course);
      await page.getByRole('option', { name: course, exact: true }).click();
      await page.getByLabel(mode, { exact: true }).check();
      await page.getByRole('button', { name: 'Find Study Buddies' }).click();
      await expect(page.locator('.student-card')).toContainText(course);
      await expect(page.locator('.student-card')).toContainText('Available to study');
      await page.getByRole('button', { name: 'Change', exact: true }).click();
    }
  }
});
test('start and results fit desktop and mobile and retain active navigation', async ({ page }) => {
  await page.goto('/#study-buddy');
  await expect(page.getByRole('link', { name: 'Study Buddy', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByLabel('Course', { exact: true }).fill('Data Structures');
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await page.screenshot({ path: `test-results/buddy-flow-${page.viewportSize()!.width}.png`, fullPage: true });
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Study Together' })).toBeVisible();
  }
  await page.reload();
  await expect(page.locator('.student-card')).toHaveCount(0);
});




