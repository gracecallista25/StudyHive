import type { Student } from '../study-buddy/studyBuddy';

export type ProjectArt = 'connect' | 'planner' | 'leaf' | 'code';

export interface ProjectRole {
  title: string;
  description: string;
  skills: string[];
}

export interface Project {
  allSkills?: string[];
  creatorId?: string;
  status?: string;
  id: string;
  title: string;
  summary: string;
  description: string;
  type: string;
  stage: string;
  commitment: string;
  artwork: ProjectArt;
  roles: ProjectRole[];
  team: { name: string; role: string; avatar: Student['avatar']; picture?: string }[];
}

export const projectTypes = ['Class project', 'Event', 'Hackathon', 'Research', 'Startup idea', 'Personal project', 'Other'];

export const projectsConnected = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

async function projectRequest(path: string, method = 'GET', body?: unknown) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  const response = await fetch(base + path, {
    method, signal: AbortSignal.timeout(15000),
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`Projects API returned ${response.status}. Check that the final backend is running.`);
  const data = await response.json();
  if (data.status !== 'success') throw new Error(data.reason || 'The project request could not be confirmed.');
  return data;
}

interface ApiProject {
  id: string; name: string; summary: string; description: string; project_type: string; status: string;
  roles: { role_name: string; skills: string[]; filled: boolean }[];
  created_by: { id: string; full_name: string; profile_picture: string };
  members: { user: { full_name: string; profile_picture: string }; role_name: string }[];
}

function readProject(project: ApiProject): Project {
  return {
    id: project.id, title: project.name, summary: project.summary, description: project.description,
    type: project.project_type, creatorId: project.created_by.id, status: project.status,
    allSkills: project.roles.flatMap(role => role.skills),
    stage: project.status, commitment: 'Not specified', artwork: 'connect',
    roles: project.roles.filter(role => !role.filled).map(role => ({ title: role.role_name, skills: role.skills, description: '' })),
    team: [{ name: project.created_by.full_name, role: 'Project lead', avatar: 'lin', picture: project.created_by.profile_picture },
      ...project.members.map(member => ({ name: member.user.full_name, role: member.role_name, avatar: 'lin' as const, picture: member.user.profile_picture }))],
  };
}

export async function loadProjects() {
  const data = await projectRequest('/projects?open_only=false');
  return (data.projects as ApiProject[]).map(readProject);
}

export async function publishProject(userId: string, project: Project) {
  const data = await projectRequest('/projects', 'POST', {
    user_id: userId, name: project.title, summary: project.summary, description: project.description,
    project_type: project.type, roles: project.roles.map(role => ({ role_name: role.title, skills: role.skills })),
  });
  return readProject(data.project);
}

export async function requestProjectRole(id: string, userId: string, role: string, message: string) {
  await projectRequest('/projects/' + encodeURIComponent(id) + '/request', 'POST', { from_user_id: userId, desired_role: role, message });
}

export async function cancelProject(id: string, userId: string) {
  await projectRequest('/projects/' + encodeURIComponent(id) + '?user_id=' + encodeURIComponent(userId), 'DELETE');
}

