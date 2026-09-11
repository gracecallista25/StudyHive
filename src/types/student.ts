// Frontend display contracts only. Persistence and business rules belong to the backend team.
export type StudyStyle = 'discussion' | 'quiet' | 'practice';
export type Availability = 'evenings' | 'afternoons' | 'weekends';
export interface Student {
  id: string;
  name: string;
  major: string;
  entryYear: number;
  course: string;
  availabilityLabel: string;
  availability: Availability[];
  freeTonight: boolean; // Static demo flag, not a live availability calculation.
  studyStyle: StudyStyle;
  studyStyleLabel: string;
  tags: string[];
  quote: string;
  bio: string;
  studyGoal: string;
  preferredPlace: string;
  avatar: 'lin' | 'maya' | 'alex' | 'yuna';
}
export interface StudentFilters {
  course: string;
  availability: string;
  studyStyle: string;
  entryYear: string;
  major: string;
  freeTonight: boolean;
}
