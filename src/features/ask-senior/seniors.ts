import type { Student } from '../study-buddy/studyBuddy';

export interface Senior {
  picture?: string;
  availabilityText?: string;
  id: string;
  name: string;
  major: string;
  year: number;
  avatar: Student['avatar'];
  available: boolean;
  summary: string;
  bio: string;
  tags: string[];
  courses: string[];
  topics: { title: string; description: string }[];
  suggestions: { question: string; topic: string }[];
}

export const seniorsConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

async function seniorRequest(path: string, method = 'GET', body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  const response = await fetch(base + path, {
    method, signal: AbortSignal.timeout(15000),
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error('The senior request failed. Please try again.');
  const data = await response.json();
  if (data.status !== 'success') throw new Error(data.reason || 'The request could not be confirmed.');
  return data;
}

interface ApiSenior {
  user_id: string; full_name: string; major: string; year_of_study: number;
  courses: string[]; topics: string[]; bio: string; availability_text: string; available: boolean; profile_picture: string;
}

function readSenior(profile: ApiSenior): Senior {
  return { id: profile.user_id, name: profile.full_name, major: profile.major, year: profile.year_of_study,
    courses: profile.courses, topics: profile.topics.map(title => ({ title, description: '' })), bio: profile.bio,
    summary: profile.availability_text, availabilityText: profile.availability_text, available: profile.available,
    picture: profile.profile_picture, avatar: 'lin', tags: profile.courses, suggestions: [] };
}

export async function loadSeniors() {
  const data = await seniorRequest('/seniors');
  return (data.seniors as ApiSenior[]).map(readSenior);
}

export function seniorApplication(senior: Senior): SeniorApplication {
  return { name: senior.name, major: senior.major, year: String(senior.year), courses: senior.courses.join(', '),
    topics: senior.topics.map(topic => topic.title).join(', '), experience: senior.bio, availability: senior.availabilityText || '' };
}

export async function publishSenior(userId: string, application: SeniorApplication) {
  const split = (text: string) => [...new Set(text.split(',').map(value => value.trim()).filter(Boolean))];
  const courses = split(application.courses);
  if (!courses.length) throw new Error('List at least one course you can help with.');
  const data = await seniorRequest('/seniors', 'POST', { user_id: userId, full_name: application.name,
    major: application.major, year_of_study: Number(application.year), courses, topics: split(application.topics),
    bio: application.experience, availability_text: application.availability });
  return readSenior(data.senior);
}

export async function sendSeniorQuestion(id: string, userId: string, question: SeniorQuestion) {
  await seniorRequest('/seniors/' + encodeURIComponent(id) + '/questions', 'POST', {
    from_user_id: userId, topic: question.topic, question: question.message,
  });
}

export async function updateSeniorAvailability(userId: string, available: boolean) {
  const data = await seniorRequest('/seniors/' + encodeURIComponent(userId) + '/availability', 'PATCH', { available });
  return readSenior(data.senior);
}

export interface AskedQuestion { question_id: string; topic: string; question: string; answer: string | null; status: string }
export async function loadAskedQuestions(userId: string): Promise<AskedQuestion[]> {
  return (await seniorRequest('/questions/asked/' + encodeURIComponent(userId))).questions;
}

export interface SeniorQuestion {
  topic: string;
  message: string;
}

// Fictional examples, independent of real profiles or availability.
export const seniors: Senior[] = [
  {
    id: 'lin',
    name: 'Lin Chen',
    major: 'Computer Science',
    year: 4,
    avatar: 'lin',
    available: true,
    summary: 'A friendly guide to algorithms and your first internship.',
    bio: 'I remember how overwhelming the first few semesters felt. I’m happy to share what helped me with courses, projects, and finding my first internship.',
    tags: ['Algorithms', 'Internships'],
    courses: ['Data Structures', 'Algorithms'],
    topics: [
      { title: 'Algorithms & data structures', description: 'Approaches, practice resources, and tricky concepts.' },
      { title: 'Your first internship', description: 'Preparing a résumé and getting started with applications.' },
      { title: 'Course planning', description: 'Balancing your workload and choosing what to explore.' },
    ],
    suggestions: [
      { question: 'How did you prepare for your first technical interview?', topic: 'Your first internship' },
      { question: 'What helped you understand recursion?', topic: 'Algorithms & data structures' },
    ],
  },
  {
    id: 'maya',
    name: 'Maya Tan',
    major: 'Design',
    year: 3,
    avatar: 'maya',
    available: true,
    summary: 'Make sense of your portfolio and find your design direction.',
    bio: 'I enjoy turning rough ideas into clear, useful designs. I’m happy to talk through your portfolio, share my process, or help you find a starting point for a project.',
    tags: ['Portfolio', 'UI design'],
    courses: ['Interaction Design', 'Visual Communication'],
    topics: [
      { title: 'Portfolio feedback', description: 'Choosing projects and telling the story behind your work.' },
      { title: 'UI design', description: 'Layouts, visual hierarchy, and making interfaces easier to use.' },
      { title: 'Creative projects', description: 'Finding your direction and working with a team.' },
    ],
    suggestions: [
      { question: 'How do I choose which projects to put in my portfolio?', topic: 'Portfolio feedback' },
      { question: 'Where should I start when designing my first app?', topic: 'UI design' },
    ],
  },
  {
    id: 'alex',
    name: 'Alex Wu',
    major: 'Mathematics',
    year: 4,
    avatar: 'alex',
    available: true,
    summary: 'Work through tricky concepts, one clear step at a time.',
    bio: 'Math started to click for me when I learned to connect the ideas behind the formulas. I can share study approaches and resources that helped me get there.',
    tags: ['Linear Algebra', 'Exam prep'],
    courses: ['Linear Algebra', 'Calculus'],
    topics: [
      { title: 'Linear algebra', description: 'Building intuition for vectors, matrices, and transformations.' },
      { title: 'Exam preparation', description: 'Practice routines and reviewing mistakes effectively.' },
      { title: 'Study resources', description: 'Finding explanations that work for your learning style.' },
    ],
    suggestions: [
      { question: 'How can I build intuition for eigenvectors?', topic: 'Linear algebra' },
      { question: 'How did you organise your revision before exams?', topic: 'Exam preparation' },
    ],
  },
  {
    id: 'yuna',
    name: 'Yuna Park',
    major: 'Engineering',
    year: 3,
    avatar: 'yuna',
    available: true,
    summary: 'Get practical advice on projects and settling into campus life.',
    bio: 'Some of my favourite learning moments happened outside the classroom. I’m happy to share what I’ve learned from student projects and finding my place on campus.',
    tags: ['Projects', 'Campus life'],
    courses: ['Engineering Design', 'Physics'],
    topics: [
      { title: 'Student projects', description: 'Starting small, finding teammates, and building something useful.' },
      { title: 'Campus life', description: 'Getting involved and finding a routine that works for you.' },
      { title: 'Course planning', description: 'Making room for both coursework and personal projects.' },
    ],
    suggestions: [
      { question: 'How did you find teammates for your first project?', topic: 'Student projects' },
      { question: 'How do you balance coursework and campus activities?', topic: 'Campus life' },
    ],
  },
  {
    id: 'jun',
    name: 'Jun Li',
    major: 'Computer Science',
    year: 4,
    avatar: 'alex',
    available: false,
    summary: 'Practical lessons from building and testing backend services.',
    bio: 'I’m currently focused on my final-year project and have paused new questions. My interests include databases and reliable software.',
    tags: ['Databases', 'Backend'],
    courses: ['Databases'],
    topics: [{ title: 'Backend projects', description: 'Designing and testing small, reliable services.' }],
    suggestions: [],
  },
];
export interface SeniorApplication {
  name: string;
  major: string;
  year: string;
  courses: string;
  topics: string;
  experience: string;
  availability: string;
}

export const seniorCourses = [...new Set(seniors.flatMap(senior => senior.courses))].sort();
export const seniorMajors = [...new Set(seniors.map(senior => senior.major))].sort();

export function seniorMatchesFilters(senior: Senior, search: string, course: string, major: string, availableOnly: boolean) {
  if (seniorsConnected) {
    const text = [senior.name, senior.bio, ...senior.courses, ...senior.topics.map(topic => topic.title)].join(' ').toLowerCase();
    return text.includes(search.trim().toLowerCase())
      && (!course || senior.courses.some(value => value.toLowerCase().includes(course.toLowerCase())))
      && (!major || senior.major.toLowerCase() === major.toLowerCase())
      && (!availableOnly || senior.available);
  }
  const searchableText = [senior.name, senior.major, senior.summary, ...senior.tags, ...senior.topics.map(topic => topic.title)].join(' ').toLowerCase();
  return searchableText.includes(search.trim().toLowerCase())
    && (!course || senior.courses.includes(course))
    && (!major || senior.major === major)
    && (!availableOnly || senior.available);
}


