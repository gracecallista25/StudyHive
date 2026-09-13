import type { Degree } from '../auth/auth';
// Frontend display contracts only. Persistence and business rules belong to the backend team.
export type Availability = '09:00-12:00' | '13:00-15:00' | '15:00-18:00' | '18:00-21:00' | '21:00-23:00';
export interface Student {
  id: string;
  name: string;
  major: string;
  degree: Degree;
  yearOfStudy: number;
  course: string;
  lookingFor: string;
  availability: Availability[];
  freeTonight: boolean; // Static demo flag, not a live availability calculation.
  tags: string[];
  quote: string;
  bio: string;
  studyGoal: string;
  preferredPlace: string;
  avatar: 'lin' | 'maya' | 'alex' | 'yuna';
}
export interface StudentFilters {
  degree: Degree | '';
  course: string;
  availability: string;
  yearOfStudy: string;
  major: string;
  freeTonight: boolean;
}
export const students: Student[] = [
  {
    id: 'lin', name: 'Lin Chen', major: 'Computer Science', degree: 'bachelor', yearOfStudy: 3,
    course: 'Operating Systems', lookingFor: 'A partner to work through operating systems exercises and compare solutions.',
    availability: ['18:00-21:00'], freeTonight: true,
    tags: ['Patient', 'Explains well', 'Likes coffee'], quote: 'CS is more fun with friends!',
    bio: 'I like breaking a tricky concept into small pieces, then trying it out together. Always happy to share a whiteboard.',
    studyGoal: 'Work through process scheduling and prepare for the next course quiz.',
    preferredPlace: 'Library · quiet discussion area', avatar: 'lin',
  },
  {
    id: 'maya', name: 'Maya Tan', major: 'Electronic Engineering', degree: 'master', yearOfStudy: 2,
    course: 'Signal and Systems', lookingFor: 'Someone to review signals concepts with and tackle tricky practice questions.',
    availability: ['09:00-12:00', '18:00-21:00'], freeTonight: false,
    tags: ['Organized', 'Positive', 'Research-minded'], quote: 'Good questions lead to great ideas.',
    bio: 'A little planning makes a big difference. I usually start with independent work and finish by comparing approaches.',
    studyGoal: 'Build confidence with Fourier transforms through weekly practice.',
    preferredPlace: 'Learning commons · study tables', avatar: 'maya',
  },
  {
    id: 'alex', name: 'Alex Wu', major: 'Mechanical Engineering', degree: 'bachelor', yearOfStudy: 4,
    course: 'Mechanics', lookingFor: 'A buddy to sketch mechanics problems and work through problem sets together.',
    availability: ['13:00-15:00', '15:00-18:00', '18:00-21:00'], freeTonight: true,
    tags: ['Detail-oriented', 'Chill', 'Enjoys whiteboards'], quote: 'Build things. Learn together.',
    bio: 'Sketching a problem helps me understand it. Looking for someone to compare solutions with and keep a steady study habit.',
    studyGoal: 'Practice free-body diagrams and work through mechanics problem sets.',
    preferredPlace: 'Library · group study area', avatar: 'alex',
  },
  {
    id: 'yuna', name: 'Yuna Li', major: 'Chemistry', degree: 'master', yearOfStudy: 1,
    course: 'Materials Chemistry', lookingFor: 'A study partner to review materials chemistry and prepare for our next quiz.',
    availability: ['09:00-12:00', '21:00-23:00'], freeTonight: false,
    tags: ['Supportive', 'Creative', 'Open to new friends'], quote: 'Small steps, big progress.',
    bio: 'I learn best by talking through ideas, drawing connections, and testing my understanding with a few practice questions.',
    studyGoal: 'Review bonding and crystal structures with a consistent study partner.',
    preferredPlace: 'Campus café · a quiet corner', avatar: 'yuna',
  },
];
export type StudyMode = 'Online' | 'In person' | 'Either';
export interface BuddyStudent extends Student {
  studyMode: StudyMode;
  online: boolean;
  availableToStudy: boolean;
}
// Feature-local fixtures keep Home's existing student data unchanged.
export const buddyStudents: BuddyStudent[] = [
  { ...students[0], course: 'Data Structures', lookingFor: 'A partner to practice data structures exercises together.', studyMode: 'Online', online: true, availableToStudy: true },
  { ...students[1], course: 'Electric Circuits', lookingFor: 'Someone to review circuit concepts and practice problems with.', studyMode: 'In person', online: true, availableToStudy: false },
  { ...students[2], course: 'College Physics IA', lookingFor: 'A buddy to work through physics problem sets together.', studyMode: 'Either', online: false, availableToStudy: true },
  { ...students[3], course: 'Life And Health Science', lookingFor: 'A study partner to review life and health science concepts.', studyMode: 'In person', online: true, availableToStudy: true },
  { ...students[0], course: 'Data Structures', id: 'sam', name: 'Sam Liu', studyMode: 'Either', online: false, availableToStudy: true,
    lookingFor: 'Someone to compare data structures exercises with at a relaxed pace.' },
  { ...students[0], course: 'Data Structures', id: 'jo', name: 'Jo Wang', studyMode: 'Online', online: true, availableToStudy: false,
    lookingFor: 'A partner for a future data structures review session.' },
];
export const courses = ['Pre-Calculus', 'Calculus', 'Linear Algebra', 'College Physics IA', 'Electric Circuits', 'College Physics IB', 'Fundamentals of Electronic Technology', 'High-level Language Programming (C++)', 'Data Structures', 'Computer Networks', 'Probability and Statistics', 'Life And Health Science', 'Chinese Language'];
export function matchStudents(course: string, mode: StudyMode, courseOnly = false) {
  return buddyStudents.filter(student => student.course === course &&
    (courseOnly || mode === 'Either' || student.studyMode === 'Either' || student.studyMode === mode))
    .sort((a, b) => Number(b.availableToStudy) - Number(a.availableToStudy) || Number(b.online) - Number(a.online));
}


