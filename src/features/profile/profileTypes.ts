export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  major: string;
  degree: string;
  grade: number;
  description: string;
  profile_picture: string;
  badges_earned: string[];
  badges_displayed: string[];
}
export interface ProfileUpdate { description: string; profile_picture: string }
export interface ProfileBadge { name: string; description: string }
export type BadgeCatalogue = Record<string, ProfileBadge>;
