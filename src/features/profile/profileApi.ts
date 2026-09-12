import type { BadgeCatalogue, Profile, ProfileUpdate } from './profileTypes';

async function request(path: string, method = 'GET', body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) throw new Error('The backend is not connected. Please connect it and log in.');
  let response: Response;
  try {
    response = await fetch(base + path, {
      method, signal: AbortSignal.timeout(15000),
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch { throw new Error('Could not reach the backend. Please try again.'); }
  if (!response.ok) throw new Error(response.status >= 500
    ? 'The backend could not complete this request. Your changes were not confirmed. Please try again or contact the team.'
    : 'The backend could not accept this request. Please try again.');
  const data = await response.json().catch(() => null);
  if (data?.status === 'failed') throw new Error(typeof data.reason === 'string' ? data.reason : 'The request failed.');
  if (data?.status !== 'success') throw new Error('The backend returned an unexpected response.');
  return data;
}
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
// Allowlist fields: the supplied GET /users response also contains a password.
// Never copy that extra field into UI state, storage, logs or forms.
function profile(value: unknown, id: string): Profile {
  if (!value || typeof value !== 'object') throw new Error('The backend did not return a profile.');
  const row = value as Record<string, unknown>;
  if (typeof row.full_name !== 'string' || typeof row.grade !== 'number') throw new Error('The profile response is incomplete.');
  const text = (key: string) => typeof row[key] === 'string' ? row[key] as string : '';
  return { id, full_name: text('full_name'), student_id: text('student_id'), email: text('email'),
    major: text('major'), degree: text('degree'), grade: row.grade, description: text('description'),
    profile_picture: text('profile_picture'), badges_earned: strings(row.badges_earned), badges_displayed: strings(row.badges_displayed) };
}
export async function loadProfile(id: string) {
  return profile((await request('/users/' + encodeURIComponent(id))).user, id);
}
export async function loadBadges(): Promise<BadgeCatalogue> {
  const data = (await request('/badges')).badges;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('The badge catalogue could not be loaded.');
  const entries = Object.entries(data).filter((entry): entry is [string, { name: string; description: string }] => {
    const value = entry[1];
    return !!value && typeof value === 'object' && 'name' in value && typeof value.name === 'string' && 'description' in value && typeof value.description === 'string';
  });
  return Object.fromEntries(entries);
}
export async function saveProfile(id: string, input: ProfileUpdate) {
  return profile((await request('/profile/' + encodeURIComponent(id), 'PATCH', input)).user, id);
}
export async function saveDisplayedBadges(id: string, badge_ids: string[]) {
  const data = await request('/profile/' + encodeURIComponent(id) + '/displayed-badges', 'PUT', { badge_ids });
  if (!Array.isArray(data.badges_displayed) || data.badges_displayed.some((id: unknown) => typeof id !== 'string')) throw new Error('The backend did not confirm your badge selection.');
  return data.badges_displayed as string[];
}
