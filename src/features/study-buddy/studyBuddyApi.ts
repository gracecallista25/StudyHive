export const studyBuddyConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

export interface Listing {
  id: string;
  course: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string | null;
  status: 'open' | 'matched' | 'cancelled';
  created_by: {
    id: string;
    full_name: string;
    major: string;
    degree: string;
    grade: number;
    profile_picture: string;
  };
}

export interface NewListing {
  user_id: string;
  course: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
}

export interface ListingSearchFilters {
  major: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
}

async function request(path: string, method = 'GET', body?: unknown): Promise<Record<string, unknown>> {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) throw new Error('The backend is not connected.');

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
  if (!response.ok) {
    throw new Error(response.status === 422 ? 'Please check your listing details.' : 'The server could not complete this request.');
  }
  if (data?.status !== 'success') throw new Error('The backend returned an unexpected response.');
  return data;
}

function parseListing(value: unknown): Listing {
  if (!value || typeof value !== 'object') throw new Error('The backend returned an invalid listing.');
  const row = value as Record<string, unknown>;
  const creator = row.created_by as Record<string, unknown> | undefined;
  const hasRequiredListingFields = ['id', 'course', 'date', 'start_time', 'end_time', 'location'].every(
    key => typeof row[key] === 'string',
  );
  const hasRequiredCreatorFields = creator && ['id', 'full_name', 'major', 'degree', 'profile_picture'].every(
    key => typeof creator[key] === 'string',
  );
  const hasValidStatus = ['open', 'matched', 'cancelled'].includes(String(row.status));
  const hasValidNotes = row.notes === null || typeof row.notes === 'string';

  if (!creator || !hasRequiredListingFields || !hasRequiredCreatorFields || typeof creator.grade !== 'number' || !hasValidStatus || !hasValidNotes) {
    throw new Error('The backend returned an incomplete listing.');
  }

  return {
    id: row.id as string,
    course: row.course as string,
    date: row.date as string,
    start_time: row.start_time as string,
    end_time: row.end_time as string,
    location: row.location as string,
    notes: row.notes as string | null,
    status: row.status as Listing['status'],
    created_by: {
      id: creator.id as string,
      full_name: creator.full_name as string,
      major: creator.major as string,
      degree: creator.degree as string,
      grade: creator.grade,
      profile_picture: creator.profile_picture as string,
    },
  };
}

export async function browseListings(course: string, userId: string | null, filters?: ListingSearchFilters) {
  const params = new URLSearchParams({ course });
  if (userId) params.set('viewer_id', userId);
  if (filters) {
    for (const key of ['major', 'date', 'start_time', 'end_time', 'location'] as const) {
      const value = filters[key].trim();
      if (value) params.set(key, value);
    }
  }

  const data = await request('/study-buddy?' + params);
  if (!Array.isArray(data.listings)) throw new Error('The backend did not return listings.');
  return data.listings
    .map(parseListing)
    .filter(item => item.status === 'open' && item.created_by.id !== userId && item.course.trim().toLowerCase() === course.trim().toLowerCase());
}

export async function sendStudyRequest(listingId: string, userId: string) {
  const data = await request('/study-buddy/' + encodeURIComponent(listingId) + '/request', 'POST', { from_user_id: userId });
  if (typeof data.request_id !== 'string' || !data.request_id) {
    throw new Error('The backend did not confirm the request. Refresh before trying again.');
  }
  return data.request_id;
}

export async function createListing(input: NewListing) {
  const data = await request('/study-buddy', 'POST', input);
  const result = parseListing(data.listing);
  if (data.listing_id !== result.id) throw new Error('The backend did not confirm the listing.');
  return result;
}
