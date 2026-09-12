import { test, expect } from '@playwright/test';
test('four profiles, local filters, empty state and reset', async ({ page }) => {
  await page.goto('/#study-buddy');
  await expect(page.getByRole('heading', { name: 'Find your people.' })).toBeVisible();
  await expect(page.locator('.student-card')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'My Profile', exact: true })).toBeInViewport({ ratio: 1 });
  await expect(page.getByLabel('Study style', { exact: true })).toHaveCount(0);
  await expect(page.locator('.student-description')).toHaveCount(4);
  await page.getByLabel('Course', { exact: true }).selectOption('Operating Systems');
  await expect(page.locator('.student-card')).toHaveCount(1);
  await expect(page.getByText('1 student found', { exact: true })).toBeVisible();
  await page.getByLabel('Major', { exact: true }).selectOption('Chemistry');
  await expect(page.getByText('No study buddies found just yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Show all students' }).click();
  await expect(page.locator('.student-card')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'My Profile', exact: true })).toBeInViewport({ ratio: 1 });
  await page.getByRole('switch', { name: 'Free Tonight' }).click();
  await expect(page.locator('.student-card')).toHaveCount(2);
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  await page.getByLabel('Time', { exact: true }).selectOption('13:00-15:00');
  await expect(page.locator('.student-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByLabel('Year of study', { exact: true }).selectOption('1');
  await expect(page.locator('.student-card')).toHaveCount(1);
});
test('profile request state, keyboard close, focus return and session-only behavior', async ({ page }) => {
  await page.goto('/#study-buddy');
  const view = page.getByRole('button', { name: 'View profile' }).first();
  await view.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Lin Chen' })).toBeVisible();
  await page.screenshot({ path: 'test-results/studyhive-profile.png' });
  await dialog.getByRole('button', { name: 'Send Study Request' }).click();
  await expect(dialog.getByRole('button', { name: 'Request sent', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('status')).toContainText('Study request sent.');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(view).toBeFocused();
  await view.click();
  await expect(dialog.getByRole('button', { name: 'Request sent', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Close profile' }).click();
  await page.reload();
  await view.click();
  await expect(dialog.getByRole('button', { name: 'Send Study Request' })).toBeEnabled();
  await page.mouse.click(10, 10);
  await expect(dialog).not.toBeVisible();
});
test('required desktop sizes remain within viewport with usable modal', async ({ page }) => {
  for (const { width, height } of [page.viewportSize()!]) {
    expect([
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ]).toContainEqual({ width, height });
    await page.goto('/#study-buddy');
    await expect(page.locator('.student-card')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'My Profile', exact: true })).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/studyhive-' + width + '.png', fullPage: true });
    await page.getByRole('button', { name: 'View profile' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 });
    await page.getByRole('button', { name: 'Close profile' }).click();
  }
});

test('degree uses registration majors and years; time combines with filters', async ({ page }) => {
  await page.goto('/#study-buddy');
  await page.getByLabel('Degree', { exact: true }).selectOption('master');
  await expect(page.locator('.student-card')).toHaveCount(2);
  await expect(page.getByLabel('Major', { exact: true }).locator('option')).toHaveCount(14);
  await expect(page.getByLabel('Year of study', { exact: true }).locator('option')).toHaveCount(4);
  await page.getByLabel('Major', { exact: true }).selectOption('Electronic Engineering');
  await page.getByLabel('Time', { exact: true }).selectOption('09:00-12:00');
  await expect(page.locator('.student-card')).toHaveCount(1);
  await expect(page.locator('.student-card')).toContainText('Maya Tan');
  await expect(page.locator('.student-card')).toContainText("Master's");
  await page.getByLabel('Degree', { exact: true }).selectOption('bachelor');
  await expect(page.getByLabel('Major', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Year of study', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Major', { exact: true }).locator('option')).toHaveCount(9);
  await expect(page.getByLabel('Year of study', { exact: true }).locator('option')).toHaveCount(6);
  await expect(page.getByText('No study buddies found just yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByLabel('Degree', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Time', { exact: true })).toHaveValue('');
  await expect(page.locator('.student-card')).toHaveCount(4);
});