// Fictional projects for the frontend preview. No backend requests are made.
export const initialProjects: Project[] = [
  {
    id: 'campus-connect',
    title: 'Campus Connect',
    summary: 'Help students find events and communities on campus.',
    description: 'We’re building a simple place for students to discover campus events, find communities, and make plans together.',
    type: 'Campus tool',
    stage: 'Early prototype',
    commitment: 'Flexible',
    artwork: 'connect',
    roles: [
      { title: 'Frontend developer', description: 'Build and maintain the web interface, work with our backend, and help turn ideas into a smooth user experience.', skills: ['React', 'TypeScript'] },
      { title: 'UI designer', description: 'Design a clean and intuitive interface, create key screens, and help shape our visual identity.', skills: ['UI design', 'Figma'] },
    ],
    team: [
      { name: 'Lin Chen', role: 'Project lead', avatar: 'lin' },
      { name: 'Maya Tan', role: 'Backend developer', avatar: 'maya' },
    ],
  },
  {
    id: 'study-planner',
    title: 'Study Planner',
    summary: 'A calmer way to plan assignments and study sessions.',
    description: 'Help us make a thoughtful study planner that brings assignments, deadlines, and shared sessions into one clear weekly view.',
    type: 'Campus tool',
    stage: 'Exploring ideas',
    commitment: '2–3 hours a week',
    artwork: 'planner',
    roles: [
      { title: 'Product developer', description: 'Talk to students about their routines and turn their feedback into a useful planning prototype.', skills: ['Python', 'UX research'] },
    ],
    team: [
      { name: 'Yuna Park', role: 'Project lead', avatar: 'yuna' },
      { name: 'Alex Wu', role: 'Designer', avatar: 'alex' },
    ],
  },
  {
    id: 'green-campus',
    title: 'Green Campus',
    summary: 'Turn campus sustainability data into useful insights.',
    description: 'We want to understand how our campus uses resources. Join us to explore data and design clear visual stories that help students make small, practical changes.',
    type: 'Research',
    stage: 'Collecting ideas',
    commitment: 'Flexible',
    artwork: 'leaf',
    roles: [
      { title: 'Data analyst', description: 'Explore campus data and find useful patterns to share with the community.', skills: ['Data analysis', 'Python'] },
      { title: 'Visual designer', description: 'Make our findings clear through accessible charts and visual stories.', skills: ['Design', 'Figma'] },
    ],
    team: [
      { name: 'Maya Tan', role: 'Project lead', avatar: 'maya' },
      { name: 'Lin Chen', role: 'Researcher', avatar: 'lin' },
    ],
  },
  {
    id: 'hackathon-team',
    title: 'Hackathon Team',
    summary: 'Build a practical idea for our next campus hackathon.',
    description: 'Let’s turn a small campus problem into a working demo. We’re putting together a friendly team that enjoys learning, experimenting, and building together.',
    type: 'Hackathon',
    stage: 'Forming a team',
    commitment: 'One weekend',
    artwork: 'code',
    roles: [
      { title: 'Frontend developer', description: 'Build a clear, responsive interface for our demo.', skills: ['Frontend', 'React'] },
      { title: 'Backend developer', description: 'Connect our prototype to a simple, reliable backend.', skills: ['Backend', 'Python'] },
    ],
    team: [
      { name: 'Alex Wu', role: 'Project lead', avatar: 'alex' },
      { name: 'Yuna Park', role: 'Designer', avatar: 'yuna' },
    ],
  },
  {
    id: 'campus-map',
    title: 'Campus Map',
    summary: 'A friendly guide to quiet corners and useful campus spaces.',
    description: 'Our team is building a small guide to help new students find their way around campus. The team is currently full.',
    type: 'Personal project',
    stage: 'In progress',
    commitment: 'Flexible',
    artwork: 'leaf',
    roles: [],
    team: [{ name: 'Lin Chen', role: 'Project lead', avatar: 'lin' }],
  },
];
export function getProjectSkills(projects: Project[]) {
  return [...new Set(projects.flatMap(project => project.roles.flatMap(role => role.skills)))].sort();
}

export function projectMatchesFilters(project: Project, search: string, skill: string, type: string, openOnly: boolean) {
  const searchableText = `${project.title} ${project.summary}`.toLowerCase();
  const matchesSearch = searchableText.includes(search.trim().toLowerCase());
  const skillQuery = skill.trim().toLowerCase();
  const skills = project.allSkills ?? project.roles.flatMap(role => role.skills);
  const matchesSkill = !skillQuery || skills.some(value => value.toLowerCase().includes(skillQuery));
  return matchesSearch && matchesSkill && (!type || project.type === type) && (!openOnly || project.roles.length > 0);
}


