import type { Student } from '../study-buddy/studentTypes';

export interface Senior {
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
