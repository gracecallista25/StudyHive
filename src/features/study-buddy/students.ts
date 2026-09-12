import type { Student } from './studentTypes';
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
