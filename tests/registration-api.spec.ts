import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function fill(page: Page) {
  await page.goto('/#register');
  await page.getByLabel('Full name', { exact: true }).fill('Demo Student');
  await page.getByLabel('Student ID', { exact: true }).fill('demo123');
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Degree', { exact: true }).selectOption('bachelor');
  await page.getByLabel('Major', { exact: true }).selectOption('Computer Science');
  await page.getByLabel('Year of study', { exact: true }).selectOption('5');
  await page.getByLabel('Password', { exact: true }).fill('samplepass');
  await page.getByLabel('Confirm password', { exact: true }).fill('samplepass');
}
test('degree restricts exact majors and years and clears stale choices', async ({ page }) => {
  await page.goto('/#register');
  await expect(page.getByLabel('Major', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Year of study', { exact: true })).toBeDisabled();
  await fill(page);
  await expect(page.getByLabel('Major', { exact: true }).locator('option')).toHaveCount(9);
  await page.getByLabel('Degree', { exact: true }).selectOption('master');
  await expect(page.getByLabel('Major', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Year of study', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Major', { exact: true }).locator('option')).toHaveCount(14);
  await expect(page.getByLabel('Year of study', { exact: true }).locator('option')).toHaveText(['Choose your year', 'Year 1', 'Year 2', 'Year 3']);
  await expect(page.getByLabel('Major', { exact: true }).locator('option[value="Computer Science"]')).toHaveCount(0);
  await page.getByLabel('Major', { exact: true }).selectOption('Computer Technology');
  await page.screenshot({ path: 'test-results/register-connected.png', fullPage: true });
});
test('sends exact typed payload once and clears passwords only on confirmed success', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let count = 0;
  await page.route('http://127.0.0.1:8000/register', async route => {
    count++;
    expect(route.request().postDataJSON()).toEqual({
      full_name: 'Demo Student', student_id: 'demo123', email: 'student@example.com',
      password: 'samplepass', degree: 'bachelor', major: 'Computer Science', grade: 5,
    });
    await gate;
    await route.fulfill({ json: { status: 'success', user_id: 'demo-id', user: { id: 'demo-id' } } });
  });
  await fill(page);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
  release();
  await expect(page.getByRole('status')).toContainText('Account created successfully');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  expect(count).toBe(1);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});
test('shows backend rejection, HTTP validation and network errors without false success', async ({ page }) => {
  let attempt = 0;
  await page.route('http://127.0.0.1:8000/register', async route => {
    attempt++;
    if (attempt === 1) await route.fulfill({ json: { status: 'failed', reason: 'Student ID already registered' } });
    else if (attempt === 2) await route.fulfill({ status: 422, json: { detail: [] } });
    else await route.abort('failed');
  });
  await fill(page);
  const submit = page.getByRole('button', { name: 'Create account', exact: true });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Student ID already registered');
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Please check the form');
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Could not confirm registration');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(submit).toBeEnabled();
});

test('login reports API success, rejected credentials and connection failure', async ({ page }) => {
  let attempt = 0;
  await page.route('http://127.0.0.1:8000/login', async route => {
    expect(route.request().postDataJSON()).toEqual({ student_id: 'demo123', password: 'samplepass' });
    attempt++;
    if (attempt === 1) await route.fulfill({ json: { status: 'success', user_id: 'demo-id', user: { id: 'demo-id' } } });
    else if (attempt === 2) await route.fulfill({ json: { status: 'failed', reason: 'Either student ID or password is incorrect' } });
    else await route.abort('failed');
  });
  await page.goto('/#login');
  await page.getByLabel('Student ID', { exact: true }).fill('demo123');
  await page.getByLabel('Password', { exact: true }).fill('samplepass');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/#home$/);
  await expect(page.getByRole('navigation', { name: 'Account navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/login-success.png', fullPage: true });
  await page.goto('/#login');
  await page.getByLabel('Student ID', { exact: true }).fill('demo123');
  await page.getByLabel('Password', { exact: true }).fill('samplepass');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Login failed. Either student ID or password is incorrect');
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not confirm login');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});
