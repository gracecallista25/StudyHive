import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

async function registerApiUser(request: APIRequestContext, name: string) {
  const studentId = 'integration-' + crypto.randomUUID();
  const response = await request.post('http://127.0.0.1:18765/register', { data: {
    full_name: name, student_id: studentId, password: 'examplepass', email: 'test@example.com',
    major: 'Computer Science', degree: 'bachelor', grade: 3,
  } });
  const result = await response.json();
  expect(result.status).toBe('success');
  return { id: result.user_id as string, studentId };
}

async function loginApiUser(page: Page, studentId: string) {
  await page.goto('/#login');
  await page.getByLabel('Student ID', { exact: true }).fill(studentId);
  await page.getByLabel('Password', { exact: true }).fill('examplepass');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/#home$/);
}

test.describe('supplied backend integration', () => {
  test.skip(!process.env.STUDYHIVE_BACKEND_TEST, 'Requires the supplied temporary backend on port 8000.');

  test('projects publish and teammate requests reach the API', async ({ page, request }) => {
    const owner = await registerApiUser(request, 'Project Owner');
    await loginApiUser(page, owner.studentId);
    await page.locator('a[href="#projects"]').click();
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    const title = 'API project ' + crypto.randomUUID();
    await page.getByLabel('Project name', { exact: true }).fill(title);
    await page.getByLabel('One-line summary').fill('A real API test project');
    await page.getByLabel('The idea', { exact: true }).fill('Build a campus application together.');
    await page.getByLabel('Who are you looking for?').fill('Developer');
    await page.getByLabel('Skills needed').fill('React, TypeScript');
    await page.route('**/projects', route => route.fulfill({ status: 500, body: 'Test failure' }), { times: 1 });
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Please try again');
    await expect(page.getByLabel('Project name', { exact: true })).toHaveValue(title);
    const created = page.waitForResponse(response => response.url().endsWith('/projects') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    const project = (await (await created).json()).project;
    expect(project.name).toBe(title);
    expect(project.roles[0].skills).toEqual(['React', 'TypeScript']);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    const member = await registerApiUser(request, 'Project Member');
    await loginApiUser(page, member.studentId);
    await page.locator('a[href="#projects"]').click();
    await page.getByRole('searchbox', { name: 'Search projects' }).fill(title);
    await page.getByRole('button', { name: 'View ' + title, exact: true }).click();
    await page.getByLabel('Introduce yourself').fill('I can help build the frontend.');
    const sent = page.waitForResponse(response => response.url().endsWith('/request') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Request to join', exact: true }).click();
    expect((await (await sent).json()).status).toBe('success');
    await expect(page.getByRole('heading', { name: 'Request sent', exact: true })).toBeVisible();
    await loginApiUser(page, owner.studentId);
    await page.locator('a[href="#projects"]').click();
    await page.getByRole('searchbox', { name: 'Search projects' }).fill(title);
    await page.getByRole('button', { name: 'View ' + title, exact: true }).click();
    await page.getByRole('button', { name: 'Cancel project', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'No projects found.' })).toBeVisible();
  });

  test('senior signup, availability and questions use real backend records', async ({ page, request }) => {
    const senior = await registerApiUser(request, 'Senior Account');
    await loginApiUser(page, senior.studentId);
    await page.locator('a[href="#ask-senior"]').click();
    await page.getByRole('button', { name: 'Become a senior', exact: true }).click();
    const name = 'Senior ' + crypto.randomUUID();
    await page.getByLabel('Full name', { exact: true }).fill(name);
    await page.getByLabel('Major', { exact: true }).fill('Computer Science');
    await page.getByLabel('Year of study').selectOption('3');
    await page.getByLabel('Courses you can help with').fill('Algorithms, Calculus');
    await page.getByLabel('Help topics').fill('Recursion, Exams');
    await page.getByLabel('Why would you like to become a senior?').fill('I enjoy helping students learn.');
    await page.getByLabel('When can you help?').fill('Weekday evenings');
    await page.getByRole('button', { name: 'Save senior profile' }).click();
    await expect(page.getByRole('heading', { name: 'Senior profile saved.' })).toBeVisible();
    await page.getByRole('button', { name: 'Pause my availability' }).click();
    await expect(page.getByRole('button', { name: 'Make me available' })).toBeVisible();
    await page.getByRole('button', { name: 'Make me available' }).click();
    await expect(page.getByRole('button', { name: 'Pause my availability' })).toBeVisible();
    const asker = await registerApiUser(request, 'Question Asker');
    await loginApiUser(page, asker.studentId);
    await page.locator('a[href="#ask-senior"]').click();
    await page.getByRole('searchbox', { name: 'Search seniors' }).fill(name);
    await page.getByRole('button', { name: 'Ask ' + name + ' a question', exact: true }).click();
    await page.getByLabel('Your question', { exact: true }).fill('How should I practise recursive algorithms?');
    await page.getByRole('button', { name: 'Send question', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Question sent.' })).toBeVisible();
    const asked = await (await request.get('http://127.0.0.1:18765/questions/asked/' + asker.id)).json();
    expect(asked.questions[0].question).toBe('How should I practise recursive algorithms?');
  });

  test('incoming group requests can be accepted from Notifications', async ({ page, request }) => {
    const owner = await registerApiUser(request, 'Room Owner');
    const member = await registerApiUser(request, 'Room Joiner');
    const group = await (await request.post('http://127.0.0.1:18765/study-groups', { data: {
      user_id: owner.id, course: 'Algorithms', date: '2026-10-20', start_time: '18:00', end_time: '20:00', location: 'Library', max_members: 3,
    } })).json();
    await request.post('http://127.0.0.1:18765/study-groups/' + group.group_id + '/request', { data: { from_user_id: member.id } });
    await loginApiUser(page, owner.studentId);
    await page.getByRole('link', { name: 'Notifications', exact: true }).click();
    await page.getByRole('button', { name: "Accept Room Joiner's request", exact: true }).click();
    await expect(page.getByText('Request accepted.', { exact: true })).toBeVisible();
    const updated = await (await request.get('http://127.0.0.1:18765/study-groups/' + group.group_id)).json();
    expect(updated.group.members.some((person: { id: string }) => person.id === member.id)).toBe(true);
  });
});
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
  await expect(page).toHaveURL(/#home$/);
  await page.getByRole('link', { name: 'My Profile', exact: true }).click();
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
  await page.getByLabel('Profile picture', { exact: false }).setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('alert')).toContainText('PNG, JPG, or WebP');
  expect(attempts).toBe(2);
});

test('picture upload previews, saves through the existing PATCH, and can be removed', async ({ page }) => {
  await login(page);
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=', 'base64');
  await page.getByLabel('Profile picture').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: image });
  await expect(page.locator('.profile-picture-input img')).toBeVisible();
  await expect(page.locator('.profile-summary-body > .profile-portrait img')).toHaveCount(0);
  await page.route('http://127.0.0.1:8000/profile/' + user.id, async route => {
    const body = route.request().postDataJSON();
    expect(route.request().method()).toBe('PATCH');
    expect(body).toEqual({ description: user.description, profile_picture: 'data:image/png;base64,' + image.toString('base64') });
    await route.fulfill({ json: { status: 'success', user: { ...user, ...body } } });
  });
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.locator('.profile-summary-body > .profile-portrait img')).toBeVisible();
  await page.getByRole('button', { name: 'Remove picture' }).click();
  await expect(page.locator('.profile-picture-input img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Discard changes' }).click();
  await expect(page.locator('.profile-picture-input img')).toBeVisible();
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
test('profile fits required desktop sizes and reload requires login', async ({ page }) => {
  await login(page);
  for (const { width, height } of [page.viewportSize()!]) {
    expect([
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ]).toContainEqual({ width, height });
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
