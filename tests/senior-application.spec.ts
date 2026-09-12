import { test, expect } from '@playwright/test';

test('A student can prepare, review and edit a senior application', async ({ page }) => {
  await page.goto('/#ask-senior');
  await page.getByRole('button', { name: 'Become a senior', exact: true }).click();
  await page.getByLabel('Full name', { exact: true }).fill('   ');
  await page.getByLabel('Major', { exact: true }).fill('Computer Science');
  await page.getByLabel('Year of study').selectOption('Year 3');
  await page.getByLabel('Courses you can help with').fill('Data Structures');
  await page.getByLabel('Help topics', { exact: true }).fill('Algorithms and internships');
  await page.getByLabel('Why would you like to become a senior?').fill('I have tutored classmates and would like to share what helped me.');
  await page.getByLabel('When can you help?').fill('Weekday evenings');
  await page.getByRole('button', { name: 'Save preview application' }).click();
  await expect(page.getByRole('alert')).toContainText('Complete each field');
  await page.getByLabel('Full name', { exact: true }).fill('Sam Lee');
  await page.getByRole('button', { name: 'Save preview application' }).click();
  await expect(page.getByRole('status')).toContainText('Application saved in preview.');
  await expect(page.getByText('This has not been submitted for review', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Back to seniors' }).click();
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('button', { name: 'View your application' }).click();
  await expect(page.getByText('Sam Lee', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit application' }).click();
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Sam Lee');
  await page.getByLabel('When can you help?').fill('Saturday mornings');
  await page.getByRole('button', { name: 'Save preview application' }).click();
  await expect(page.getByText('Saturday mornings', { exact: true })).toBeVisible();
});

test('Senior application supports cancel and mobile layout', async ({ page }) => {
  await page.goto('/#ask-senior');
  await page.getByRole('button', { name: 'Become a senior', exact: true }).click();
  await page.screenshot({ path: `test-results/senior-application-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Become a senior', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(4);
});
