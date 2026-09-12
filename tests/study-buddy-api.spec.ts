import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
const person = { id: 'owner', full_name: 'Alex Chen', major: 'Computer Science', degree: 'bachelor', grade: 2, profile_picture: '' };
const listing = { id: 'listing-1', course: 'Data Structures', date: '2026-10-20', start_time: '19:00', end_time: '20:00', location: 'Library', notes: 'Practice graphs.', status: 'open', created_by: person };
async function login(page: Page) {
  await page.route('**/login', route => route.fulfill({ json: { status: 'success', user_id: 'viewer', user: { id: 'viewer' } } }));
  await page.route('**/users/viewer', route => route.fulfill({ json: { status: 'success', user: { ...person, full_name: 'Demo Student' } } }));
  await page.goto('/#login');
  await page.getByLabel('Student ID', { exact: true }).fill('demo');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/#home$/);
  await page.locator('.home-feature-primary').click();
}
async function search(page: Page) {
  await page.getByLabel('Course', { exact: true }).fill('Data Structures');
  await page.getByRole('option', { name: 'Data Structures', exact: true }).click();
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
}
test('example students are accessible without sending backend requests', async ({ page }) => {
  let apiCalls = 0;
  await page.route('**/study-buddy**', route => {
    if (route.request().resourceType() === 'fetch') { apiCalls++; return route.abort(); }
    return route.continue();
  });
  await page.goto('/#study-buddy');
  await page.getByLabel('Course', { exact: true }).fill('Calculus');
  await page.getByRole('option', { name: 'Calculus', exact: true }).click();
  await page.getByRole('button', { name: 'Browse example students' }).click();
  await expect(page.locator('.student-card')).toContainText('Ava Liu');
  await page.getByRole('button', { name: 'Study Together' }).click();
  await expect(page.getByRole('status')).toContainText('Study request sent to Ava Liu.');
  expect(apiCalls).toBe(0);
  await page.getByRole('button', { name: 'Back to real listings' }).click();
  await expect(page.getByLabel('Course', { exact: true })).toHaveValue('Calculus');
});
test('loads listings and sends exact request with rejection and retry', async ({ page }) => {
  await page.route('**/study-buddy?*', route => {
    const query = new URL(route.request().url()).searchParams;
    expect(query.get('course')).toBe('Data Structures'); expect(query.get('viewer_id')).toBe('viewer');
    return route.fulfill({ json: { status: 'success', listings: [listing, { ...listing, id: 'listing-2' }, { ...listing, id: 'own', created_by: { ...person, id: 'viewer' } }] } });
  });
  let calls = 0;
  await page.route('**/study-buddy/listing-1/request', route => {
    calls++; expect(route.request().postDataJSON()).toEqual({ from_user_id: 'viewer' });
    return route.fulfill({ json: calls === 1 ? { status: 'failed', reason: 'This listing is no longer open' } : { status: 'success', request_id: 'request-1' } });
  });
  await login(page); await search(page);
  await expect(page.locator('.buddy-count')).toHaveText('2 open study listings');
  await expect(page.locator('.student-card')).toContainText('Alex Chen');
  await expect(page.locator('.student-card')).toContainText('19:00–20:00');
  await expect(page.getByText('Online now')).toHaveCount(0);
  await page.getByRole('button', { name: 'Study Together' }).click();
  await expect(page.getByRole('alert')).toContainText('no longer open');
  await page.getByRole('button', { name: 'Study Together' }).click();
  await expect(page.getByRole('status')).toHaveText('Study request sent to Alex Chen.');
  await expect(page.getByRole('button', { name: 'Request sent' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Request sent' })).toBeDisabled();
  expect(calls).toBe(2);
});
test('empty search can publish the exact listing payload', async ({ page }) => {
  await page.route('**/study-buddy?*', route => route.fulfill({ json: { status: 'success', listings: [] } }));
  await page.route('**/study-buddy', route => {
    expect(route.request().postDataJSON()).toEqual({ user_id: 'viewer', course: 'Data Structures', date: '2026-10-20', start_time: '19:00', end_time: '20:00', location: 'Library', notes: 'Practice graphs.' });
    return route.fulfill({ json: { status: 'success', listing_id: listing.id, listing } });
  });
  await login(page); await search(page);
  await expect(page.getByText('No study buddies found right now.')).toBeVisible();
  await page.getByRole('button', { name: 'Create a study listing' }).click();
  await page.getByLabel('Date', { exact: true }).fill('2026-10-20');
  await page.getByLabel('Start time').fill('19:00'); await page.getByLabel('End time').fill('20:00');
  await page.getByLabel('Location', { exact: true }).fill('Library'); await page.getByLabel('Notes (optional)').fill('Practice graphs.');
  await page.getByRole('button', { name: 'Publish listing' }).click();
  await expect(page.getByRole('status')).toContainText('Your study listing is published.');
});
test('failed loads never show mock results and visitors cannot send', async ({ page }) => {
  let fail = true;
  await page.route('**/study-buddy?*', route => fail ? route.abort() : route.fulfill({ json: { status: 'success', listings: [listing] } }));
  await page.goto('/#study-buddy'); await search(page);
  await expect(page.getByRole('alert')).toContainText('Could not reach the backend');
  await expect(page.locator('.student-card')).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.locator('.student-card')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Study Together' })).toBeDisabled();
});


test('expanded search sends backend filters and preserves them when changing results', async ({ page }, testInfo) => {
  let query: URLSearchParams | undefined;
  await page.route('**/study-buddy?*', route => {
    query = new URL(route.request().url()).searchParams;
    return route.fulfill({ json: { status: 'success', listings: [listing] } });
  });
  await login(page);
  await page.getByLabel('Major', { exact: true }).selectOption('Computer Science');
  await page.getByLabel('Date', { exact: true }).fill('2026-10-20');
  await page.getByLabel('Start time', { exact: true }).fill('18:00');
  await page.getByLabel('End time', { exact: true }).fill('21:00');
  await page.getByLabel('Location', { exact: true }).fill(' Library ');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('expanded-search.png'), fullPage: true });
  await search(page);
  expect(Object.fromEntries(query!)).toEqual({ course: 'Data Structures', viewer_id: 'viewer', major: 'Computer Science', date: '2026-10-20', start_time: '18:00', end_time: '21:00', location: 'Library' });
  await expect(page.locator('.buddy-selection')).toContainText('Computer Science');
  await page.getByRole('button', { name: 'Change', exact: true }).click();
  await expect(page.getByLabel('Start time', { exact: true })).toHaveValue('18:00');
  await expect(page.getByLabel('Major', { exact: true })).toHaveValue('Computer Science');
  await page.getByRole('button', { name: 'Clear optional filters' }).click();
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  expect(Object.fromEntries(query!)).toEqual({ course: 'Data Structures', viewer_id: 'viewer' });
});
test('search requires a complete increasing time range before calling backend', async ({ page }) => {
  let calls = 0;
  await page.route('**/study-buddy?*', route => { calls++; return route.fulfill({ json: { status: 'success', listings: [] } }); });
  await page.goto('/#study-buddy');
  await page.getByLabel('Start time', { exact: true }).fill('19:00');
  await search(page);
  await expect(page.getByRole('alert')).toContainText('Enter both start and end time');
  await page.getByLabel('End time', { exact: true }).fill('18:00');
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.getByRole('alert')).toContainText('End time must be after start time');
  expect(calls).toBe(0);
  await page.getByLabel('End time', { exact: true }).fill('20:00');
  await page.getByRole('button', { name: 'Find Study Buddies' }).click();
  await expect(page.getByText('No study buddies found right now.')).toBeVisible();
  expect(calls).toBe(1);
});
