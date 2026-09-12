import type { Student } from '../study-buddy/studentTypes';

export type ProjectArt = 'connect' | 'planner' | 'leaf' | 'code';

export interface ProjectRole {
  title: string;
  description: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  type: string;
  stage: string;
  commitment: string;
  artwork: ProjectArt;
  roles: ProjectRole[];
  team: { name: string; role: string; avatar: Student['avatar'] }[];
}

export const projectTypes = ['Campus tool', 'Research', 'Hackathon', 'Personal project'];

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
