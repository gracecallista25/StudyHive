export interface GroupPerson {
  id: string;
  full_name: string;
}

export interface StudyGroup {
  id: string;
  course: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string | null;
  status: 'open' | 'full' | 'cancelled';
  max_members: number;
  member_count: number;
  members: GroupPerson[];
  created_by: GroupPerson;
}

export interface NewGroup {
  user_id: string;
  course: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  max_members: number;
}

async function request(path: string, method = 'GET', body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) {
    throw new Error('The backend is not connected. Configure VITE_API_BASE_URL to load study rooms.');
  }

  let response: Response;
  try {
    response = await fetch(base + path, {
      method,
      signal: AbortSignal.timeout(15000),
      ...(body === undefined ? {} : {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new Error('Could not reach the backend. Please try again.');
  }

  const data = await response.json().catch(() => null);
  if (data?.status === 'failed') {
    throw new Error(typeof data.reason === 'string' ? data.reason : 'The request was rejected.');
  }
  if (!response.ok || data?.status !== 'success') {
    throw new Error('The server could not complete this request.');
  }
  return data;
}

function parseGroup(value: unknown): StudyGroup {
  if (!value || typeof value !== 'object') {
    throw new Error('The backend returned an invalid room.');
  }

  const group = value as StudyGroup;
  const row = value as Record<string, unknown>;
  const hasRequiredText = ['id', 'course', 'date', 'start_time', 'end_time', 'location'].every(
    key => typeof row[key] === 'string',
  );
  const hasValidMembers = Array.isArray(group.members) && group.members.every(
    member => typeof member?.id === 'string' && typeof member.full_name === 'string',
  );
  const hasValidCreator = typeof group.created_by?.id === 'string' && typeof group.created_by.full_name === 'string';
  const hasValidStatus = ['open', 'full', 'cancelled'].includes(group.status);
  const hasValidCapacity = Number.isInteger(group.max_members) && group.max_members >= 2;
  const hasValidCount = Number.isInteger(group.member_count);
  const hasValidNotes = group.notes === null || typeof group.notes === 'string';

  if (!hasRequiredText || !hasValidStatus || !hasValidCapacity || !hasValidCount || !hasValidMembers || !hasValidCreator || !hasValidNotes) {
    throw new Error('The backend returned incomplete room details.');
  }
  return group;
}

export async function browseGroups(filters: Record<string, string>, userId: string | null) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim());
  }
  if (userId) params.set('viewer_id', userId);

  const data = await request('/study-groups?' + params);
  if (!Array.isArray(data.groups)) {
    throw new Error('The backend did not return study rooms.');
  }
  return data.groups.map(parseGroup);
}

export async function createGroup(input: NewGroup) {
  const data = await request('/study-groups', 'POST', input);
  return parseGroup(data.group);
}

export async function refreshGroup(id: string) {
  const data = await request('/study-groups/' + encodeURIComponent(id));
  return parseGroup(data.group);
}

export async function joinGroup(id: string, userId: string) {
  const data = await request('/study-groups/' + encodeURIComponent(id) + '/request', 'POST', { from_user_id: userId });
  if (typeof data.request_id !== 'string') {
    throw new Error('The backend did not confirm your request.');
  }
}

export async function cancelGroup(id: string, userId: string) {
  await request('/study-groups/' + encodeURIComponent(id) + '?user_id=' + encodeURIComponent(userId), 'DELETE');
}
