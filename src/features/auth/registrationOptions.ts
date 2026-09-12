import type { Degree } from './authTypes';

// Exact choices from the teammate's FastAPI registration contract.
export const degreeOptions = [
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
];
export const maxYearByDegree: Record<Degree, number> = { bachelor: 5, master: 3 };

export const majorsByDegree: Record<Degree, string[]> = {
  bachelor: [
    'Computer Science', 'Robot Engineering', 'Architecture', 'Electronic Engineering',
    'Business Administration', 'Mechanical Engineering', 'Economy', 'Civil Engineering',
  ].sort(),
  master: [
    'Computer Technology', 'Communication Engineering', 'Architecture', 'Electronic Engineering',
    'Business Administration', 'Mechanical Engineering', 'Economy', 'Civil Engineering',
    'Environmental Engineering', 'Power Engineering', 'Biomedical Engineering', 'Chemistry',
    'Urban-Rural Planning',
  ].sort(),
};
