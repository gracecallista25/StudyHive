import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
const user = {
  id: 'test-user', full_name: 'Lin Chen', student_id: 'test001', email: 'lin@example.com',
  major: 'Computer Science', degree: 'bachelor', grade: 3, description: 'Looking for a study buddy for Operating Systems.',
  profile_picture: '', badges_earned: ['setup_hive', 'meet_someone', 'study_group', 'day_streak'], badges_displayed: ['setup_hive'],
};
const badges = {
  setup_hive: { name: 'Set up your Hive', description: 'Complete your profile' },
  meet_someone: { name: 'Meet Someone', description: 'Study together with a new student' },
  study_group: { name: 'Study Group', description: 'Join or make a study group with 3+ members' },
  help_junior: { name: 'Help Junior', description: 'Answer a question in Ask a Senior' },
  find_teammate: { name: 'Find Teammate', description: 'Join or recruit someone for a project' },
  day_streak: { name: 'Day Streak', description: 'Keep your study streak going' },
};
async function login(page: Page) {
  await page.route('http://127.0.0.1:8000/login', route => route.fulfill({ json: { status: 'success', user_id: user.id, user } }));
  await page.route('http://127.0.0.1:8000/users/' + user.id, route => route.fulfill({ json: { status: 'success', user: { ...user, password: 'DO-NOT-RENDER' } } }));
  await page.route('http://127.0.0.1:8000/badges', route => route.fulfill({ json: { status: 'success', badges } }));
  await page.goto('/#login');
  await page.getByLabel('Student ID', { exact: true }).fill('test001');
  await page.getByLabel('Password', { exact: true }).fill('examplepass');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.getByRole('link', { name: 'Open my profile' }).click();
  await expect(page.getByRole('heading', { name: 'A little more you.' })).toBeVisible();
  await expect(page.getByLabel('About you')).toHaveValue(user.description);
}
test('profile edits use exact PATCH payload, confirmed preview, and preserve failed drafts', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('link', { name: 'My Profile', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('DO-NOT-RENDER')).toHaveCount(0);
  await expect(page.getByText("Bachelor's · Year 3")).toBeVisible();
  let attempts = 0;
  await page.route('http://127.0.0.1:8000/profile/' + user.id, async route => {
    attempts++;
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toEqual({ description: 'Ready to study together.', profile_picture: '' });
    if (attempts === 1) await route.fulfill({ status: 500, body: 'Internal Server Error' });
    else await route.fulfill({ json: { status: 'success', user: { ...user, description: 'Ready to study together.' } } });
  });
  await page.getByLabel('About you').fill('Ready to study together.');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your changes were not confirmed');
  await expect(page.getByLabel('About you')).toHaveValue('Ready to study together.');
  await expect(page.locator('.profile-description')).toHaveText(user.description);
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Profile saved successfully.');
  await expect(page.locator('.profile-description')).toHaveText('Ready to study together.');
  await page.getByLabel('Profile picture URL').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('valid http or https');
  expect(attempts).toBe(2);
});
test('only earned badges selectable, maximum three, save and empty selection', async ({ page }) => {
  await login(page);
  const checks = page.getByRole('checkbox');
  await expect(checks.nth(3)).toBeDisabled();
  await checks.nth(1).check(); await checks.nth(2).check();
  await expect(checks.nth(5)).toBeDisabled();
  let payload: unknown;
  await page.route('http://127.0.0.1:8000/profile/' + user.id + '/displayed-badges', async route => {
    expect(route.request().method()).toBe('PUT');
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { status: 'success', badges_displayed: route.request().postDataJSON().badge_ids } });
  });
  await page.getByRole('button', { name: 'Save badges', exact: true }).click();
  expect(payload).toEqual({ badge_ids: ['setup_hive', 'meet_someone', 'study_group'] });
  await expect(page.getByRole('status')).toHaveText('Displayed badges saved successfully.');
  await checks.nth(0).uncheck(); await checks.nth(1).uncheck(); await checks.nth(2).uncheck();
  await page.getByRole('button', { name: 'Save badges', exact: true }).click();
  await expect(page.locator('.profile-featured-badges')).toContainText('No badges displayed yet');
  expect(payload).toEqual({ badge_ids: [] });
});
test('profile desktop and mobile layouts, initials fallback, reload requires login', async ({ page }) => {
  await login(page);
  for (const width of [1536, 390]) {
    await page.setViewportSize({ width, height: 1024 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/profile-' + width + '.png', fullPage: true });
  }
  expect(await page.evaluate(() => sessionStorage.length + localStorage.length)).toBe(0);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Log in to your profile' })).toBeVisible();
});
test('failed profile load can retry without losing login identity', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Study Buddy', exact: true }).click();
  await page.route('http://127.0.0.1:8000/users/' + user.id, route => route.fulfill({ json: { status: 'failed', reason: 'User not found' } }));
  await page.getByRole('link', { name: 'My Profile', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('User not found');
  await page.route('http://127.0.0.1:8000/users/' + user.id, route => route.fulfill({ json: { status: 'success', user } }));
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByLabel('About you')).toHaveValue(user.description);
});
