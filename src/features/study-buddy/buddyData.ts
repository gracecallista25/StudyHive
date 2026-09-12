import type { Student } from './studentTypes';
import { students } from './students';
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
