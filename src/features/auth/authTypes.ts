export type Degree = 'bachelor' | 'master';
export interface LoginInput {
  student_id: string;
  password: string;
}
export interface RegisterInput extends LoginInput {
  full_name: string;
  email: string;
  major: string;
  degree: Degree;
  grade: number;
}
// Confirm password belongs only to the form, never the API payload.
export interface RegisteredUser extends Omit<RegisterInput, 'password'> { id: string }
export type RegisterResponse =
  | { status: 'success'; user_id: string; user: RegisteredUser }
  | { status: 'failed'; reason: string };
