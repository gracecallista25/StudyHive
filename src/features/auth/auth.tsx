import { useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  selectValue?: string;
  onSelectChange?: (value: string) => void;
  options?: { value: string; label: string }[];
}

export function FormField({
  label,
  name,
  error,
  hint,
  options,
  selectValue,
  onSelectChange,
  type = 'text',
  ...inputProps
}: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const id = 'auth-' + name;
  const describedBy = [hint && id + '-hint', error && id + '-error'].filter(Boolean).join(' ') || undefined;

  function togglePasswordVisibility() {
    setVisible(current => !current);
  }

  return (
    <div className={'auth-field' + (error ? ' has-error' : '')}>
      <label htmlFor={id}>{label}</label>
      <div className="auth-control">
        {options ? (
          <>
            <select
              id={id}
              name={name}
              required={inputProps.required}
              disabled={inputProps.disabled}
              value={selectValue}
              defaultValue={selectValue === undefined ? '' : undefined}
              onChange={event => onSelectChange?.(event.target.value)}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            >
              <option value="" disabled>{inputProps.placeholder ?? 'Choose an option'}</option>
              {options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
            <ChevronDown size={17} className="auth-chevron" />
          </>
        ) : (
          <input
            {...inputProps}
            id={id}
            name={name}
            type={isPassword && visible ? 'text' : type}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={isPassword ? 'password-input' : ''}
          />
        )}
        {isPassword && (
          <button
            className="password-toggle"
            type="button"
            aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()}
            aria-pressed={visible}
            onClick={togglePasswordVisibility}
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
      {hint && <p id={id + '-hint'} className="field-hint">{hint}</p>}
      {error && <p id={id + '-error'} className="field-error">{error}</p>}
    </div>
  );
}

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

// Presentation-only feedback. The backend must enforce its own validation rules.
export function formErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
    if (!element.validity.valid) errors[element.name] = element.validationMessage;
    else if (element.required && !element.value.trim()) errors[element.name] = 'Please fill in this field.';
  }
  const password = form.elements.namedItem('password') as HTMLInputElement | null;
  const confirmation = form.elements.namedItem('confirm_password') as HTMLInputElement | null;
  if (password && confirmation && confirmation.value && password.value !== confirmation.value) {
    errors.confirm_password = 'Your passwords do not match.';
  }
  const first = form.elements.namedItem(Object.keys(errors)[0] ?? '');
  if (first instanceof HTMLElement) first.focus();
  return errors;
}

export const registrationEnabled = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

interface AuthResponse {
  status?: unknown;
  reason?: unknown;
  user_id?: unknown;
  user?: { id?: unknown };
}

// UI transport only; FastAPI owns validation and accounts.
async function submitAccount(endpoint: 'register' | 'login', input: LoginInput | RegisterInput): Promise<string> {
  const action = endpoint === 'register' ? 'registration' : 'login';
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) throw new Error('The backend is not connected yet.');

  let response: Response;
  try {
    response = await fetch(base + '/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Could not confirm ' + action + '. Check that the backend is running and try again.');
  }

  let result: AuthResponse;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an unexpected response. Please try again.');
  }
  if (result?.status === 'failed' && typeof result.reason === 'string') throw new Error(result.reason);
  if (!response.ok) {
    throw new Error(response.status === 422
      ? 'The server could not accept these details. Please check the form.'
      : 'The server is unavailable right now. Please try again.');
  }
  if (result?.status !== 'success' || typeof result.user_id !== 'string' || result.user?.id !== result.user_id) {
    throw new Error('The server did not confirm ' + action + '. Please try again.');
  }
  return result.user_id;
}

export const registerAccount = (input: RegisterInput) => submitAccount('register', input);
export const loginAccount = (input: LoginInput) => submitAccount('login', input);


