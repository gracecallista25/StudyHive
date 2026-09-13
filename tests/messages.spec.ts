import { expect, test } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.goto('/#messages'); });
test('navigation counts unopened chats and clears them when opened', async ({ page }, info) => {
  const badge = page.locator('.sidebar .unread-chat-badge');
  await expect(badge).toHaveText('3');
  await expect(page.locator('.nav-account-group .nav-item')).toHaveText(['Messages3', 'Notifications', 'My Profile']);
  for (const [index, name] of ['Algorithms Circle', 'Maya Tan', 'Alex Wu'].entries()) {
    await page.locator('.msg-conversation').filter({ hasText: name }).click();
    if (index < 2) await expect(badge).toHaveText(String(2 - index));
    else await expect(badge).toHaveCount(0);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Back to conversations' }).click();
  }
  await page.reload();
  await expect(badge).toHaveCount(0);
  await page.goto('/#home');
  await expect(page.locator('.home-account-bar .unread-chat-badge')).toHaveCount(0);
});
test('theme, personal messages, drafts, attachments and persistence', async ({ page }, info) => {
  await expect(page.getByRole('heading', { name: 'Messages', exact: true })).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(23, 61, 48)');
  await expect(page.locator('.nav-item.active')).toHaveCSS('background-color', 'rgb(255, 220, 103)');
  await page.locator('.msg-conversation').filter({ hasText: 'Lin Chen' }).click();
  const editor = page.getByRole('textbox', { name: 'Message Lin Chen', exact: true });
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
  await editor.fill('Testing a saved personal message');
  await editor.press('Enter');
  await expect(page.getByRole('log')).toContainText('Testing a saved personal message');
  await page.reload();
  if (info.project.name === 'mobile') await page.locator('.msg-conversation').filter({ hasText: 'Lin Chen' }).click();
  await expect(page.getByRole('log')).toContainText('Testing a saved personal message');
  await page.locator('input[type=file]').setInputFiles({ name: 'study-plan.txt', mimeType: 'text/plain', buffer: Buffer.from('Review BFS and DFS.') });
  await expect(page.locator('.msg-pending')).toContainText('study-plan.txt');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('link', { name: /study-plan.txt/ })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: /study-plan.txt/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('study-plan.txt');
  await page.screenshot({ path: info.outputPath('personal.png'), fullPage: true });
});
test('filters, group details and local group creation', async ({ page }, info) => {
  await page.getByRole('button', { name: 'Groups', exact: true }).click();
  await expect(page.locator('.msg-conversation')).toHaveCount(3);
  await page.getByRole('textbox', { name: 'Search messages' }).fill('missing group');
  await expect(page.getByText('No conversations found')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.locator('.msg-conversation').filter({ hasText: 'Algorithms Circle' }).click();
  await expect(page.locator('.msg-pinned')).toContainText('Friday, 4 PM');
  await page.getByRole('button', { name: 'Conversation details', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Group details' })).toBeVisible();
  await page.getByRole('button', { name: 'Shared files', exact: true }).click();
  await expect(page.locator('.msg-shared')).toContainText('Algorithms notes.txt');
  await page.screenshot({ path: info.outputPath('group.png'), fullPage: true });
  await page.getByRole('button', { name: 'Close details' }).click();
  await page.getByRole('button', { name: 'New message' }).click();
  await page.getByRole('button', { name: 'Group chat', exact: true }).click();
  await page.getByRole('textbox', { name: 'Group name' }).fill('Friday Study Circle');
  await page.getByRole('checkbox', { name: /Lin Chen/ }).check();
  await page.getByRole('checkbox', { name: /Maya Tan/ }).check();
  await page.getByRole('button', { name: 'Create group' }).click();
  await expect(page.getByRole('heading', { name: 'Friday Study Circle', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Message Friday Study Circle' }).fill('Welcome, team!');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Welcome, team!');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('clean reference layouts and per-conversation drafts', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.msg-conversation').filter({ hasText: 'Lin Chen' }).click();
  await page.getByRole('textbox', { name: 'Message Lin Chen', exact: true }).fill('An unsent thought');
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Back to conversations' }).click();
  await page.locator('.msg-conversation').filter({ hasText: 'Maya Tan' }).click();
  await expect(page.getByRole('textbox', { name: 'Message Maya Tan' })).toBeEmpty();
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Back to conversations' }).click();
  await page.locator('.msg-conversation').filter({ hasText: 'Lin Chen' }).click();
  await expect(page.getByRole('textbox', { name: 'Message Lin Chen', exact: true })).toHaveValue('An unsent thought');
  await page.getByRole('textbox', { name: 'Message Lin Chen', exact: true }).fill('');
  await page.screenshot({ path: info.outputPath('reference-personal.png'), fullPage: true, animations: 'disabled' });
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Back to conversations' }).click();
  await page.locator('.msg-conversation').filter({ hasText: 'Algorithms Circle' }).click();
  await page.getByRole('button', { name: 'Conversation details', exact: true }).click();
  await page.screenshot({ path: info.outputPath('reference-group.png'), fullPage: true, animations: 'disabled' });
  if (info.project.name !== 'mobile') {
    const chatBox = await page.locator('.msg-chat').boundingBox();
    const detailsBox = await page.locator('.msg-details').boundingBox();
    expect(chatBox!.x + chatBox!.width).toBeLessThanOrEqual(detailsBox!.x + 1);
  }
});

