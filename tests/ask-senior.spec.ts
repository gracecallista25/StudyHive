import { test, expect } from '@playwright/test';

test('Ask a Senior navigation and combined filters work', async ({ page }) => {
  await page.goto('/#home');
  await page.getByRole('link').filter({ has: page.getByRole('heading', { name: 'Ask a Senior', exact: true }) }).click();
  await expect(page).toHaveTitle('Ask a Senior · StudyHive');
  await expect(page.getByRole('link', { name: 'Ask a Senior', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('searchbox', { name: 'Search seniors' }).fill('  LIN ');
  await page.getByLabel('Course', { exact: true }).selectOption('Algorithms');
  await page.getByLabel('Major', { exact: true }).selectOption('Computer Science');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Lin Chen', exact: true })).toBeVisible();
  await page.getByLabel('Major', { exact: true }).selectOption('Design');
  await expect(page.getByRole('heading', { name: 'No seniors found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  await page.getByRole('checkbox').uncheck();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Ask Jun Li a question' })).toBeDisabled();
  await page.getByRole('button', { name: "View Jun Li's profile" }).click();
  await expect(page.getByText('Taking a little study break.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save preview question' })).toHaveCount(0);
});

test('Suggested questions can be saved, reviewed and edited without sending', async ({ page }) => {
  await page.goto('/#ask-senior');
  await page.getByRole('button', { name: 'Ask Lin Chen a question' }).click();
  await expect(page.getByLabel('Your question')).toBeFocused();
  await page.getByLabel('Your question').fill('   ');
  await page.getByRole('button', { name: 'Save preview question' }).click();
  await expect(page.getByRole('alert')).toContainText('at least 10 characters');
  await page.getByRole('button', { name: 'How did you prepare for your first technical interview?' }).click();
  await expect(page.getByLabel('Topic', { exact: true })).toHaveValue('Your first internship');
  await expect(page.getByLabel('Your question')).toHaveValue('How did you prepare for your first technical interview?');
  await page.getByRole('button', { name: 'Save preview question' }).click();
  await expect(page.getByRole('status')).toContainText('Question saved in preview.');
  await expect(page.getByText('No question has been sent.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Back to seniors' }).click();
  await page.getByRole('button', { name: "View Lin Chen's profile" }).click();
  await expect(page.getByRole('blockquote')).toContainText('first technical interview');
  await page.getByRole('button', { name: 'Edit question' }).click();
  await expect(page.getByLabel('Your question')).toHaveValue('How did you prepare for your first technical interview?');
  await page.getByLabel('Your question').fill('What would you practise differently before a first interview?');
  await page.getByRole('button', { name: 'Save preview question' }).click();
  await expect(page.getByRole('blockquote')).toContainText('practise differently');
  await page.getByRole('button', { name: 'Back to seniors' }).click();
  await page.getByRole('button', { name: "View Maya Tan's profile" }).click();
  await expect(page.getByLabel('Your question')).toBeEmpty();
});

test('Senior discovery and profile layouts fit desktop and mobile', async ({ page }) => {
  await page.goto('/#ask-senior');
  await page.screenshot({ path: `test-results/ask-senior-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.getByRole('button', { name: "View Lin Chen's profile" }).click();
  await page.screenshot({ path: `test-results/senior-profile-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Back to seniors' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
