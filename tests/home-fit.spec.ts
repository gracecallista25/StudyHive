import { test, expect } from '@playwright/test';
test('homepage fills desktop viewport without clipping content', async ({ page }, info) => {
  await page.goto('/#home');
  const viewport = page.viewportSize()!;
  const bounds = await page.locator('.home-page').boundingBox();
  expect(bounds!.x).toBe(0);
  expect(bounds!.width).toBe(viewport.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  if (viewport.width >= 1051) {
    expect(bounds!.height).toBeGreaterThanOrEqual(viewport.height);
    expect(bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
    const activity = await page.locator('.home-activity li').last().boundingBox();
    expect(activity!.y + activity!.height).toBeLessThanOrEqual(viewport.height);
  }
  await page.screenshot({ path: info.outputPath('home-fit.png'), fullPage: true });
  await page.getByRole('button', { name: 'View all' }).click();
  await expect(page.locator('#home-online-list')).toBeVisible();
});
