import type { Degree } from '../auth/authTypes';
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
