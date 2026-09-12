import { test, expect } from '@playwright/test';
test('student ID login validates, toggles passwords, and stays explicitly unconnected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good to see you.' })).toBeVisible();
  await expect(page.getByLabel('Email', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByLabel('Student ID', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Student ID', { exact: true }).fill('demo123');
  await page.getByLabel('Password', { exact: true }).fill('samplepass');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('No sign-in was performed.');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('link', { name: 'Explore demo' }).click();
  await expect(page.getByRole('heading', { name: 'Find your people.' })).toBeVisible();
  await expect(page.getByLabel('Year of study', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Entry year', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Back to login' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});
test('registration fields, validation and no account creation', async ({ page }) => {
  await page.goto('/#register');
  await expect(page.getByLabel('Username', { exact: true })).toHaveCount(0);
  await page.getByLabel('Full name', { exact: true }).fill('Demo Student');
  await page.getByLabel('Student ID', { exact: true }).fill('demo123');
  await page.getByLabel('Email', { exact: true }).fill('not-an-email');
  await page.getByLabel('Degree', { exact: true }).selectOption('bachelor');
  await page.getByLabel('Major', { exact: true }).selectOption('Computer Science');
  await page.getByLabel('Year of study', { exact: true }).selectOption('2');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm password', { exact: true }).fill('different');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Your passwords do not match.')).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Password', { exact: true }).fill('samplepass');
  await page.getByLabel('Confirm password', { exact: true }).fill('samplepass');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('No account was created');
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  await page.reload();
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});
test('auth screens fit required desktop sizes', async ({ page }) => {
  for (const { width, height } of [page.viewportSize()!]) {
    expect([
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ]).toContainEqual({ width, height });
    for (const route of ['login', 'register']) {
      await page.goto('/#' + route);
      await expect(page.getByLabel('Student ID', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: route === 'login' ? 'Log in' : 'Create account', exact: true })).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: 'test-results/' + route + '-' + width + '.png', fullPage: true });
    }
  }
});