// Additional fictional classmates: two per course, with Either supporting both modes.
const courseExamples: [string, string, string, string][] = [
  ['Pre-Calculus', 'Ethan Zhang', 'Nina Zhou', 'Review functions, graphs, and trigonometry before calculus.'],
  ['Calculus', 'Ava Liu', 'Leo Huang', 'Practice limits, derivatives, and integration together.'],
  ['Linear Algebra', 'Iris Wang', 'Ryan Xu', 'Work through matrices, vector spaces, and eigenvalues.'],
  ['College Physics IA', 'Chloe Lin', 'Oscar Sun', 'Compare solutions to mechanics and motion problems.'],
  ['Electric Circuits', 'Daniel He', 'Sophie Gu', 'Practice circuit analysis and Kirchhoff’s laws together.'],
  ['College Physics IB', 'Lucas Zhao', 'Ella Tang', 'Review electricity, magnetism, and wave problems.'],
  ['Fundamentals of Electronic Technology', 'Grace Wu', 'Henry Luo', 'Review diodes, transistors, and basic digital circuits.'],
  ['High-level Language Programming (C++)', 'Mia Chen', 'Noah Li', 'Practice C++ functions, classes, and debugging exercises.'],
  ['Computer Networks', 'Alice Feng', 'Ben Yu', 'Review network layers, routing, and TCP/IP concepts.'],
  ['Probability and Statistics', 'Lily Zheng', 'Eric Han', 'Compare solutions for probability distributions and hypothesis tests.'],
  ['Life And Health Science', 'Zoe Jiang', 'Adam Wei', 'Review human biology and discuss health science concepts.'],
  ['Chinese Language', 'Emma Gao', 'Jack Shen', 'Practice Chinese conversation, vocabulary, and reading together.'],
];
for (const [courseIndex, [course, first, second, lookingFor]] of courseExamples.entries()) {
  for (const [personIndex, name] of [first, second].entries()) {
    const template = students[(courseIndex + personIndex) % students.length];
    buddyStudents.push({
      ...template,
      id: `course-example-${courseIndex}-${personIndex}`,
      name, course, lookingFor,
      studyMode: 'Either',
      online: personIndex === 0,
      availableToStudy: true,
      bio: `I enjoy learning with classmates. ${lookingFor}`,
      studyGoal: lookingFor,
    });
  }
}
export const studyBuddyConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

export async function loadCourses() {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) return courses;
  const response = await fetch(base + '/courses', { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (data.status !== 'success' || !Array.isArray(data.courses)) throw new Error('Courses could not be loaded.');
  return data.courses.filter((course: unknown): course is string => typeof course === 'string');
}

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
    .filter(item => item.status === 'open' && item.created_by.id !== userId);
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
export type SearchListing = Listing & { example?: { avatar: Student['avatar']; time: string; mode: string } };
export function exampleListings(course: string, filters: ListingSearchFilters): SearchListing[] {
  if (filters.date) return [];
  return buddyStudents.filter(student => student.course === course
    && (!filters.major || student.major === filters.major)
    && (!filters.location.trim() || student.preferredPlace.toLowerCase().includes(filters.location.trim().toLowerCase()))
    && (!filters.start_time || student.availability.some(slot => { const [start, end] = slot.split('-'); return start < filters.end_time && end > filters.start_time; }))).map(student => ({
      id: `example:${student.id}`, course: student.course, date: '', start_time: '', end_time: '', location: student.preferredPlace, notes: student.lookingFor, status: 'open',
      created_by: { id: `example:${student.id}`, full_name: student.name, major: student.major, degree: student.degree, grade: student.yearOfStudy, profile_picture: '' },
      example: { avatar: student.avatar, time: student.availability.join(', '), mode: student.studyMode },
    }));
}

