import { test, expect } from '@playwright/test';

test('Notifications filters, read state and preview decisions work', async ({ page }) => {
  await page.goto('/#home');
  await page.getByRole('link', { name: 'Notifications', exact: true }).click();
  await expect(page).toHaveTitle('Notifications · StudyHive');
  await expect(page.getByRole('link', { name: 'Notifications', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('Interactive preview', { exact: false })).toBeVisible();
  const inbox = page.getByRole('region', { name: 'Notification inbox' });
  await expect(inbox.getByRole('listitem')).toHaveCount(5);
  await inbox.getByRole('button', { name: 'Requests', exact: true }).click();
  await expect(inbox.getByRole('listitem')).toHaveCount(2);
  await inbox.getByRole('button', { name: "Accept Maya Tan's request", exact: true }).click();
  await expect(inbox.getByText('Accepted', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('No real membership was changed');
  await inbox.getByRole('button', { name: "Decline Lin Chen's request", exact: true }).click();
  await expect(inbox.getByText('Declined', { exact: true })).toBeVisible();
  await inbox.getByRole('button', { name: 'Unread 1', exact: true }).click();
  await expect(inbox.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Mark all as read', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re all caught up.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark all as read', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'View all notifications', exact: true }).click();
  await inbox.getByRole('button', { name: /Alex Wu accepted/ }).click();
  await expect(page.getByRole('complementary', { name: 'Notification details' }).getByRole('heading', { name: 'Alex Wu' })).toBeVisible();
  await page.getByRole('button', { name: 'Close notification details' }).click();
  await expect(page.getByRole('complementary', { name: 'Notification details' })).toHaveCount(0);
});

test('Notification layout fits desktop and mobile', async ({ page }) => {
  await page.goto('/#notifications');
  await page.screenshot({ path: `test-results/notifications-${page.viewportSize()!.width}.png`, fullPage: true });
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { name: 'Notifications', exact: true })).toBeVisible();
  }
});
